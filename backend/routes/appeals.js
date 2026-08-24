const express = require('express');
const multer = require('multer');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Multer config for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ─── Coach: Submit appeal ─────────────────────────────────────
// POST /api/appeals
// Body: { score_id, grounds, file }
router.post('/', upload.single('evidence'), async (req, res) => {
    const { score_id, grounds } = req.body;
    const coachId = req.user.userId; // from JWT (should be coach_id)
    const file = req.file;

    if (!score_id || !grounds) {
        return res.status(400).json({ message: 'Score ID and grounds are required.' });
    }

    try {
        // 1. Verify the score exists and belongs to a team coached by this coach
        const [scoreRows] = await db.execute(
            `SELECT s.score_id, s.is_approved, t.coach_id
             FROM score s
             JOIN event_team et ON s.event_team_id = et.event_team_id
             JOIN team t ON et.team_id = t.team_id
             WHERE s.score_id = ?`,
            [score_id]
        );
        if (scoreRows.length === 0) {
            return res.status(404).json({ message: 'Score not found.' });
        }
        const score = scoreRows[0];
        if (score.coach_id !== coachId) {
            return res.status(403).json({ message: 'You can only appeal scores for your own teams.' });
        }
        if (score.is_approved === 1) {
            return res.status(400).json({ message: 'You cannot appeal an already approved score.' });
        }

        // 2. Check if an appeal already exists for this score
        const [existing] = await db.execute('SELECT status FROM appeal WHERE score_id = ?', [score_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'An appeal already exists for this score.' });
        }

        // 3. Insert appeal
        const evidenceFilename = file ? file.originalname : null;
        const evidenceData = file ? file.buffer : null;
        const [result] = await db.execute(
            `INSERT INTO appeal (score_id, coach_id, grounds, evidence_filename, evidence_data, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [score_id, coachId, grounds, evidenceFilename, evidenceData]
        );

        // 4. Update Score's appeal_status to 'pending'
        await db.execute('UPDATE score SET appeal_status = ? WHERE score_id = ?', ['pending', score_id]);

        res.status(201).json({ message: 'Appeal submitted successfully.', appeal_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to submit appeal.' });
    }
});

// ─── Head Judge: View appeals for an event ──────────────────
// GET /api/appeals/event/:eventId
router.get('/event/:eventId', async (req, res) => {
    const { eventId } = req.params;
    try {
        const [appeals] = await db.execute(
            `SELECT a.*, s.round, s.technical_score, s.innovation_design_score,
                    s.theme_score, s.real_world_score, s.teamwork_score,
                    t.team_name, c.first_name AS coach_first, c.surname AS coach_surname
             FROM appeal a
             JOIN score s ON a.score_id = s.score_id
             JOIN event_team et ON s.event_team_id = et.event_team_id
             JOIN team t ON et.team_id = t.team_id
             JOIN coach c ON a.coach_id = c.coach_id
             WHERE et.event_id = ?
             ORDER BY a.created_at DESC`,
            [eventId]
        );
        res.json(appeals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch appeals.' });
    }
});

// ─── Head Judge: Approve/Reject appeal and optionally update score ──
// PUT /api/appeals/:appealId
// Body: { status, head_judge_comment, new_technical_score, new_innovation_design_score, etc. }
router.put('/:appealId', async (req, res) => {
    const { appealId } = req.params;
    const { status, head_judge_comment, ...scoreUpdates } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status must be "approved" or "rejected".' });
    }

    try {
        // 1. Get the appeal and its score
        const [appealRows] = await db.execute('SELECT score_id FROM appeal WHERE appeal_id = ?', [appealId]);
        if (appealRows.length === 0) return res.status(404).json({ message: 'Appeal not found.' });
        const scoreId = appealRows[0].score_id;

        // 2. Update appeal
        await db.execute(
            `UPDATE appeal SET status = ?, head_judge_comment = ? WHERE appeal_id = ?`,
            [status, head_judge_comment || null, appealId]
        );

        // 3. If approved, optionally update score (if fields provided)
        if (status === 'approved') {
            // Build update query for score
            const fields = [];
            const values = [];
            if (scoreUpdates.new_technical_score !== undefined) {
                fields.push('technical_score = ?');
                values.push(scoreUpdates.new_technical_score);
            }
            if (scoreUpdates.new_innovation_design_score !== undefined) {
                fields.push('innovation_design_score = ?');
                values.push(scoreUpdates.new_innovation_design_score);
            }
            if (scoreUpdates.new_theme_score !== undefined) {
                fields.push('theme_score = ?');
                values.push(scoreUpdates.new_theme_score);
            }
            if (scoreUpdates.new_real_world_score !== undefined) {
                fields.push('real_world_score = ?');
                values.push(scoreUpdates.new_real_world_score);
            }
            if (scoreUpdates.new_teamwork_score !== undefined) {
                fields.push('teamwork_score = ?');
                values.push(scoreUpdates.new_teamwork_score);
            }
            if (fields.length > 0) {
                const query = `UPDATE score SET ${fields.join(', ')} WHERE score_id = ?`;
                values.push(scoreId);
                await db.execute(query, values);
            }
            // Mark score as locked (no further appeals)
            await db.execute('UPDATE score SET appeal_status = ? WHERE score_id = ?', ['approved', scoreId]);
            // Also, if score was not approved, approve it? We assume it was already approved.
            // Optionally, you could also set is_approved = 1 here if not.
            await db.execute('UPDATE score SET is_approved = 1 WHERE score_id = ?', [scoreId]);
        } else {
            // Rejected: update appeal_status to 'rejected'
            await db.execute('UPDATE score SET appeal_status = ? WHERE score_id = ?', ['rejected', scoreId]);
        }

        res.json({ message: `Appeal ${status}.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to process appeal.' });
    }
});

