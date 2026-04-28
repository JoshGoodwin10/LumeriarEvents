const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All team routes are protected — user must be logged in
router.use(authMiddleware);

// ─── GET /api/teams ──────────────────────────────────────────
// Fetch all teams with optional filters: ?school_id=1&category=Advanced&year=2024&search=robot
router.get("/", async (req, res) => {
  try {
    const { school_id, category, year, search } = req.query;

    // Join with School to get school_name
    let query = `
      SELECT Team.*, School.school_name
      FROM Team
      LEFT JOIN School ON Team.school_id = School.school_id
      WHERE 1=1
    `;
    const params = [];

    if (school_id) {
      query += " AND Team.school_id = ?";
      params.push(school_id);
    }
    if (category) {
      query += " AND Team.category = ?";
      params.push(category);
    }
    if (year) {
      query += " AND Team.year = ?";
      params.push(year);
    }
    if (search) {
      query += " AND (Team.team_name LIKE ? OR Team.theme LIKE ? OR Team.project_description LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY Team.created_at DESC";

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /teams error:", err);
    res.status(500).json({ message: "Failed to fetch teams." });
  }
});

// ─── GET /api/teams/filter-options ──────────────────────────
// Returns unique values to populate the filter dropdowns
router.get("/filter-options", async (req, res) => {
  try {
    const [[categories], [years], [schools]] = await Promise.all([
      db.execute("SELECT DISTINCT category FROM Team WHERE category IS NOT NULL ORDER BY category"),
      db.execute("SELECT DISTINCT year FROM Team WHERE year IS NOT NULL ORDER BY year DESC"),
      db.execute("SELECT DISTINCT school_id FROM Team WHERE school_id IS NOT NULL ORDER BY school_id"),
    ]);
    res.json({
      categories: categories.map(r => r.category),
      years: years.map(r => r.year),
      school_ids: schools.map(r => r.school_id),
    });
  } catch (err) {
    console.error("GET /teams/filter-options error:", err);
    res.status(500).json({ message: "Failed to fetch filter options." });
  }
});

// ─── GET /api/teams/:id ──────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM Team WHERE team_id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Team not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /teams/:id error:", err);
    res.status(500).json({ message: "Failed to fetch team." });
  }
});

// ─── POST /api/teams ─────────────────────────────────────────
router.post("/", async (req, res) => {
  const { team_name, category, school_id, year, theme, project_description } = req.body;
  if (!team_name) return res.status(400).json({ message: "team_name is required." });

  try {
    const [result] = await db.execute(
      `INSERT INTO Team (team_name, category, school_id, year, theme, project_description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [team_name, category ?? null, school_id ?? null, year ?? null, theme ?? null, project_description ?? null]
    );
    res.status(201).json({ message: "Team created.", team_id: result.insertId });
  } catch (err) {
    console.error("POST /teams error:", err);
    res.status(500).json({ message: "Failed to create team." });
  }
});

// ─── PUT /api/teams/:id ──────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { team_name, category, school_id, year, theme, project_description } = req.body;
  try {
    const [result] = await db.execute(
      `UPDATE Team SET team_name=?, category=?, school_id=?, year=?, theme=?, project_description=?
       WHERE team_id=?`,
      [team_name, category ?? null, school_id ?? null, year ?? null, theme ?? null, project_description ?? null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Team not found." });
    res.json({ message: "Team updated." });
  } catch (err) {
    console.error("PUT /teams/:id error:", err);
    res.status(500).json({ message: "Failed to update team." });
  }
});

// ─── DELETE /api/teams/:id ───────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM Team WHERE team_id=?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Team not found." });
    res.json({ message: "Team deleted." });
  } catch (err) {
    console.error("DELETE /teams/:id error:", err);
    res.status(500).json({ message: "Failed to delete team." });
  }
});

// ─── GET /api/teams/:id/details ──────────────────────────────
// Returns team + school + coaches + students + documents + event_teams
router.get("/:id/details", async (req, res) => {
  const teamId = req.params.id;

  try {
    // 1. Team
    const [teamRows] = await db.execute("SELECT * FROM Team WHERE team_id = ?", [teamId]);
    if (teamRows.length === 0) {
      return res.status(404).json({ message: "Team not found." });
    }
    const team = teamRows[0];

    // 2. School (if school_id exists)
    let school = null;
    if (team.school_id) {
      const [schoolRows] = await db.execute("SELECT * FROM School WHERE school_id = ?", [team.school_id]);
      if (schoolRows.length) school = schoolRows[0];
    }

    // 3. Coaches
    const [coaches] = await db.execute("SELECT * FROM Coach WHERE team_id = ?", [teamId]);

    // 4. Students (the field is "team_id" – your schema shows "date_of_birth_team_id", adjust if needed)
    const [students] = await db.execute(
      "SELECT student_id, first_name, surname, date_of_birth, grade, role, shirt_size, dietary_requirements FROM Student WHERE team_id = ?",
      [teamId]
    );

    // 5. Documents
    const [documents] = await db.execute(
      "SELECT document_id, name, type FROM Document WHERE team_id = ?",
      [teamId]
    );

    // 6. Event Teams
    const [eventTeams] = await db.execute(
      "SELECT event_team_id, event_id, total_points, created_at FROM Event_Team WHERE team_id = ?",
      [teamId]
    );

    res.json({
      team,
      school,
      coaches,
      students,
      documents,
      eventTeams,
    });
  } catch (err) {
    console.error("GET /teams/:id/details error:", err);
    res.status(500).json({ message: "Failed to fetch team details." });
  }
});

module.exports = router;
