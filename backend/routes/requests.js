const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/requests – list team requests
router.get("/", async (req, res) => {
    try {
        const { search, is_approved } = req.query;
        let query = `SELECT * FROM team_request WHERE 1=1`;
        const params = [];

        if (search) {
            query += " AND (team_name LIKE ? OR province LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like);
        }
        if (is_approved !== undefined) {
            query += " AND is_approved = ?";
            params.push(is_approved === "true" ? 1 : 0);
        }
        query += " ORDER BY created_at DESC";
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch team requests." });
    }
});

// GET /api/requests/:id/details
router.get("/:id/details", async (req, res) => {
    const requestId = req.params.id;
    try {
        // TeamRequest
        const [tr] = await db.execute("SELECT * FROM team_request WHERE request_id = ?", [requestId]);
        if (tr.length === 0) return res.status(404).json({ message: "Request not found." });

        // StudentRequest entries
        const [students] = await db.execute("SELECT * FROM student_request WHERE requested_team = ?", [requestId]);

        // CoachRequest (only one per request? assuming one coach per team)
        const [coach] = await db.execute("SELECT * FROM coach_request WHERE requested_team = ?", [requestId]);

        res.json({
            teamRequest: tr[0],
            students,
            coach: coach.length ? coach[0] : null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch request details." });
    }
});

// POST /api/requests/:id/approve
router.post("/:id/approve", async (req, res) => {
    const requestId = req.params.id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch the team request
        const [tr] = await connection.execute("SELECT * FROM team_request WHERE request_id = ?", [requestId]);
        if (tr.length === 0) throw new Error("Request not found");
        const teamReq = tr[0];
        if (teamReq.is_approved) throw new Error("Request already approved");

        // 2. Create Team
        const year = new Date().getFullYear();
        const [teamResult] = await connection.execute(
            `INSERT INTO team (team_name, category, school_id, year, theme, project_description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                teamReq.team_name,
                teamReq.category,
                teamReq.school_id,
                year,
                teamReq.theme,
                teamReq.project_description,
            ]
        );
        const teamId = teamResult.insertId;

        // 3. Create Coach (from CoachRequest)
        const [coachReq] = await connection.execute("SELECT * FROM coach_request WHERE requested_team = ?", [requestId]);
        if (coachReq.length > 0) {
            const c = coachReq[0];
            await connection.execute(
                `INSERT INTO coach (first_name, surname, email, phone_no, date_of_birth, team_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [c.first_name, c.surname, c.email, c.phone_no, c.date_of_birth, teamId]
            );
        }

        // 4. Create Students (from StudentRequest)
        const [students] = await connection.execute("SELECT * FROM student_request WHERE requested_team = ?", [requestId]);
        for (const s of students) {
            await connection.execute(
                `INSERT INTO student (first_name, surname, date_of_birth, grade, role, team_id, shirt_size, dietary_requirements, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [s.first_name, s.surname, s.date_of_birth, s.grade, s.role, teamId, s.shirt_size, s.dietary_requirements]
            );
        }

        // 5. Create Event_Team if event field exists (assuming teamReq.event contains an event_id)
        if (teamReq.event) {
            // teamReq.event is expected to be an integer event_id (could be validated)
            await connection.execute(
                "INSERT INTO event_team (event_id, team_id, created_at) VALUES (?, ?, NOW())",
                [teamReq.event, teamId]
            );
        }

        // 6. Mark request as approved
        await connection.execute("UPDATE team_request SET is_approved = 1 WHERE request_id = ?", [requestId]);

        await connection.commit();
        res.json({ message: "Request approved, team created successfully.", team_id: teamId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to approve request." });
    } finally {
        connection.release();
    }
});

module.exports = router;