// ─── Coach: Get my team scores with appeal info ───────────────
// GET /api/appeals/coach/teams
router.get('/coach/teams', async (req, res) => {
    const coachId = req.user.userId;
    try {
        const [teams] = await db.execute(
            `SELECT t.team_id, t.team_name, et.event_id, e.name AS event_name
             FROM team t
             JOIN event_team et ON t.team_id = et.team_id
             JOIN event e ON et.event_id = e.event_id
             WHERE t.coach_id = ?`,
            [coachId]
        );
        const result = [];
        for (const team of teams) {
            const [scores] = await db.execute(
                `SELECT s.score_id, s.round, s.technical_score, s.innovation_design_score,
            s.theme_score, s.real_world_score, s.teamwork_score, s.is_approved,
            s.appeal_status,
            a.appeal_id, a.grounds, a.evidence_filename, a.head_judge_comment
     FROM score s
     LEFT JOIN appeal a ON s.score_id = a.score_id
     WHERE s.event_team_id = (SELECT event_team_id FROM event_team WHERE team_id = ? AND event_id = ?)
     ORDER BY s.round`,
                [team.team_id, team.event_id]
            );
            const total = scores.reduce((sum, s) => sum + (s.technical_score || 0) + (s.innovation_design_score || 0) + (s.theme_score || 0) + (s.real_world_score || 0) + (s.teamwork_score || 0), 0);
            result.push({
                team_id: team.team_id,
                team_name: team.team_name,
                event_id: team.event_id,
                event_name: team.event_name,
                scores,
                overall_total: total,
            });
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch team scores.' });
    }
});

// ─── Download evidence file ────────────────────────────────────
// GET /api/appeals/:appealId/download
router.get('/:appealId/download', async (req, res) => {
    const { appealId } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT evidence_filename, evidence_data FROM appeal WHERE appeal_id = ?',
            [appealId]
        );
        if (rows.length === 0 || !rows[0].evidence_data) {
            return res.status(404).json({ message: 'Evidence file not found.' });
        }
        const { evidence_filename, evidence_data } = rows[0];
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${evidence_filename}"`);
        res.send(evidence_data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to download evidence.' });
    }
});

module.exports = router;