const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/awards/event/:eventId
router.get('/event/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    try {
        const [rows] = await db.execute(`
            SELECT a.*, t.team_name, e.name AS event_name
            FROM Awards a
            JOIN Team t ON a.team_id = t.team_id
            JOIN Event e ON a.event_id = e.event_id
            WHERE a.event_id = ?
            ORDER BY a.category_name, a.rank_position
        `, [eventId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch awards.' });
    }
});

router.use(authMiddleware);

// Helper: get ordinal suffix
function getOrdinal(n) {
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
}

// Helper: get team scores for an event (approved scores only)
async function getTeamScores(eventId) {
    const [rows] = await db.execute(`
        SELECT 
            t.team_id,
            t.team_name,
            t.category,
            SUM(
                COALESCE(s.technical_score,0) + 
                COALESCE(s.innovation_design_score,0) + 
                COALESCE(s.theme_score,0) + 
                COALESCE(s.real_world_score,0) + 
                COALESCE(s.teamwork_score,0)
            ) AS overall_total,
            SUM(COALESCE(s.technical_score,0)) AS total_technical,
            SUM(COALESCE(s.teamwork_score,0)) AS total_teamwork,
            SUM(COALESCE(s.innovation_design_score,0)) AS total_innovation,
            SUM(COALESCE(s.theme_score,0)) AS total_theme
        FROM Team t
        JOIN Event_Team et ON t.team_id = et.team_id
        JOIN Score s ON et.event_team_id = s.event_team_id
        WHERE et.event_id = ? AND s.is_approved = 1
        GROUP BY t.team_id
    `, [eventId]);
    return rows;
}

// POST /api/awards/generate/:eventId
router.post('/generate/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    try {
        const teams = await getTeamScores(eventId);
        if (teams.length === 0) {
            return res.status(400).json({ message: 'No approved scores found for this event.' });
        }

        // Group teams by category
        const categories = [...new Set(teams.map(t => t.category))];
        // Clear previous awards for this event
        await db.execute('DELETE FROM Awards WHERE event_id = ?', [eventId]);

        const awardsToInsert = [];

        // Category place awards
        for (const cat of categories) {
            const catTeams = teams.filter(t => t.category === cat).sort((a, b) => b.overall_total - a.overall_total);
            for (let i = 0; i < Math.min(3, catTeams.length); i++) {
                const team = catTeams[i];
                const awardType = `${i + 1}${getOrdinal(i + 1)} place`;
                awardsToInsert.push({
                    event_id: eventId,
                    team_id: team.team_id,
                    award_type: awardType,
                    category_name: cat,
                    rank_position: i + 1
                });
            }
        }

        // Excellence in Teamwork
        const bestTeamwork = [...teams].sort((a, b) => b.total_teamwork - a.total_teamwork)[0];
        if (bestTeamwork) {
            awardsToInsert.push({
                event_id: eventId,
                team_id: bestTeamwork.team_id,
                award_type: 'Excellence in Teamwork',
                category_name: null,
                rank_position: null
            });
        }

        // Best Technical Build
        const bestTechnical = [...teams].sort((a, b) => b.total_technical - a.total_technical)[0];
        if (bestTechnical) {
            awardsToInsert.push({
                event_id: eventId,
                team_id: bestTechnical.team_id,
                award_type: 'Best Technical Build',
                category_name: null,
                rank_position: null
            });
        }

        // Future Innovators specific awards
        const futureTeams = teams.filter(t => t.category === 'Future Innovators');
        if (futureTeams.length > 0) {
            const bestInnovation = [...futureTeams].sort((a, b) => b.total_innovation - a.total_innovation)[0];
            if (bestInnovation) {
                awardsToInsert.push({
                    event_id: eventId,
                    team_id: bestInnovation.team_id,
                    award_type: 'Excellence in Innovation',
                    category_name: null,
                    rank_position: null
                });
            }
            const bestTheme = [...futureTeams].sort((a, b) => b.total_theme - a.total_theme)[0];
            if (bestTheme) {
                awardsToInsert.push({
                    event_id: eventId,
                    team_id: bestTheme.team_id,
                    award_type: 'Best Thematic Alignment',
                    category_name: null,
                    rank_position: null
                });
            }
        }

        // Insert all
        for (const award of awardsToInsert) {
            await db.execute(
                `INSERT INTO Awards (event_id, team_id, award_type, category_name, rank_position)
                 VALUES (?, ?, ?, ?, ?)`,
                [award.event_id, award.team_id, award.award_type, award.category_name, award.rank_position]
            );
        }
        res.json({ message: 'Awards generated successfully.', count: awardsToInsert.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate awards.' });
    }
});

// POST /api/awards/nominate-most-improved
router.post('/nominate-most-improved', async (req, res) => {
    const { event_id, team_id } = req.body;
    if (!event_id || !team_id) {
        return res.status(400).json({ message: 'event_id and team_id are required.' });
    }
    try {
        // Remove any existing 'Most Improved' award for this event (only one per event)
        await db.execute(
            `DELETE FROM Awards WHERE event_id = ? AND award_type = 'Most Improved'`,
            [event_id]
        );
        // Insert new nomination
        await db.execute(
            `INSERT INTO Awards (event_id, team_id, award_type, category_name, rank_position)
             VALUES (?, ?, 'Most Improved', NULL, NULL)`,
            [event_id, team_id]
        );
        res.json({ message: 'Most Improved award nominated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to nominate Most Improved.' });
    }
});

// GET /api/awards/team/:teamId
router.get('/team/:teamId', async (req, res) => {
    const teamId = req.params.teamId;
    try {
        const [rows] = await db.execute(`
            SELECT a.*, e.name AS event_name
            FROM Awards a
            JOIN Event e ON a.event_id = e.event_id
            WHERE a.team_id = ?
            ORDER BY e.date DESC
        `, [teamId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch team awards.' });
    }
});

module.exports = router;