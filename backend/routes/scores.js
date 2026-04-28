// routes/scores.js
const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /api/scores/event/:eventId - all scores for an event (with team & judge details)
router.get("/event/:eventId", async (req, res) => {
    const { eventId } = req.params;
    try {
        const [scores] = await db.execute(`
      SELECT s.*, 
             t.team_id, t.team_name,
             j.first_name AS judge_first, j.surname AS judge_surname
      FROM Score s
      JOIN Event_Team et ON s.event_team_id = et.event_team_id
      JOIN Team t ON et.team_id = t.team_id
      JOIN Judge j ON s.judge_id = j.judge_id
      WHERE et.event_id = ?
      ORDER BY t.team_name, s.round
    `, [eventId]);
        res.json(scores);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch scores." });
    }
});

router.post("/:eventId/scores", async (req, res) => {
    const { eventId } = req.params;
    const { team_id, round, judge_id, technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score, reason_change } = req.body;

    if (!team_id || !round || !judge_id) {
        return res.status(400).json({ message: "team_id, round, and judge_id are required." });
    }

    try {
        // Find event_team_id
        const [etRows] = await db.execute(
            "SELECT event_team_id FROM Event_Team WHERE event_id = ? AND team_id = ?",
            [eventId, team_id]
        );
        if (etRows.length === 0) {
            return res.status(404).json({ message: "Team is not part of this event." });
        }
        const event_team_id = etRows[0].event_team_id;

        // Check if score exists for this (event_team_id, round, judge_id)
        const [existing] = await db.execute(
            "SELECT * FROM Score WHERE event_team_id = ? AND round = ? AND judge_id = ?",
            [event_team_id, round, judge_id]
        );

        if (existing.length === 0) {
            // Insert new score
            const [result] = await db.execute(`
        INSERT INTO Score 
        (event_team_id, round, judge_id, technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [event_team_id, round, judge_id, technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score]);
            const newScoreId = result.insertId;

            // Log initial creation in history
            await db.execute(`
        INSERT INTO Score_History (score_id, judge_id, reason_change, 
          new_technical_score, new_innovation_design_score, new_theme_score, new_real_world_score, new_teamwork_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [newScoreId, judge_id, reason_change || "Initial score",
                technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score]);
        } else {
            // Update existing score
            const old = existing[0];
            await db.execute(`
        UPDATE Score SET
          technical_score = ?,
          innovation_design_score = ?,
          theme_score = ?,
          real_world_score = ?,
          teamwork_score = ?
        WHERE score_id = ?
      `, [technical_score, innovation_design_score, theme_score, real_world_score, teamwork_score, old.score_id]);

            // Log changes only for fields that changed
            const changes = [];
            const params = [old.score_id, judge_id, reason_change || "Score updated"];
            const updateFields = (oldVal, newVal, fieldName) => {
                if (oldVal !== newVal) {
                    changes.push(`${fieldName}: ${oldVal} -> ${newVal}`);
                }
            };
            updateFields(old.technical_score, technical_score, 'technical_score');
            updateFields(old.innovation_design_score, innovation_design_score, 'innovation_design_score');
            updateFields(old.theme_score, theme_score, 'theme_score');
            updateFields(old.real_world_score, real_world_score, 'real_world_score');
            updateFields(old.teamwork_score, teamwork_score, 'teamwork_score');

            if (changes.length > 0) {
                await db.execute(`
          INSERT INTO Score_History 
          (score_id, judge_id, reason_change,
           old_technical_score, new_technical_score,
           old_innovation_design_score, new_innovation_design_score,
           old_theme_score, new_theme_score,
           old_real_world_score, new_real_world_score,
           old_teamwork_score, new_teamwork_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [old.score_id, judge_id, reason_change || changes.join('; '),
                old.technical_score, technical_score,
                old.innovation_design_score, innovation_design_score,
                old.theme_score, theme_score,
                old.real_world_score, real_world_score,
                old.teamwork_score, teamwork_score]);
            }
        }

        // After updating scores, recalculate total_points for this event_team (sum of all approved scores' totals)
        await recalcTeamTotalPoints(event_team_id);

        res.json({ message: "Score saved successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save score." });
    }
});

// Helper: recalc total_points for an event_team
async function recalcTeamTotalPoints(event_team_id) {
    const [rows] = await db.execute(`
    SELECT SUM(
      COALESCE(technical_score,0) + 
      COALESCE(innovation_design_score,0) + 
      COALESCE(theme_score,0) + 
      COALESCE(real_world_score,0) + 
      COALESCE(teamwork_score,0)
    ) AS total
    FROM Score
    WHERE event_team_id = ? AND is_approved = TRUE
  `, [event_team_id]);
    const total = rows[0].total || 0;
    await db.execute("UPDATE Event_Team SET total_points = ? WHERE event_team_id = ?", [total, event_team_id]);
}

router.put("/scores/:scoreId/approve", async (req, res) => {
    const { scoreId } = req.params;
    try {
        const [score] = await db.execute("SELECT event_team_id FROM Score WHERE score_id = ?", [scoreId]);
        if (score.length === 0) return res.status(404).json({ message: "Score not found." });
        await db.execute("UPDATE Score SET is_approved = TRUE WHERE score_id = ?", [scoreId]);
        await recalcTeamTotalPoints(score[0].event_team_id);
        res.json({ message: "Score approved." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to approve score." });
    }
});

router.get("/scores/:scoreId/history", async (req, res) => {
    const { scoreId } = req.params;
    try {
        const [history] = await db.execute(`
      SELECT h.*, j.first_name, j.surname
      FROM Score_History h
      JOIN Judge j ON h.judge_id = j.judge_id
      WHERE h.score_id = ?
      ORDER BY h.change_date DESC
    `, [scoreId]);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch history." });
    }
});

module.exports = router;