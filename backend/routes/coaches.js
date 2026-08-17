const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/coaches - with filters and join to School for school_name
router.get("/", async (req, res) => {
    try {
        const { search, school_id } = req.query;
        let query = `
            SELECT coach.*, school.school_name
            FROM coach
            LEFT JOIN school ON coach.school_id = school.school_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += " AND (coach.first_name LIKE ? OR coach.surname LIKE ? OR coach.email LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like, like);
        }
        if (school_id) {
            query += " AND coach.school_id = ?";
            params.push(school_id);
        }

        query += " ORDER BY coach.created_at DESC";
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch coaches." });
    }
});

// GET /api/coaches/filter-options
router.get("/filter-options", async (req, res) => {
    try {
        const [schools] = await db.execute("SELECT school_id, school_name FROM school ORDER BY school_name");
        res.json({ schools });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
});

// GET /api/coaches/:id
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM coach WHERE coach_id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Coach not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch coach." });
    }
});

// POST /api/coaches
router.post("/", async (req, res) => {
    const {
        first_name, surname, email, phone_no, date_of_birth,
        staff_number, dietary_requirements, shirt_size,
        signed_integrity_declaration, school_id
    } = req.body;
    if (!first_name || !surname) {
        return res.status(400).json({ message: "First name and surname are required." });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO coach 
            (first_name, surname, email, phone_no, date_of_birth, 
             staff_number, dietary_requirements, shirt_size, signed_integrity_declaration, school_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                first_name, surname,
                email || null,
                phone_no || null,
                date_of_birth || null,
                staff_number || null,
                dietary_requirements || null,
                shirt_size || null,
                signed_integrity_declaration || null,
                school_id || null
            ]
        );
        res.status(201).json({ message: "Coach created.", coach_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create coach." });
    }
});

// PUT /api/coaches/:id
router.put("/:id", async (req, res) => {
    const {
        first_name, surname, email, phone_no, date_of_birth,
        staff_number, dietary_requirements, shirt_size,
        signed_integrity_declaration, school_id
    } = req.body;
    try {
        const [result] = await db.execute(
            `UPDATE coach SET 
                first_name = ?,
                surname = ?,
                email = ?,
                phone_no = ?,
                date_of_birth = ?,
                staff_number = ?,
                dietary_requirements = ?,
                shirt_size = ?,
                signed_integrity_declaration = ?,
                school_id = ?
             WHERE coach_id = ?`,
            [
                first_name,
                surname,
                email || null,
                phone_no || null,
                date_of_birth || null,
                staff_number || null,
                dietary_requirements || null,
                shirt_size || null,
                signed_integrity_declaration || null,
                school_id || null,
                req.params.id
            ]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Coach not found." });
        res.json({ message: "Coach updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update coach." });
    }
});

// DELETE /api/coaches/:id
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM coach WHERE coach_id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Coach not found." });
        res.json({ message: "Coach deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete coach." });
    }
});

// GET /api/coaches/:coachId/teams-scores
router.get('/:coachId/teams-scores', async (req, res) => {
    const coachId = req.params.coachId;
    try {
        // Get the team(s) coached by this coach
        const [teams] = await db.execute(
            `SELECT t.team_id, t.team_name, et.event_id, e.name AS event_name
       FROM team t
       JOIN event_team et ON t.team_id = et.team_id
       JOIN event e ON et.event_id = e.event_id
       WHERE t.coach_id = ?`,
            [coachId]
        );

        if (teams.length === 0) {
            return res.json([]);
        }

        const result = [];
        for (const team of teams) {
            // Get scores for this team-event combination
            const [scores] = await db.execute(
                `SELECT s.score_id, s.round, s.technical_score, s.innovation_design_score,
                s.theme_score, s.real_world_score, s.teamwork_score, s.is_approved,
                COALESCE(s.appeal_status, 'none') AS appeal_status
         FROM score s
         WHERE s.event_team_id = (SELECT event_team_id FROM event_team WHERE team_id = ? AND event_id = ?)
         ORDER BY s.round`,
                [team.team_id, team.event_id]
            );

            const total = scores.reduce((sum, s) => sum + s.technical_score + s.innovation_design_score + s.theme_score + s.real_world_score + s.teamwork_score, 0);
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

module.exports = router;