const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/students - with filters and join to Team for team_name
router.get("/", async (req, res) => {
    try {
        const { search, team_id, grade, role } = req.query;
        let query = `
      SELECT Student.*, Team.team_name
      FROM Student
      LEFT JOIN Team ON Student.team_id = Team.team_id
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            query += " AND (Student.first_name LIKE ? OR Student.surname LIKE ? OR Student.role LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like, like);
        }
        if (team_id) {
            query += " AND Student.team_id = ?";
            params.push(team_id);
        }
        if (grade) {
            query += " AND Student.grade = ?";
            params.push(grade);
        }
        if (role) {
            query += " AND Student.role = ?";
            params.push(role);
        }

        query += " ORDER BY Student.created_at DESC";
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch students." });
    }
});

// GET /api/students/filter-options
router.get("/filter-options", async (req, res) => {
    try {
        const [teams] = await db.execute("SELECT team_id, team_name FROM Team ORDER BY team_name");
        const [grades] = await db.execute("SELECT DISTINCT grade FROM Student WHERE grade IS NOT NULL ORDER BY grade");
        const [roles] = await db.execute("SELECT DISTINCT role FROM Student WHERE role IS NOT NULL ORDER BY role");
        res.json({
            teams: teams,
            grades: grades.map(r => r.grade),
            roles: roles.map(r => r.role),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
});

// GET /api/students/:id
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Student WHERE student_id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Student not found." });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch student." });
    }
});

// POST /api/students
router.post("/", async (req, res) => {
    const { first_name, surname, date_of_birth, team_id, grade, role, shirt_size, dietary_requirements } = req.body;
    if (!first_name || !surname) return res.status(400).json({ message: "First name and surname are required." });

    try {
        const [result] = await db.execute(
            `INSERT INTO Student (first_name, surname, date_of_birth, team_id, grade, role, shirt_size, dietary_requirements)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, surname, date_of_birth || null, team_id || null, grade || null, role || null, shirt_size || null, dietary_requirements || null]
        );
        res.status(201).json({ message: "Student created.", student_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create student." });
    }
});

// PUT /api/students/:id
router.put("/:id", async (req, res) => {
    const { first_name, surname, date_of_birth, team_id, grade, role, shirt_size, dietary_requirements } = req.body;
    try {
        const [result] = await db.execute(
            `UPDATE Student SET first_name=?, surname=?, date_of_birth=?, team_id=?, grade=?, role=?, shirt_size=?, dietary_requirements=?
       WHERE student_id=?`,
            [first_name, surname, date_of_birth || null, team_id || null, grade || null, role || null, shirt_size || null, dietary_requirements || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Student not found." });
        res.json({ message: "Student updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update student." });
    }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM Student WHERE student_id=?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Student not found." });
        res.json({ message: "Student deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete student." });
    }
});

module.exports = router;