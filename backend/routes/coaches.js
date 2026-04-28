const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/coaches - with filters and join to Team for team_name
router.get("/", async (req, res) => {
    try {
        const { search, team_id } = req.query;
        let query = `
      SELECT Coach.*, Team.team_name
      FROM Coach
      LEFT JOIN Team ON Coach.team_id = Team.team_id
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            query += " AND (Coach.first_name LIKE ? OR Coach.surname LIKE ? OR Coach.email LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like, like);
        }
        if (team_id) {
            query += " AND Coach.team_id = ?";
            params.push(team_id);
        }

        query += " ORDER BY Coach.created_at DESC";
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
        const [teams] = await db.execute("SELECT team_id, team_name FROM Team ORDER BY team_name");
        res.json({ teams });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
});

// GET /api/coaches/:id
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Coach WHERE coach_id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Coach not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch coach." });
    }
});

// POST /api/coaches
router.post("/", async (req, res) => {
    const { first_name, surname, email, phone_no, date_of_birth, team_id } = req.body;
    if (!first_name || !surname) return res.status(400).json({ message: "First name and surname are required." });

    try {
        const [result] = await db.execute(
            `INSERT INTO Coach (first_name, surname, email, phone_no, date_of_birth, team_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [first_name, surname, email || null, phone_no || null, date_of_birth || null, team_id || null]
        );
        res.status(201).json({ message: "Coach created.", coach_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create coach." });
    }
});

// PUT /api/coaches/:id
router.put("/:id", async (req, res) => {
    const { first_name, surname, email, phone_no, date_of_birth, team_id } = req.body;
    try {
        const [result] = await db.execute(
            `UPDATE Coach SET first_name=?, surname=?, email=?, phone_no=?, date_of_birth=?, team_id=?
       WHERE coach_id=?`,
            [first_name, surname, email || null, phone_no || null, date_of_birth || null, team_id || null, req.params.id]
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
        const [result] = await db.execute("DELETE FROM Coach WHERE coach_id=?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Coach not found." });
        res.json({ message: "Coach deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete coach." });
    }
});

module.exports = router;