const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ─── Public routes (no authentication required) ─────────────────
// GET /api/events - with filters (public)
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

// GET /api/events/filter-options (public)
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

// GET /api/events/:id (public - event details)
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Event WHERE event_id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Event not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch event." });
    }
});

// GET /api/events/:id/details (public - event details with teams & judges)
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
            ORDER BY et.total_points DESC
        `, [eventId]);

        const teamsWithJudges = await Promise.all(teams.map(async (team) => {
            const [judges] = await db.execute(`
                SELECT j.judge_id, j.first_name, j.surname, j.email, j.role
                FROM Event_Team_Judge etj
                JOIN Judge j ON etj.judge_id = j.judge_id
                WHERE etj.event_team_id = ?
            `, [team.event_team_id]);
            return { ...team, judges };
        }));

        res.json({ event, teams: teamsWithJudges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch event details." });
    }
});

// GET /api/events/:eventId/leaderboard – public
router.get("/:eventId/leaderboard", async (req, res) => {
    const eventId = req.params.eventId;
    try {
        // 1. Get event details
        const [eventRows] = await db.execute(
            "SELECT event_id, name, date, venue FROM Event WHERE event_id = ?",
            [eventId]
        );
        if (eventRows.length === 0) {
            return res.status(404).json({ message: "Event not found." });
        }
        const event = eventRows[0];

        // 2. Get all teams that participated in this event (from Event_Team)
        const [teamRows] = await db.execute(`
            SELECT 
                et.event_team_id,
                t.team_id,
                t.team_name
            FROM Event_Team et
            JOIN Team t ON et.team_id = t.team_id
            WHERE et.event_id = ?
            ORDER BY t.team_name
        `, [eventId]);

        if (teamRows.length === 0) {
            return res.json({ event, teams: [] });
        }

        // 3. Get all approved scores for these event_team_id's
        const eventTeamIds = teamRows.map(t => t.event_team_id);
        const placeholders = eventTeamIds.map(() => '?').join(',');
        const [scoreRows] = await db.execute(`
            SELECT 
                event_team_id,
                round,
                technical_score,
                innovation_design_score,
                theme_score,
                real_world_score,
                teamwork_score,
                judge_id,
                is_approved
            FROM Score
            WHERE event_team_id IN (${placeholders}) AND is_approved = 1
            ORDER BY event_team_id, round
        `, eventTeamIds);

        // 4. Build response: for each team, collect rounds + total
        const teams = teamRows.map(team => {
            const teamScores = scoreRows.filter(s => s.event_team_id === team.event_team_id);
            const roundsMap = new Map(); // round -> total score
            teamScores.forEach(score => {
                const total = (score.technical_score || 0) +
                    (score.innovation_design_score || 0) +
                    (score.theme_score || 0) +
                    (score.real_world_score || 0) +
                    (score.teamwork_score || 0);
                roundsMap.set(score.round, total);
            });
            // Convert to array of { round, total }
            const rounds = Array.from(roundsMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([round, total]) => ({ round, total }));
            // Compute overall total (sum of all rounds)
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
// Apply auth middleware to all remaining routes
router.use(authMiddleware);

// POST /api/events
router.post("/", async (req, res) => {
    const { name, date, venue, start_time, end_time, registration_open, category } = req.body;
    if (!name || !date) {
        return res.status(400).json({ message: "Event name and date are required." });
    }
    try {
        const [result] = await db.execute(
            `INSERT INTO Event (name, date, venue, start_time, end_time, registration_open, category)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                date,
                venue || null,
                start_time || null,
                end_time || null,
                registration_open !== undefined ? registration_open : 1,
                category || null
            ]
        );
        res.status(201).json({ message: "Event created.", event_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create event." });
    }
});

// PUT /api/events/:id
router.put("/:id", async (req, res) => {
    const { name, date, venue, start_time, end_time, registration_open, category } = req.body;
    if (!name || !date) {
        return res.status(400).json({ message: "Event name and date are required." });
    }
    try {
        const [result] = await db.execute(
            `UPDATE Event
             SET name = ?,
                 date = ?,
                 venue = ?,
                 start_time = ?,
                 end_time = ?,
                 registration_open = ?,
                 category = ?
             WHERE event_id = ?`,
            [
                name,
                date,
                venue || null,
                start_time || null,
                end_time || null,
                registration_open !== undefined ? registration_open : 1,
                category || null,
                req.params.id
            ]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Event not found." });
        res.json({ message: "Event updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update event." });
    }
});

// DELETE /api/events/:id
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

// POST /api/events/:id/assign-judge (protected)
router.post("/:id/assign-judge", async (req, res) => {
    const eventId = req.params.id;
    const { team_id, judge_id } = req.body;
    if (!team_id || !judge_id) {
        return res.status(400).json({ message: "team_id and judge_id are required." });
    }

    try {
        const [rows] = await db.execute(
            "SELECT event_team_id FROM Event_Team WHERE event_id = ? AND team_id = ?",
            [eventId, team_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Team is not registered for this event." });
        }
        const event_team_id = rows[0].event_team_id;

        await db.execute(
            "INSERT IGNORE INTO Event_Team_Judge (event_team_id, judge_id) VALUES (?, ?)",
            [event_team_id, judge_id]
        );
        res.json({ message: "Judge assigned successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to assign judge." });
    }
});

// DELETE /api/events/:id/remove-judge (protected)
router.delete("/:id/remove-judge", async (req, res) => {
    const eventId = req.params.id;
    const { team_id, judge_id } = req.body;
    if (!team_id || !judge_id) {
        return res.status(400).json({ message: "team_id and judge_id are required." });
    }

    try {
        const [rows] = await db.execute(
            "SELECT event_team_id FROM Event_Team WHERE event_id = ? AND team_id = ?",
            [eventId, team_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Team not in event." });
        }
        const event_team_id = rows[0].event_team_id;

        await db.execute(
            "DELETE FROM Event_Team_Judge WHERE event_team_id = ? AND judge_id = ?",
            [event_team_id, judge_id]
        );
        res.json({ message: "Judge removed." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to remove judge." });
    }
});

module.exports = router;