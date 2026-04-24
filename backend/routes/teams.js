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

    let query = "SELECT * FROM Team WHERE 1=1";
    const params = [];

    if (school_id) { query += " AND school_id = ?";  params.push(school_id); }
    if (category)  { query += " AND category = ?";   params.push(category); }
    if (year)      { query += " AND year = ?";        params.push(year); }
    if (search) {
      query += " AND (team_name LIKE ? OR theme LIKE ? OR project_description LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY created_at DESC";

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
      years:      years.map(r => r.year),
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

module.exports = router;
