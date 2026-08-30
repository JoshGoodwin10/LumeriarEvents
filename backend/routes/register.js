// routes/register.js
const express = require('express');
const multer = require('multer');
const db = require('../db');
const sendEmail = require('../utils/email');   // 👈 import EmailJS utility
const bcrypt = require('bcrypt');

const router = express.Router();

// Use memory storage – files stay as Buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });

const findOrCreateSchool = async (schoolName, province) => {
    if (!schoolName) return null;
    const [rows] = await db.execute('SELECT school_id FROM school WHERE school_name = ?', [schoolName]);
    if (rows.length > 0) return rows[0].school_id;
    // Insert with no_teams = 0
    const [result] = await db.execute(
        'INSERT INTO school (school_name, province, no_teams) VALUES (?, ?, ?)',
        [schoolName, province || null, 0]
    );
    return result.insertId;
};

// Helper: send a buffer as downloadable file
const sendBufferAsDownload = (res, buffer, filename) => {
    if (!buffer || buffer.length === 0) {
        return res.status(404).json({ message: 'File not found.' });
    }
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
};

// Helper: copy BLOB from team_request to team (used during approval)
const copyBlobIfExists = async (connection, requestId, teamId, fieldName) => {
    const [rows] = await connection.execute(
        `SELECT ${fieldName} FROM team_request WHERE request_id = ?`,
        [requestId]
    );
    const blob = rows[0]?.[fieldName];
    if (blob) {
        await connection.execute(
            `UPDATE team SET ${fieldName} = ? WHERE team_id = ?`,
            [blob, teamId]
        );
    }
};

// =======================
// POST – Register a new team (uploads files into database as BLOBs)
// =======================
router.post('/', upload.any(), async (req, res) => {
    // ... (unchanged, same as your current code)
    console.log('📥 Registration request received');
    console.log('Files:', req.files.map(f => f.fieldname));

    try {
        let teamData, studentsData, coachData;
        try {
            teamData = JSON.parse(req.body.team);
            studentsData = JSON.parse(req.body.students);
            coachData = JSON.parse(req.body.coach);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            return res.status(400).json({ message: 'Invalid JSON data', error: parseErr.message });
        }

        const schoolId = await findOrCreateSchool(teamData.school, teamData.province);
        if (!schoolId) {
            return res.status(400).json({ message: 'School name is required' });
        }

        const getFileBuffer = (fieldname) => {
            const file = req.files.find(f => f.fieldname === fieldname);
            return file ? file.buffer : null;
        };

        const materialBill = getFileBuffer('material_bill');
        const engineeringPlan = getFileBuffer('engineering_plan');
        const projectReport = getFileBuffer('project_report');
        const engineeringJournal = getFileBuffer('engineering_journal');

        const [teamResult] = await db.execute(
            `INSERT INTO team_request 
            (team_name, category, school_id, theme, province, event, project_description, how_heard,
             material_bill, engineering_plan, project_report, engineering_journal, is_approved, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                teamData.team_name,
                teamData.category,
                schoolId,
                teamData.thematic_focus,
                teamData.province,
                teamData.event_id,
                teamData.project_description,
                teamData.how_heard,
                materialBill,
                engineeringPlan,
                projectReport,
                engineeringJournal,
                0
            ]
        );
        const requestId = teamResult.insertId;
        console.log(`✅ Team request created with ID ${requestId}`);

        // Insert students
        for (let i = 0; i < studentsData.length; i++) {
            const student = studentsData[i];
            const consentBuffer = getFileBuffer(`student_consent_${i}`);
            const integrityBuffer = getFileBuffer(`student_integrity_${i}`);

            await db.execute(
                `INSERT INTO student_request 
                (first_name, surname, date_of_birth, request_id, shirt_size, dietary_requirements, 
                 parent_guardian_consent_form, signed_integrity_declaration, role, grade, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    student.first_name,
                    student.surname,
                    student.date_of_birth,
                    requestId,
                    student.shirt_size,
                    student.dietary_requirements || null,
                    consentBuffer,
                    integrityBuffer,
                    student.role,
                    student.grade
                ]
            );
        }
        console.log(`✅ Inserted ${studentsData.length} students`);

        // Insert coach
        const coachIntegrity = getFileBuffer('coach_integrity');
        await db.execute(
            `INSERT INTO coach_request 
            (first_name, surname, email, phone_no, date_of_birth, request_id, staff_number, 
             dietary_requirements, shirt_size, signed_integrity_declaration, school_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                coachData.first_name,
                coachData.surname,
                coachData.email,
                coachData.phone_no,
                coachData.date_of_birth,
                requestId,
                coachData.staff_number,
                coachData.dietary_requirements || null,
                coachData.shirt_size,
                coachIntegrity,
                schoolId
            ]
        );
        console.log(`✅ Coach inserted for request ${requestId}`);

        res.status(201).json({ message: 'Registration submitted successfully', requestId });
    } catch (err) {
        console.error('❌ Registration error:', err);
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
});

// =======================
// GET /api/register – List all requests with filters (admin dashboard)
// =======================
router.get('/', async (req, res) => {
    // ... unchanged (same as your current code)
    try {
        const { search, is_approved } = req.query;
        let query = `
            SELECT r.request_id, r.team_name, r.category, r.theme, r.province, r.event,
                   r.project_description, r.how_heard, r.is_approved, r.created_at,
                   s.school_name, e.name AS event_name,
                   (r.material_bill IS NOT NULL) AS has_material_bill,
                   (r.engineering_plan IS NOT NULL) AS has_engineering_plan,
                   (r.project_report IS NOT NULL) AS has_project_report,
                   (r.engineering_journal IS NOT NULL) AS has_engineering_journal
            FROM team_request r
            LEFT JOIN school s ON r.school_id = s.school_id
            LEFT JOIN event e ON r.event = e.event_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ` AND (r.team_name LIKE ? OR r.province LIKE ? OR s.school_name LIKE ?)`;
            const like = `%${search}%`;
            params.push(like, like, like);
        }
        if (is_approved !== undefined) {
            query += ` AND r.is_approved = ?`;
            params.push(is_approved === '1' ? 1 : 0);
        }
        query += ` ORDER BY r.created_at DESC`;

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
});

