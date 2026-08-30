const express = require("express");
const multer = require("multer");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Multer configuration – store files in memory (as Buffer)
const upload = multer({ storage: multer.memoryStorage() });

// All team routes are protected – user must be logged in
router.use(authMiddleware);

// ─── GET /api/teams ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { school_id, category, search } = req.query;

    let query = `
      SELECT team.*, school.school_name
      FROM team
      LEFT JOIN school ON team.school_id = school.school_id
      WHERE 1=1
    `;
    const params = [];

    if (school_id) {
      query += " AND team.school_id = ?";
      params.push(school_id);
    }
    if (category) {
      query += " AND team.category = ?";
      params.push(category);
    }
    if (search) {
      query += " AND (team.team_name LIKE ? OR team.theme LIKE ? OR team.project_description LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY team.created_at DESC";

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /teams error:", err);
    res.status(500).json({ message: "Failed to fetch teams." });
  }
});

// ─── GET /api/teams/filter-options ──────────────────────────
router.get("/filter-options", async (req, res) => {
  try {
    const [[categories], [schools]] = await Promise.all([
      db.execute("SELECT DISTINCT category FROM team WHERE category IS NOT NULL ORDER BY category"),
      db.execute("SELECT DISTINCT school_id FROM team WHERE school_id IS NOT NULL ORDER BY school_id"),
    ]);
    res.json({
      categories: categories.map(r => r.category),
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
    const [rows] = await db.execute("SELECT * FROM team WHERE team_id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Team not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /teams/:id error:", err);
    res.status(500).json({ message: "Failed to fetch team." });
  }
});

// ─── POST /api/teams (with file uploads) ─────────────────────
router.post("/", upload.fields([
  { name: "material_bill", maxCount: 1 },
  { name: "engineering_plan", maxCount: 1 },
  { name: "project_report", maxCount: 1 },
  { name: "engineering_journal", maxCount: 1 }
]), async (req, res) => {
  const {
    team_name, category, school_id, theme, province,
    event, project_description, how_heard, coach_id   // <-- added coach_id
  } = req.body;

  if (!team_name) return res.status(400).json({ message: "team_name is required." });

  const material_bill = req.files["material_bill"] ? req.files["material_bill"][0].buffer : null;
  const engineering_plan = req.files["engineering_plan"] ? req.files["engineering_plan"][0].buffer : null;
  const project_report = req.files["project_report"] ? req.files["project_report"][0].buffer : null;
  const engineering_journal = req.files["engineering_journal"] ? req.files["engineering_journal"][0].buffer : null;

  try {
    const [result] = await db.execute(
      `INSERT INTO team (
        team_name, category, school_id, theme, province, event,
        project_description, how_heard, coach_id,
        material_bill, engineering_plan, project_report, engineering_journal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        team_name, category || null, school_id || null, theme || null,
        province || null, event || null, project_description || null,
        how_heard || null, coach_id || null,
        material_bill, engineering_plan, project_report, engineering_journal
      ]
    );
    res.status(201).json({ message: "Team created.", team_id: result.insertId });
  } catch (err) {
    console.error("POST /teams error:", err);
    res.status(500).json({ message: "Failed to create team." });
  }
});

// ─── PUT /api/teams/:id (with optional file updates) ─────────
router.put("/:id", upload.fields([
  { name: "material_bill", maxCount: 1 },
  { name: "engineering_plan", maxCount: 1 },
  { name: "project_report", maxCount: 1 },
  { name: "engineering_journal", maxCount: 1 }
]), async (req, res) => {
  const {
    team_name, category, school_id, theme, province,
    event, project_description, how_heard, coach_id
  } = req.body;
  const teamId = req.params.id;

  try {
    const [existing] = await db.execute("SELECT * FROM team WHERE team_id = ?", [teamId]);
    if (existing.length === 0) return res.status(404).json({ message: "Team not found." });

    const updates = [];
    const values = [];

    updates.push("team_name = ?"); values.push(team_name);
    updates.push("category = ?"); values.push(category || null);
    updates.push("school_id = ?"); values.push(school_id || null);
    updates.push("theme = ?"); values.push(theme || null);
    updates.push("province = ?"); values.push(province || null);
    updates.push("event = ?"); values.push(event || null);
    updates.push("project_description = ?"); values.push(project_description || null);
    updates.push("how_heard = ?"); values.push(how_heard || null);
    updates.push("coach_id = ?"); values.push(coach_id || null);

    if (req.files["material_bill"]) {
      updates.push("material_bill = ?");
      values.push(req.files["material_bill"][0].buffer);
    }
    if (req.files["engineering_plan"]) {
      updates.push("engineering_plan = ?");
      values.push(req.files["engineering_plan"][0].buffer);
    }
    if (req.files["project_report"]) {
      updates.push("project_report = ?");
      values.push(req.files["project_report"][0].buffer);
    }
    if (req.files["engineering_journal"]) {
      updates.push("engineering_journal = ?");
      values.push(req.files["engineering_journal"][0].buffer);
    }

    values.push(teamId);
    const query = `UPDATE team SET ${updates.join(", ")} WHERE team_id = ?`;
    await db.execute(query, values);

    res.json({ message: "Team updated." });
  } catch (err) {
    console.error("PUT /teams/:id error:", err);
    res.status(500).json({ message: "Failed to update team." });
  }
});

// DELETE /api/teams/:id
router.delete("/:id", async (req, res) => {
  const teamId = req.params.id;
  try {
    const [students] = await db.execute("SELECT COUNT(*) AS count FROM student WHERE team_id = ?", [teamId]);
    if (students[0].count > 0) {
      return res.status(409).json({
        message: `Cannot delete this team because it has ${students[0].count} student(s) assigned. Please remove all students first.`
      });
    }
    const [eventTeams] = await db.execute("SELECT COUNT(*) AS count FROM event_team WHERE team_id = ?", [teamId]);
    if (eventTeams[0].count > 0) {
      return res.status(409).json({
        message: `Cannot delete this team because it is registered for ${eventTeams[0].count} event(s). Remove the team from events first.`
      });
    }
    // (Coach is set to NULL via DB constraint, so no need to block)
    const [result] = await db.execute("DELETE FROM team WHERE team_id = ?", [teamId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Team not found." });
    res.json({ message: "Team deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete team." });
  }
});

// ─── GET /api/teams/:id/details (updated for coach_id) ───────
router.get("/:id/details", async (req, res) => {
  const teamId = req.params.id;

  try {
    const [teamRows] = await db.execute(`
      SELECT t.*, s.school_name
      FROM team t
      LEFT JOIN school s ON t.school_id = s.school_id
      WHERE t.team_id = ?
    `, [teamId]);
    if (teamRows.length === 0) return res.status(404).json({ message: "Team not found." });
    const team = teamRows[0];

    let school = null;
    if (team.school_id) {
      const [schoolRows] = await db.execute("SELECT * FROM school WHERE school_id = ?", [team.school_id]);
      if (schoolRows.length) school = schoolRows[0];
    }

    // Coach: now linked via team.coach_id (singular, not a list)
    let coaches = [];
    if (team.coach_id) {
      const [coachRows] = await db.execute("SELECT * FROM coach WHERE coach_id = ?", [team.coach_id]);
      coaches = coachRows; // array with one item (or empty)
    }

    const [students] = await db.execute(
      `SELECT student_id, first_name, surname, date_of_birth, grade, role,
              shirt_size, dietary_requirements
       FROM student
       WHERE team_id = ?`,
      [teamId]
    );

    const [eventTeams] = await db.execute(
      "SELECT event_team_id, event_id, total_points, created_at FROM event_team WHERE team_id = ?",
      [teamId]
    );

    res.json({ team, school, coaches, students, eventTeams });
  } catch (err) {
    console.error("GET /teams/:id/details error:", err);
    res.status(500).json({ message: "Failed to fetch team details." });
  }
});

// ─── GET /api/teams/:id/download/:field ──────────────────────
router.get("/:id/download/:field", async (req, res) => {
  const { id, field } = req.params;
  const allowed = ["material_bill", "engineering_plan", "project_report", "engineering_journal"];
  if (!allowed.includes(field)) {
    return res.status(400).json({ message: "Invalid file field." });
  }

  try {
    const [rows] = await db.execute(`SELECT ${field} FROM team WHERE team_id = ?`, [id]);
    if (!rows[0] || !rows[0][field]) {
      return res.status(404).json({ message: "File not found." });
    }
    const buffer = rows[0][field];
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${field}_${id}.bin"`);
    res.send(buffer);
  } catch (err) {
    console.error("GET /teams/:id/download/:field error:", err);
    res.status(500).json({ message: "Failed to retrieve file." });
  }
});

module.exports = router;