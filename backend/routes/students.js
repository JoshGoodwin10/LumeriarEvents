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
      SELECT student.*, team.team_name
      FROM student
      LEFT JOIN team ON student.team_id = team.team_id
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            query += " AND (student.first_name LIKE ? OR student.surname LIKE ? OR student.role LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like, like);
        }
        if (team_id) {
            query += " AND student.team_id = ?";
            params.push(team_id);
        }
        if (grade) {
            query += " AND student.grade = ?";
            params.push(grade);
        }
        if (role) {
            query += " AND student.role = ?";
            params.push(role);
        }

        query += " ORDER BY student.created_at DESC";
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
        const [teams] = await db.execute("SELECT team_id, team_name FROM team ORDER BY team_name");
        const [grades] = await db.execute("SELECT DISTINCT grade FROM student WHERE grade IS NOT NULL ORDER BY grade");
        const [roles] = await db.execute("SELECT DISTINCT role FROM student WHERE role IS NOT NULL ORDER BY role");
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
        const [rows] = await db.execute("SELECT * FROM student WHERE student_id = ?", [req.params.id]);
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
            `INSERT INTO student (first_name, surname, date_of_birth, team_id, grade, role, shirt_size, dietary_requirements)
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
            `UPDATE student SET first_name=?, surname=?, date_of_birth=?, team_id=?, grade=?, role=?, shirt_size=?, dietary_requirements=?
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
    const studentId = req.params.id;
    try {
        const [student] = await db.execute("SELECT team_id FROM student WHERE student_id = ?", [studentId]);
        if (student.length === 0) return res.status(404).json({ message: "Student not found." });
        if (student[0].team_id !== null) {
            return res.status(409).json({
                message: "Cannot delete this student because they are still assigned to a team. Please remove them from the team first."
            });
        }
        await db.execute("DELETE FROM student WHERE student_id = ?", [studentId]);
        res.json({ message: "Student deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete student." });
    }
});

module.exports = router;