// =======================
// GET /api/register/:id – Fetch one request with file existence flags
// =======================
router.get('/:id', async (req, res) => {
    // ... unchanged (same as your current code)
    try {
        const requestId = req.params.id;

        const [teamRows] = await db.execute(`
            SELECT 
                r.request_id, r.team_name, r.category, r.school_id, r.theme, r.province, r.event,
                r.project_description, r.how_heard, r.is_approved, r.created_at,
                s.school_name, e.name AS event_name,
                (r.material_bill IS NOT NULL) AS has_material_bill,
                (r.engineering_plan IS NOT NULL) AS has_engineering_plan,
                (r.project_report IS NOT NULL) AS has_project_report,
                (r.engineering_journal IS NOT NULL) AS has_engineering_journal
            FROM team_request r
            LEFT JOIN school s ON r.school_id = s.school_id
            LEFT JOIN event e ON r.event = e.event_id
            WHERE r.request_id = ?
        `, [requestId]);

        if (teamRows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        const team = teamRows[0];

        const [students] = await db.execute(`
            SELECT 
                student_id, first_name, surname, date_of_birth, grade, role,
                dietary_requirements, shirt_size, created_at,
                (parent_guardian_consent_form IS NOT NULL) AS has_consent,
                (signed_integrity_declaration IS NOT NULL) AS has_integrity
            FROM student_request
            WHERE request_id = ?
        `, [requestId]);

        const [coachRows] = await db.execute(`
            SELECT 
                coach_id, first_name, surname, email, phone_no, date_of_birth,
                staff_number, dietary_requirements, shirt_size, school_id, created_at,
                (signed_integrity_declaration IS NOT NULL) AS has_integrity
            FROM coach_request
            WHERE request_id = ?
        `, [requestId]);
        const coach = coachRows[0] || null;

        res.json({ team, students, coach });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch request details' });
    }
});

// =======================
// PUT /api/register/:id/approve – Approve request, create records, send rich HTML email
// =======================
router.put('/:id/approve', async (req, res) => {
    const requestId = req.params.id;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Get request details
        const [teamReqRows] = await connection.execute(
            `SELECT * FROM team_request WHERE request_id = ?`,
            [requestId]
        );
        if (teamReqRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Request not found' });
        }
        const teamReq = teamReqRows[0];

        const [studentsReq] = await connection.execute(
            `SELECT * FROM student_request WHERE request_id = ?`,
            [requestId]
        );
        const [coachReqRows] = await connection.execute(
            `SELECT * FROM coach_request WHERE request_id = ?`,
            [requestId]
        );
        const coachReq = coachReqRows[0];

        // 2. Get event details for email (optional)
        const [eventRows] = await connection.execute(
            `SELECT name, date, venue, start_time, end_time, category 
             FROM event WHERE event_id = ?`,
            [teamReq.event]
        );
        const event = eventRows[0];

        // 3. Find or create coach by email (avoid duplication)
        let coachId = null;
        if (coachReq) {
            const [existingCoach] = await connection.execute(
                `SELECT coach_id FROM coach WHERE email = ?`,
                [coachReq.email]
            );
            if (existingCoach.length > 0) {
                coachId = existingCoach[0].coach_id;
                // Optionally update existing coach with new info? Skipping for now.
            } else {
                // Generate password: first_name + surname + year_of_birth
                const rawPassword = `${coachReq.first_name}${coachReq.surname}${new Date(coachReq.date_of_birth).getFullYear()}`;
                const hashedPassword = bcrypt.hashSync(rawPassword, 10);

                const [coachResult] = await connection.execute(
                    `INSERT INTO coach 
                    (first_name, surname, email, phone_no, date_of_birth, staff_number, 
                     dietary_requirements, shirt_size, signed_integrity_declaration, school_id, password_hash, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        coachReq.first_name,
                        coachReq.surname,
                        coachReq.email,
                        coachReq.phone_no,
                        coachReq.date_of_birth,
                        coachReq.staff_number,
                        coachReq.dietary_requirements,
                        coachReq.shirt_size,
                        coachReq.signed_integrity_declaration,
                        teamReq.school_id,
                        hashedPassword
                    ]
                );
                coachId = coachResult.insertId;

                // Send email with credentials
                try {
                    await sendEmail(
                        coachReq.email,
                        'Your Lumeriar Coach Account',
                        {
                            name: `${coachReq.first_name} ${coachReq.surname}`,
                            role: 'Coach',
                            email: coachReq.email,
                            password: rawPassword,
                            login_url: process.env.FRONTEND_URL + '/login',
                        },
                        process.env.EMAILJS_TEMPLATE_PASSWORD
                    );
                    console.log(`✅ Coach login email sent to ${coachReq.email}`);
                } catch (emailError) {
                    console.error(`❌ Failed to send coach email:`, emailError.message);
                }
            }
        }

        // 4. Create team record (without BLOBs initially)
        const [teamResult] = await connection.execute(
            `INSERT INTO team 
            (team_name, category, school_id, theme, province, event, project_description, how_heard, coach_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                teamReq.team_name,
                teamReq.category,
                teamReq.school_id,
                teamReq.theme,
                teamReq.province,
                teamReq.event,
                teamReq.project_description,
                teamReq.how_heard,
                coachId
            ]
        );
        const teamId = teamResult.insertId;

        // 5. Copy BLOB fields from team_request to team
        await copyBlobIfExists(connection, requestId, teamId, 'material_bill');
        await copyBlobIfExists(connection, requestId, teamId, 'engineering_plan');
        await copyBlobIfExists(connection, requestId, teamId, 'project_report');
        await copyBlobIfExists(connection, requestId, teamId, 'engineering_journal');

        // 6. Create student records
        for (const student of studentsReq) {
            await connection.execute(
                `INSERT INTO student 
                (first_name, surname, date_of_birth, team_id, grade, role, shirt_size, 
                 dietary_requirements, parent_guardian_consent_form, signed_integrity_declaration, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    student.first_name,
                    student.surname,
                    student.date_of_birth,
                    teamId,
                    student.grade,
                    student.role,
                    student.shirt_size,
                    student.dietary_requirements,
                    student.parent_guardian_consent_form,
                    student.signed_integrity_declaration
                ]
            );
        }

        // 7. Create event_team record
        const [eventTeamResult] = await connection.execute(
            `INSERT INTO event_team (team_id, event_id, total_points, created_at)
             VALUES (?, ?, 0, NOW())`,
            [teamId, teamReq.event]
        );
        const eventTeamId = eventTeamResult.insertId;

        // 8. Get total number of rounds for this event
        const [roundsRow] = await connection.execute(
            `SELECT rounds FROM event WHERE event_id = ?`,
            [teamReq.event]
        );
        const totalRounds = roundsRow[0]?.rounds || 1;

        // 9. Create empty score rows for each round (1 to totalRounds)
        for (let round = 1; round <= totalRounds; round++) {
            await connection.execute(
                `INSERT INTO score 
                (event_team_id, round, technical_score, innovation_design_score, theme_score, 
                 real_world_score, teamwork_score, judge_id, is_approved)
                 VALUES (?, ?, 0, 0, 0, 0, 0, NULL, 0)`,
                [eventTeamId, round]
            );
        }

        // 10. Mark request as approved
        await connection.execute(
            `UPDATE team_request SET is_approved = 1 WHERE request_id = ?`,
            [requestId]
        );

        await connection.commit();

        // 11. Send confirmation email using EmailJS (rich HTML)
        if (coachReq && coachReq.email) {
            // Build HTML table rows for students
            let studentsHtml = '';
            for (const student of studentsReq) {
                studentsHtml += `
                    <tr>
                        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(student.first_name)} ${escapeHtml(student.surname)}</td>
                        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(student.grade)}</td>
                        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(student.role || '—')}</td>
                        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(student.shirt_size || '—')}</td>
                    </tr>
                `;
            }

            const templateParams = {
                coach_name: `${coachReq.first_name} ${coachReq.surname}`,
                team_name: teamReq.team_name,
                event_name: event.name,
                event_date: new Date(event.date).toLocaleDateString(),
                event_venue: event.venue || 'TBA',
                event_start_time: event.start_time ? event.start_time.slice(0, 5) : 'TBA',
                event_end_time: event.end_time ? event.end_time.slice(0, 5) : 'TBA',
                event_category: event.category || 'General',
                school_name: teamReq.school_name || (await getSchoolName(teamReq.school_id)),
                team_category: teamReq.category,
                thematic_focus: teamReq.theme,
                project_description: teamReq.project_description,
                students_table_rows: studentsHtml,
            };

            try {
                await sendEmail(coachReq.email, 'Your team registration has been approved!', templateParams);
                console.log(`✅ Email sent to ${coachReq.email}`);
            } catch (emailError) {
                console.error(`❌ Failed to send email to ${coachReq.email}:`, emailError.message);
            }
        }

        res.json({ message: 'Request approved, team created, and coach created.' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Approval error:', err);
        res.status(500).json({ message: 'Failed to approve request', error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// Helper to escape HTML
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
// Helper to get school name (fallback)
async function getSchoolName(schoolId) {
    if (!schoolId) return 'Unknown School';
    const [rows] = await db.execute('SELECT school_name FROM school WHERE school_id = ?', [schoolId]);
    return rows[0]?.school_name || 'Unknown School';
}

// =======================
// DOWNLOAD ENDPOINTS – Retrieve binary files from database
// =======================
router.get('/:id/download/team/:field', async (req, res) => {
    // ... unchanged (same as your current code)
    const { id, field } = req.params;
    const allowed = ['material_bill', 'engineering_plan', 'project_report', 'engineering_journal'];
    if (!allowed.includes(field)) return res.status(400).json({ message: 'Invalid field.' });

    try {
        const [rows] = await db.execute(`SELECT ${field} FROM team_request WHERE request_id = ?`, [id]);
        const buffer = rows[0]?.[field];
        sendBufferAsDownload(res, buffer, `${field}_${id}.pdf`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Download failed.' });
    }
});

router.get('/:id/download/student/:index/:field', async (req, res) => {
    // ... unchanged
    const { id, index, field } = req.params;
    const allowed = ['parent_guardian_consent_form', 'signed_integrity_declaration'];
    if (!allowed.includes(field)) return res.status(400).json({ message: 'Invalid field.' });

    try {
        const [students] = await db.execute(
            `SELECT ${field} FROM student_request WHERE request_id = ? ORDER BY student_id`,
            [id]
        );
        const studentIdx = parseInt(index, 10);
        const buffer = students[studentIdx]?.[field];
        sendBufferAsDownload(res, buffer, `${field}_${id}_${index}.pdf`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Download failed.' });
    }
});

router.get('/:id/download/coach/integrity', async (req, res) => {
    // ... unchanged
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT signed_integrity_declaration FROM coach_request WHERE request_id = ?',
            [id]
        );
        const buffer = rows[0]?.signed_integrity_declaration;
        sendBufferAsDownload(res, buffer, `coach_integrity_${id}.pdf`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Download failed.' });
    }
});

// PUT /api/register/:id/reject
router.put('/:id/reject', async (req, res) => {
    const requestId = req.params.id;
    try {
        const [result] = await db.execute('UPDATE team_request SET is_approved = -1 WHERE request_id = ?', [requestId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Request not found.' });
        res.json({ message: 'Request rejected.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to reject request.' });
    }
});

module.exports = router;