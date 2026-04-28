const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/schools - with filters
router.get("/", async (req, res) => {
    try {
        const { search, province } = req.query;
        let query = "SELECT * FROM School WHERE 1=1";
        const params = [];

        if (search) {
            query += " AND (school_name LIKE ? OR province LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like);
        }
        if (province) {
            query += " AND province = ?";
            params.push(province);
        }

        query += " ORDER BY school_name";
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch schools." });
    }
});

// GET /api/schools/filter-options
router.get("/filter-options", async (req, res) => {
    try {
        const [provinces] = await db.execute(
            "SELECT DISTINCT province FROM School WHERE province IS NOT NULL ORDER BY province"
        );
        res.json({ provinces: provinces.map(row => row.province) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
});

// POST /api/schools
router.post("/", async (req, res) => {
    let { school_name, best_score, average_score, province, no_teams } = req.body;

    if (!school_name) {
        return res.status(400).json({ message: "school_name is required." });
    }

    // Ensure province is a string (not undefined/null) - database column is NOT NULL
    // If frontend sends undefined/null, default to empty string or a placeholder
    if (province === undefined || province === null) {
        province = "";
    }

    // Convert empty strings to appropriate values
    best_score = best_score !== undefined && best_score !== "" ? Number(best_score) : null;
    average_score = average_score !== undefined && average_score !== "" ? Number(average_score) : null;
    no_teams = no_teams !== undefined && no_teams !== "" ? Number(no_teams) : 0;

    try {
        const [result] = await db.execute(
            `INSERT INTO School (school_name, best_score, average_score, province, no_teams)
       VALUES (?, ?, ?, ?, ?)`,
            [school_name, best_score, average_score, province, no_teams]
        );
        res.status(201).json({ message: "School created.", school_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create school." });
    }
});

// PUT /api/schools/:id
router.put("/:id", async (req, res) => {
    let { school_name, best_score, average_score, province, no_teams } = req.body;

    if (!school_name) {
        return res.status(400).json({ message: "school_name is required." });
    }

    // Ensure province is a string (not undefined/null)
    if (province === undefined || province === null) {
        province = "";
    }

    best_score = best_score !== undefined && best_score !== "" ? Number(best_score) : null;
    average_score = average_score !== undefined && average_score !== "" ? Number(average_score) : null;
    no_teams = no_teams !== undefined && no_teams !== "" ? Number(no_teams) : 0;

    try {
        const [result] = await db.execute(
            `UPDATE School 
       SET school_name=?, best_score=?, average_score=?, province=?, no_teams=?
       WHERE school_id=?`,
            [school_name, best_score, average_score, province, no_teams, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "School not found." });
        }
        res.json({ message: "School updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update school." });
    }
});

// DELETE /api/schools/:id
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM School WHERE school_id=?", [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "School not found." });
        }
        res.json({ message: "School deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete school." });
    }
});

module.exports = router;