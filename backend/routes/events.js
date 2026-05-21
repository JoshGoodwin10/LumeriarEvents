const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ─── Public routes (no authentication required) ─────────────────
router.get("/", async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = `
            SELECT e.*, COUNT(et.team_id) AS team_count
            FROM Event e
            LEFT JOIN Event_Team et ON e.event_id = et.event_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += " AND (name LIKE ? OR category LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like);
        }
        if (category) {
            query += " AND category = ?";
            params.push(category);
        }
        query += " GROUP BY e.event_id ORDER BY e.created_at DESC";
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch events." });
    }
});

router.get("/filter-options", async (req, res) => {
    try {
        const [categories] = await db.execute(
            "SELECT DISTINCT category FROM Event WHERE category IS NOT NULL ORDER BY category"
        );
        res.json({ categories: categories.map(row => row.category) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Event WHERE event_id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Event not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch event." });
    }
});

// GET /api/events/:id/details – includes teams, their scores (rounds + total)
router.get("/:id/details", async (req, res) => {
    const eventId = req.params.id;
    try {
        const [eventRows] = await db.execute("SELECT * FROM Event WHERE event_id = ?", [eventId]);
        if (eventRows.length === 0) return res.status(404).json({ message: "Event not found." });
        const event = eventRows[0];

        const [teams] = await db.execute(`
            SELECT 
                et.event_team_id,
                t.team_id,
                t.team_name,
                t.category,
                et.total_points,
                et.created_at AS joined_at
            FROM Event_Team et
            JOIN Team t ON et.team_id = t.team_id
            WHERE et.event_id = ?
            ORDER BY t.team_name
        `, [eventId]);

        const teamsWithScores = await Promise.all(teams.map(async (team) => {
            // ✅ FIX: removed "AND is_approved = 1" to show all scores (pending + approved)
            const [scoreRows] = await db.execute(`
                SELECT 
                    score_id,
                    round,
                    technical_score,
                    innovation_design_score,
                    theme_score,
                    real_world_score,
                    teamwork_score,
                    judge_id,
                    is_approved
                FROM Score
                WHERE event_team_id = ?
                ORDER BY round
            `, [team.event_team_id]);

            let overallTotal = 0;
            const rounds = scoreRows.map(score => {
                const roundTotal = (score.technical_score || 0) +
                    (score.innovation_design_score || 0) +
                    (score.theme_score || 0) +
                    (score.real_world_score || 0) +
                    (score.teamwork_score || 0);
                overallTotal += roundTotal;
                return {
                    round: score.round,
                    total: roundTotal,
                    breakdown: {
                        technical: score.technical_score,
                        innovation_design: score.innovation_design_score,
                        theme: score.theme_score,
                        real_world: score.real_world_score,
                        teamwork: score.teamwork_score,
                    },
                    score_id: score.score_id,
                    is_approved: score.is_approved
                };
            });

            const [judges] = await db.execute(`
                SELECT DISTINCT j.judge_id, j.first_name, j.surname, j.email, j.role
                FROM Score s
                JOIN Judge j ON s.judge_id = j.judge_id
                WHERE s.event_team_id = ? AND s.is_approved = 1
            `, [team.event_team_id]);

            return {
                event_team_id: team.event_team_id,
                team_id: team.team_id,
                team_name: team.team_name,
                category: team.category,
                stored_total: team.total_points,
                judges,
                scores: { rounds, overall_total: overallTotal }
            };
        }));

        res.json({ event, teams: teamsWithScores });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch event details." });
    }
});

// GET /api/events/:eventId/leaderboard – public (unchanged)
router.get("/:eventId/leaderboard", async (req, res) => {
    const eventId = req.params.eventId;
    try {
        const [eventRows] = await db.execute(
            "SELECT event_id, name, date, venue FROM Event WHERE event_id = ?",
            [eventId]
        );
        if (eventRows.length === 0) return res.status(404).json({ message: "Event not found." });
        const event = eventRows[0];

        const [teamRows] = await db.execute(`
            SELECT et.event_team_id, t.team_id, t.team_name
            FROM Event_Team et
            JOIN Team t ON et.team_id = t.team_id
            WHERE et.event_id = ?
            ORDER BY t.team_name
        `, [eventId]);

        if (teamRows.length === 0) return res.json({ event, teams: [] });

        const eventTeamIds = teamRows.map(t => t.event_team_id);
        const placeholders = eventTeamIds.map(() => '?').join(',');
        const [scoreRows] = await db.execute(`
            SELECT 
                event_team_id, round,
                technical_score, innovation_design_score, theme_score,
                real_world_score, teamwork_score, is_approved
            FROM Score
            WHERE event_team_id IN (${placeholders}) AND is_approved = 1
            ORDER BY event_team_id, round
        `, eventTeamIds);

        const teams = teamRows.map(team => {
            const teamScores = scoreRows.filter(s => s.event_team_id === team.event_team_id);
            const rounds = teamScores.map(score => {
                const total = (score.technical_score || 0) +
                    (score.innovation_design_score || 0) +
                    (score.theme_score || 0) +
                    (score.real_world_score || 0) +
                    (score.teamwork_score || 0);
                return { round: score.round, total };
            });
            const overallTotal = rounds.reduce((sum, r) => sum + r.total, 0);
            return {
                team_id: team.team_id,
                team_name: team.team_name,
                rounds,
                overall_total: overallTotal
            };
        });

        res.json({ event, teams });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch leaderboard." });
    }
});

// ─── Protected routes (require authentication) ─────────────────
router.use(authMiddleware);

// POST /api/events – with head_judge field
router.post("/", async (req, res) => {
    const { name, date, venue, start_time, end_time, registration_open, category, head_judge } = req.body;
    if (!name || !date) return res.status(400).json({ message: "Event name and date are required." });
    try {
        const [result] = await db.execute(
            `INSERT INTO Event (name, date, venue, start_time, end_time, registration_open, category, head_judge)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, date, venue || null, start_time || null, end_time || null,
                registration_open !== undefined ? registration_open : 1, category || null, head_judge || null]
        );
        res.status(201).json({ message: "Event created.", event_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create event." });
    }
});

// PUT /api/events/:id – with head_judge field
router.put("/:id", async (req, res) => {
    const { name, date, venue, start_time, end_time, registration_open, category, head_judge } = req.body;
    if (!name || !date) return res.status(400).json({ message: "Event name and date are required." });
    try {
        const [result] = await db.execute(
            `UPDATE Event SET name=?, date=?, venue=?, start_time=?, end_time=?, registration_open=?, category=?, head_judge=?
             WHERE event_id=?`,
            [name, date, venue || null, start_time || null, end_time || null,
                registration_open !== undefined ? registration_open : 1, category || null, head_judge || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Event not found." });
        res.json({ message: "Event updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update event." });
    }
});

// DELETE /api/events/:id (unchanged)
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM Event WHERE event_id=?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Event not found." });
        res.json({ message: "Event deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete event." });
    }
});

module.exports = router;