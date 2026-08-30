const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const bcrypt = require('bcrypt');                 // 👈 for hashing
const sendEmail = require('../utils/email');      // 👈 for sending emails

const router = express.Router();
router.use(authMiddleware);

// GET /api/judges - with filters and join to School for school_name
router.get("/", async (req, res) => {
    try {
        const { search, school_id, role } = req.query;
        let query = `
            SELECT j.*, s.school_name
            FROM judge j
            LEFT JOIN school s ON j.school_id = s.school_id
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
        const [schools] = await db.execute("SELECT school_id, school_name FROM school ORDER BY school_name");
        const [roles] = await db.execute("SELECT DISTINCT role FROM judge WHERE role IS NOT NULL ORDER BY role");
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
        const [rows] = await db.execute("SELECT * FROM judge WHERE judge_id = ?", [req.params.id]);
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
        // 1. Generate password and hash it BEFORE insert
        const rawPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(rawPassword, 10);

        // 2. Insert judge WITH password_hash included
        const [result] = await db.execute(
            `INSERT INTO judge (first_name, surname, school_id, email, phone_no, date_of_birth, role, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, surname, school_id || null, email || null, phone_no || null, date_of_birth || null, role || null, hashedPassword]
        );
        const judgeId = result.insertId;

        // 3. Send email with credentials
        await sendEmail(
            email,
            'Your Lumeriar Judge Account',
            {
                name: `${first_name} ${surname}`,
                role: 'Judge',
                email: email,
                password: rawPassword,
                login_url: process.env.FRONTEND_URL + '/login',
            },
            process.env.EMAILJS_TEMPLATE_PASSWORD
        );

        res.status(201).json({ message: "Judge created and login sent.", judge_id: judgeId });
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
            `UPDATE judge SET first_name=?, surname=?, school_id=?, email=?, phone_no=?, date_of_birth=?, role=?
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
    const judgeId = req.params.id;
    try {
        const [events] = await db.execute("SELECT COUNT(*) AS count FROM event WHERE head_judge = ?", [judgeId]);
        if (events[0].count > 0) {
            return res.status(409).json({
                message: `Cannot delete this judge because they are the head judge for ${events[0].count} event(s). Please reassign head judge first.`
            });
        }
        // Scores will have judge_id set to NULL automatically (FK ON DELETE SET NULL)
        const [result] = await db.execute("DELETE FROM judge WHERE judge_id = ?", [judgeId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Judge not found." });
        res.json({ message: "Judge deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete judge." });
    }
});

// ─── Judge view endpoints (unchanged) ─────────────────────────
// GET /api/judges/:id/events-as-head
router.get("/:id/events-as-head", async (req, res) => {
    // ... same as before
    const judgeId = parseInt(req.params.id);
    const currentUser = req.user;
    if (currentUser.role !== 'admin' && currentUser.userId !== judgeId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const [rows] = await db.execute(`
            SELECT e.*
            FROM event e
            WHERE e.head_judge = ?
            ORDER BY e.date DESC
        `, [judgeId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch events." });
    }
});

// GET /api/judges/:id/teams-to-score
router.get("/:id/teams-to-score", async (req, res) => {
    // ... same as before
    const judgeId = parseInt(req.params.id);
    const currentUser = req.user;
    if (currentUser.role !== 'admin' && currentUser.userId !== judgeId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const [rows] = await db.execute(`
            SELECT DISTINCT
                t.team_id, t.team_name,
                e.event_id, e.name AS event_name, e.date AS event_date,
                s.round, s.is_approved, s.score_id
            FROM score s
            JOIN event_team et ON s.event_team_id = et.event_team_id
            JOIN team t ON et.team_id = t.team_id
            JOIN event e ON et.event_id = e.event_id
            WHERE s.judge_id = ?
            ORDER BY e.date DESC, t.team_name
        `, [judgeId]);

        const grouped = {};
        for (const row of rows) {
            const key = `${row.event_id}-${row.team_id}`;
            if (!grouped[key]) {
                grouped[key] = {
                    team_id: row.team_id,
                    team_name: row.team_name,
                    event_id: row.event_id,
                    event_name: row.event_name,
                    event_date: row.event_date,
                    rounds: [],
                    has_approved: false,
                };
            }
            grouped[key].rounds.push({ round: row.round, approved: row.is_approved === 1 });
            if (row.is_approved) grouped[key].has_approved = true;
        }
        res.json(Object.values(grouped));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch teams." });
    }
});

module.exports = router;