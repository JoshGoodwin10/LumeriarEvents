const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/judges - with filters and join to School for school_name
router.get("/", async (req, res) => {
    try {
        const { search, school_id, role } = req.query;
        let query = `
      SELECT j.*, s.school_name
      FROM Judge j
      LEFT JOIN School s ON j.school_id = s.school_id
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            query += " AND (j.first_name LIKE ? OR j.surname LIKE ? OR j.email LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like, like);
        }
        if (school_id) {
            query += " AND j.school_id = ?";
            params.push(school_id);
        }
        if (role) {
            query += " AND j.role = ?";
            params.push(role);
        }

        query += " ORDER BY j.created_at DESC";
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch judges." });
    }
});

// GET /api/judges/filter-options
router.get("/filter-options", async (req, res) => {
    try {
        const [schools] = await db.execute("SELECT school_id, school_name FROM School ORDER BY school_name");
        const [roles] = await db.execute("SELECT DISTINCT role FROM Judge WHERE role IS NOT NULL ORDER BY role");
        res.json({
            schools,
            roles: roles.map(r => r.role),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
});

// GET /api/judges/:id
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Judge WHERE judge_id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Judge not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch judge." });
    }
});

// POST /api/judges
router.post("/", async (req, res) => {
    const { first_name, surname, school_id, email, phone_no, date_of_birth, role } = req.body;
    if (!first_name || !surname) {
        return res.status(400).json({ message: "First name and surname are required." });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO Judge (first_name, surname, school_id, email, phone_no, date_of_birth, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, surname, school_id || null, email || null, phone_no || null, date_of_birth || null, role || null]
        );
        res.status(201).json({ message: "Judge created.", judge_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create judge." });
    }
});

// PUT /api/judges/:id
router.put("/:id", async (req, res) => {
    const { first_name, surname, school_id, email, phone_no, date_of_birth, role } = req.body;
    try {
        const [result] = await db.execute(
            `UPDATE Judge SET first_name=?, surname=?, school_id=?, email=?, phone_no=?, date_of_birth=?, role=?
       WHERE judge_id=?`,
            [first_name, surname, school_id || null, email || null, phone_no || null, date_of_birth || null, role || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Judge not found." });
        res.json({ message: "Judge updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update judge." });
    }
});

// DELETE /api/judges/:id
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM Judge WHERE judge_id=?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Judge not found." });
        res.json({ message: "Judge deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete judge." });
    }
});

module.exports = router;