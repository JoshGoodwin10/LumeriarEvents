// routes/schools.js
const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");


const router = express.Router();

// Public: GET /api/schools/public – returns list of schools (id and name)
router.get('/public', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT school_id, school_name FROM school ORDER BY school_name');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch schools.' });
    }
});

router.use(authMiddleware);

// GET /api/schools - with filters, and computed statistics (best_score, avg_score, no_teams)
router.get("/", async (req, res) => {
    try {
        const { search, province } = req.query;
        // Base query: all schools (with optional filters)
        let baseQuery = "SELECT school_id, school_name, province, created_at FROM school WHERE 1=1";
        const params = [];
        if (search) {
            baseQuery += " AND (school_name LIKE ? OR province LIKE ?)";
            const like = `%${search}%`;
            params.push(like, like);
        }
        if (province) {
            baseQuery += " AND province = ?";
            params.push(province);
        }
        // Get all filtered schools first
        const [schoolRows] = await db.execute(baseQuery, params);
        if (schoolRows.length === 0) {
            return res.json([]);
        }

        // For each school, compute aggregates from Team and Event_Team
        const schoolsWithStats = await Promise.all(schoolRows.map(async (school) => {
            // Get all teams belonging to this school
            const [teams] = await db.execute(
                "SELECT team_id FROM team WHERE school_id = ?",
                [school.school_id]
            );
            const teamIds = teams.map(t => t.team_id);
            if (teamIds.length === 0) {
                return {
                    ...school,
                    no_teams: 0,
                    best_score: null,
                    avg_score: null,
                };
            }
            const placeholders = teamIds.map(() => '?').join(',');
            // Get all event_team total_points for these teams
            const [eventTeams] = await db.execute(
                `SELECT total_points FROM event_team WHERE team_id IN (${placeholders})`,
                teamIds
            );
            const points = eventTeams.map(et => et.total_points).filter(p => p !== null);
            const no_teams = teamIds.length;
            let best_score = null;
            let avg_score = null;
            if (points.length > 0) {
                best_score = Math.max(...points);
                avg_score = points.reduce((a, b) => a + b, 0) / points.length;
            }
            return {
                ...school,
                no_teams,
                best_score,
                avg_score,
            };
        }));

        // Optionally sort by school_name (already ordered by base query, but we reorder after compute)
        schoolsWithStats.sort((a, b) => a.school_name.localeCompare(b.school_name));
        res.json(schoolsWithStats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch schools." });
    }
});

// GET /api/schools/filter-options - unchanged
router.get("/filter-options", async (req, res) => {
    try {
        const [provinces] = await db.execute(
            "SELECT DISTINCT province FROM school WHERE province IS NOT NULL AND province != '' ORDER BY province"
        );
        res.json({ provinces: provinces.map(row => row.province) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch filter options." });
    }
});

// POST /api/schools - unchanged (writes to School table)
router.post("/", async (req, res) => {
    let { school_name, best_score, average_score, province, no_teams } = req.body;
    if (!school_name) return res.status(400).json({ message: "school_name is required." });
    if (province === undefined || province === null) province = "";
    best_score = best_score !== undefined && best_score !== "" ? Number(best_score) : null;
    average_score = average_score !== undefined && average_score !== "" ? Number(average_score) : null;
    no_teams = no_teams !== undefined && no_teams !== "" ? Number(no_teams) : 0;
    try {
        const [result] = await db.execute(
            `INSERT INTO school (school_name, best_score, average_score, province, no_teams)
             VALUES (?, ?, ?, ?, ?)`,
            [school_name, best_score, average_score, province, no_teams]
        );
        res.status(201).json({ message: "School created.", school_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create school." });
    }
});

// PUT /api/schools/:id - unchanged
router.put("/:id", async (req, res) => {
    let { school_name, best_score, average_score, province, no_teams } = req.body;
    if (!school_name) return res.status(400).json({ message: "school_name is required." });
    if (province === undefined || province === null) province = "";
    best_score = best_score !== undefined && best_score !== "" ? Number(best_score) : null;
    average_score = average_score !== undefined && average_score !== "" ? Number(average_score) : null;
    no_teams = no_teams !== undefined && no_teams !== "" ? Number(no_teams) : 0;
    try {
        const [result] = await db.execute(
            `UPDATE school 
             SET school_name=?, best_score=?, average_score=?, province=?, no_teams=?
             WHERE school_id=?`,
            [school_name, best_score, average_score, province, no_teams, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "School not found." });
        res.json({ message: "School updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update school." });
    }
});

// DELETE /api/schools/:id
router.delete("/:id", async (req, res) => {
    const schoolId = req.params.id;
    try {
        const [teams] = await db.execute("SELECT COUNT(*) AS count FROM team WHERE school_id = ?", [schoolId]);
        if (teams[0].count > 0) {
            return res.status(409).json({
                message: `Cannot delete this school because it has ${teams[0].count} team(s) associated with it. Please remove all teams first.`
            });
        }
        const [result] = await db.execute("DELETE FROM school WHERE school_id = ?", [schoolId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "School not found." });
        res.json({ message: "School deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete school." });
    }
});

module.exports = router;