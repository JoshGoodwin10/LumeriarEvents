// routes/scores.js
const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/scores/event/:eventId - all scores for an event (with team & judge details)
router.get("/event/:eventId", async (req, res) => {
    const { eventId } = req.params;
    try {
        const [scores] = await db.execute(`
            SELECT s.*, 
                   t.team_id, t.team_name,
                   j.first_name AS judge_first, j.surname AS judge_surname
            FROM score s
            JOIN event_team et ON s.event_team_id = et.event_team_id
            JOIN team t ON et.team_id = t.team_id
            JOIN judge j ON s.judge_id = j.judge_id
            WHERE et.event_id = ?
            ORDER BY t.team_name, s.round
        `, [eventId]);
        res.json(scores);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch scores." });
    }
});

// POST /api/scores/:eventId/scores – old route (kept for compatibility)
router.post("/:eventId/scores", async (req, res) => {
    const { eventId } = req.params;
    const { team_id, round, judge_id, technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score, change_reason } = req.body;

    if (!team_id || !round || !judge_id) {
        return res.status(400).json({ message: "team_id, round, and judge_id are required." });
    }

    try {
        const [etRows] = await db.execute(
            "SELECT event_team_id FROM event_team WHERE event_id = ? AND team_id = ?",
            [eventId, team_id]
        );
        if (etRows.length === 0) {
            return res.status(404).json({ message: "Team is not part of this event." });
        }
        const event_team_id = etRows[0].event_team_id;

        const [existing] = await db.execute(
            "SELECT * FROM score WHERE event_team_id = ? AND round = ? AND judge_id = ?",
            [event_team_id, round, judge_id]
        );

        if (existing.length === 0) {
            const [result] = await db.execute(`
                INSERT INTO score 
                (event_team_id, round, judge_id, technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [event_team_id, round, judge_id, technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score]);
            const newScoreId = result.insertId;

            await db.execute(`
                INSERT INTO score_history (score_id, judge_id, change_reason, 
                    new_technical_score, new_innovation_design_score, new_theme_score, new_real_world_score, new_teamwork_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [newScoreId, judge_id, change_reason || "Initial score",
                technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score]);
        } else {
            const old = existing[0];
            await db.execute(`
                UPDATE score SET
                    technical_score = ?,
                    innovation_design_score = ?,
                    theme_score = ?,
                    real_world_score = ?,
                    teamwork_score = ?
                WHERE score_id = ?
            `, [technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score, old.score_id]);

            const changes = [];
            if (old.technical_score !== technical_score) changes.push(`technical_score: ${old.technical_score} -> ${technical_score}`);
            if (old.innovation_design_score !== innovation_design_score) changes.push(`innovation_design_score: ${old.innovation_design_score} -> ${innovation_design_score}`);
            if (old.theme_score !== theme_score) changes.push(`theme_score: ${old.theme_score} -> ${theme_score}`);
            if (old.real_world_score !== real_world_score) changes.push(`real_world_score: ${old.real_world_score} -> ${real_world_score}`);
            if (old.teamwork_score !== teamwork_score) changes.push(`teamwork_score: ${old.teamwork_score} -> ${teamwork_score}`);

            if (changes.length > 0) {
                await db.execute(`
                    INSERT INTO score_history 
                    (score_id, judge_id, change_reason,
                     old_technical_score, new_technical_score,
                     old_innovation_design_score, new_innovation_design_score,
                     old_theme_score, new_theme_score,
                     old_real_world_score, new_real_world_score,
                     old_teamwork_score, new_teamwork_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [old.score_id, judge_id, change_reason || changes.join('; '),
                old.technical_score, technical_score,
                old.innovation_design_score, innovation_design_score,
                old.theme_score, theme_score,
                old.real_world_score, real_world_score,
                old.teamwork_score, teamwork_score]);
            }
        }

        await recalcTeamTotalPoints(event_team_id);
        res.json({ message: "Score saved successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save score." });
    }
});

// Helper: recalc total_points for an event_team
async function recalcTeamTotalPoints(event_team_id) {
    const [rows] = await db.execute(`
        SELECT SUM(
            COALESCE(technical_score,0) + 
            COALESCE(innovation_design_score,0) + 
            COALESCE(theme_score,0) + 
            COALESCE(real_world_score,0) + 
            COALESCE(teamwork_score,0)
        ) AS total
        FROM score
        WHERE event_team_id = ?
    `, [event_team_id]);
    const total = rows[0].total || 0;
    await db.execute("UPDATE event_team SET total_points = ? WHERE event_team_id = ?", [total, event_team_id]);
}

// PUT /api/scores/:scoreId/approve – corrected path (removed extra /scores)
router.put("/:scoreId/approve", async (req, res) => {
    const { scoreId } = req.params;
    try {
        const [score] = await db.execute("SELECT event_team_id FROM score WHERE score_id = ?", [scoreId]);
        if (score.length === 0) return res.status(404).json({ message: "Score not found." });
        await db.execute("UPDATE score SET is_approved = TRUE WHERE score_id = ?", [scoreId]);
        await recalcTeamTotalPoints(score[0].event_team_id);
        res.json({ message: "Score approved." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to approve score." });
    }
});

// GET /api/scores/:scoreId/history – corrected path (removed extra /scores)
router.get("/:scoreId/history", async (req, res) => {
    const { scoreId } = req.params;
    try {
        const [history] = await db.execute(`
            SELECT h.*, j.first_name, j.surname
            FROM score_history h
            JOIN judge j ON h.judge_id = j.judge_id
            WHERE h.score_id = ?
            ORDER BY h.change_date DESC
        `, [scoreId]);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch history." });
    }
});

// PUT /api/scores/assign-team-judge
router.put('/assign-team-judge', authMiddleware, async (req, res) => {
    const { event_team_id, judge_id } = req.body;
    if (!event_team_id || !judge_id) {
        return res.status(400).json({ message: 'event_team_id and judge_id are required.' });
    }
    try {
        const [judgeRows] = await db.execute('SELECT judge_id FROM judge WHERE judge_id = ?', [judge_id]);
        if (judgeRows.length === 0) {
            return res.status(404).json({ message: 'Judge not found.' });
        }
        await db.execute(
            'UPDATE score SET judge_id = ? WHERE event_team_id = ?',
            [judge_id, event_team_id]
        );
        res.json({ message: 'Judge assigned to team for all rounds.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to assign judge.' });
    }
});

// POST /api/scores - create/update a score using event_team_id (main endpoint)
router.post("/", async (req, res) => {
    const {
        event_team_id,
        round,
        judge_id,
        technical_score,
        innovation_design_score,
        theme_score,
        real_world_score,
        teamwork_score,
        change_reason   // matches database column name
    } = req.body;

    if (!event_team_id || !round || !judge_id) {
        return res.status(400).json({ message: "event_team_id, round, and judge_id are required." });
    }

    try {
        const [existing] = await db.execute(
            "SELECT * FROM score WHERE event_team_id = ? AND round = ? AND judge_id = ?",
            [event_team_id, round, judge_id]
        );

        if (existing.length === 0) {
            // Insert new score
            const [result] = await db.execute(`
                INSERT INTO score 
                (event_team_id, round, judge_id, technical_score, innovation_design_score, 
                 theme_score, real_world_score, teamwork_score, is_approved)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
            `, [event_team_id, round, judge_id, technical_score || null, innovation_design_score || null,
                theme_score || null, real_world_score || null, teamwork_score || null]);
            const newScoreId = result.insertId;

            await db.execute(`
                INSERT INTO score_history 
                (score_id, judge_id, change_reason, 
                 new_technical_score, new_innovation_design_score, new_theme_score, 
                 new_real_world_score, new_teamwork_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [newScoreId, judge_id, change_reason || "Initial score",
                technical_score || null, innovation_design_score || null, theme_score || null,
                real_world_score || null, teamwork_score || null]);
        } else {
            const old = existing[0];

            const keepOld = (incoming, oldValue) => {
                if (incoming !== undefined && incoming !== null && incoming !== '') {
                    return incoming;
                }
                return oldValue;
            };

            const newTech = keepOld(technical_score, old.technical_score);
            const newInnov = keepOld(innovation_design_score, old.innovation_design_score);
            const newTheme = keepOld(theme_score, old.theme_score);
            const newReal = keepOld(real_world_score, old.real_world_score);
            const newTeam = keepOld(teamwork_score, old.teamwork_score);

            await db.execute(`
                UPDATE score SET
                    technical_score = ?,
                    innovation_design_score = ?,
                    theme_score = ?,
                    real_world_score = ?,
                    teamwork_score = ?
                WHERE score_id = ?
            `, [newTech, newInnov, newTheme, newReal, newTeam, old.score_id]);

            const changes = [];
            if (old.technical_score !== newTech) changes.push(`technical_score: ${old.technical_score} -> ${newTech}`);
            if (old.innovation_design_score !== newInnov) changes.push(`innovation_design_score: ${old.innovation_design_score} -> ${newInnov}`);
            if (old.theme_score !== newTheme) changes.push(`theme_score: ${old.theme_score} -> ${newTheme}`);
            if (old.real_world_score !== newReal) changes.push(`real_world_score: ${old.real_world_score} -> ${newReal}`);
            if (old.teamwork_score !== newTeam) changes.push(`teamwork_score: ${old.teamwork_score} -> ${newTeam}`);

            if (changes.length > 0) {
                await db.execute(`
                    INSERT INTO score_history 
                    (score_id, judge_id, change_reason,
                     old_technical_score, new_technical_score,
                     old_innovation_design_score, new_innovation_design_score,
                     old_theme_score, new_theme_score,
                     old_real_world_score, new_real_world_score,
                     old_teamwork_score, new_teamwork_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [old.score_id, judge_id, change_reason || changes.join('; '),
                old.technical_score, newTech,
                old.innovation_design_score, newInnov,
                old.theme_score, newTheme,
                old.real_world_score, newReal,
                old.teamwork_score, newTeam]);
            }
        }

        await recalcTeamTotalPoints(event_team_id);
        res.json({ message: "Score saved successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save score." });
    }
});

// PUT /api/scores/:scoreId/appeal
router.put('/:scoreId/appeal', authMiddleware, async (req, res) => {
    const { scoreId } = req.params;
    try {
        // Ensure the score belongs to a team coached by this user
        // We'll check the team's coach_id against the authenticated user's userId (coach_id)
        const [rows] = await db.execute(
            `SELECT s.score_id, t.coach_id
       FROM score s
       JOIN event_team et ON s.event_team_id = et.event_team_id
       JOIN team t ON et.team_id = t.team_id
       WHERE s.score_id = ?`,
            [scoreId]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Score not found.' });
        const score = rows[0];
        if (score.coach_id !== req.user.userId) {
            return res.status(403).json({ message: 'You can only appeal scores for your own teams.' });
        }

        // Check if already appealed
        if (score.appeal_status !== 'none') {
            return res.status(400).json({ message: 'This score has already been appealed.' });
        }

        // Update appeal status
        await db.execute(
            'UPDATE score SET appeal_status = ? WHERE score_id = ?',
            ['pending', scoreId]
        );

        res.json({ message: 'Appeal submitted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to submit appeal.' });
    }
});

module.exports = router; 