const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// ─── Existing routes (keep them as they are) ─────────────────
// GET /api/events - with filters
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

// GET /api/events/filter-options
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

// GET /api/events/:id
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Event WHERE event_id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Event not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch event." });
    }
});

// POST /api/events
router.post("/", async (req, res) => {
    const { name, date, category } = req.body;
    if (!name || !date) {
        return res.status(400).json({ message: "Event name and date are required." });
    }
    try {
        const [result] = await db.execute(
            "INSERT INTO Event (name, date, category) VALUES (?, ?, ?)",
            [name, date, category || null]
        );
        res.status(201).json({ message: "Event created.", event_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create event." });
    }
});

// PUT /api/events/:id
router.put("/:id", async (req, res) => {
    const { name, date, category } = req.body;
    if (!name || !date) {
        return res.status(400).json({ message: "Event name and date are required." });
    }
    try {
        const [result] = await db.execute(
            "UPDATE Event SET name=?, date=?, category=? WHERE event_id=?",
            [name, date, category || null, req.params.id]
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

// ─── NEW ENDPOINTS FOR EVENT DETAILS & JUDGE ASSIGNMENT ───────

// GET /api/events/:id/details
router.get("/:id/details", async (req, res) => {
    const eventId = req.params.id;
    try {
        // 1. Event details
        const [eventRows] = await db.execute("SELECT * FROM Event WHERE event_id = ?", [eventId]);
        if (eventRows.length === 0) return res.status(404).json({ message: "Event not found." });
        const event = eventRows[0];

        // 2. Teams in this event with their scores
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

        // 3. For each team, fetch assigned judges
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

// POST /api/events/:id/assign-judge
router.post("/:id/assign-judge", async (req, res) => {
    const eventId = req.params.id;
    const { team_id, judge_id } = req.body;
    if (!team_id || !judge_id) {
        return res.status(400).json({ message: "team_id and judge_id are required." });
    }

    try {
        // Find event_team_id for this event+team
        const [rows] = await db.execute(
            "SELECT event_team_id FROM Event_Team WHERE event_id = ? AND team_id = ?",
            [eventId, team_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Team is not registered for this event." });
        }
        const event_team_id = rows[0].event_team_id;

        // Insert assignment (ignore duplicate)
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

// DELETE /api/events/:id/remove-judge
router.delete("/:id/remove-judge", async (req, res) => {
    const eventId = req.params.id;
    const { team_id, judge_id } = req.body;
    if (!team_id || !judge_id) {
        return res.status(400).json({ message: "team_id and judge_id are required." });
    }

    try {
        // Find event_team_id
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