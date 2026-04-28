const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

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

        query += " ORDER BY created_at DESC";
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

module.exports = router;