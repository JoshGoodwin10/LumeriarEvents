const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/requests/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Helper: find or create school
const findOrCreateSchool = async (schoolName) => {
    if (!schoolName) return null;
    const [rows] = await db.execute('SELECT school_id FROM School WHERE school_name = ?', [schoolName]);
    if (rows.length > 0) return rows[0].school_id;
    const [result] = await db.execute('INSERT INTO School (school_name) VALUES (?)', [schoolName]);
    return result.insertId;
};

// POST /api/register - accept any file fields (.any())
router.post('/', upload.any(), async (req, res) => {
    console.log('📥 Registration request received');
    console.log('Files:', req.files.map(f => f.fieldname));

    try {
        // 1. Parse JSON strings
        let teamData, studentsData, coachData;
        try {
            teamData = JSON.parse(req.body.team);
            studentsData = JSON.parse(req.body.students);
            coachData = JSON.parse(req.body.coach);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            return res.status(400).json({ message: 'Invalid JSON data', error: parseErr.message });
        }

        // 2. Find or create school
        const schoolId = await findOrCreateSchool(teamData.school);
        if (!schoolId) {
            return res.status(400).json({ message: 'School name is required' });
        }

        // Helper to get uploaded file path by fieldname
        const getFile = (fieldname) => {
            const file = req.files.find(f => f.fieldname === fieldname);
            return file ? file.filename : null;
        };

        // 3. Insert into team_request
        const materialBill = getFile('material_bill');
        const engineeringPlan = getFile('engineering_plan');
        const projectReport = getFile('project_report');
        const engineeringJournal = getFile('engineering_journal');

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
                0   // is_approved = false
            ]
        );
        const requestId = teamResult.insertId;
        console.log(`✅ Team request created with ID ${requestId}`);

        // 4. Insert students
        for (let i = 0; i < studentsData.length; i++) {
            const student = studentsData[i];
            const consentFile = getFile(`student_consent_${i}`);
            const integrityFile = getFile(`student_integrity_${i}`);

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
                    consentFile,
                    integrityFile,
                    student.role,
                    student.grade
                ]
            );
        }
        console.log(`✅ Inserted ${studentsData.length} students`);

        // 5. Insert coach
        const coachIntegrity = getFile('coach_integrity');
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

// GET /api/register/:id - fetch single request with all details
router.get('/:id', async (req, res) => {
    try {
        const requestId = req.params.id;

        // Get team request
        const [teamRows] = await db.execute(`
            SELECT r.*, s.school_name, e.name AS event_name
            FROM team_request r
            LEFT JOIN School s ON r.school_id = s.school_id
            LEFT JOIN Event e ON r.event = e.event_id
            WHERE r.request_id = ?
        `, [requestId]);

        if (teamRows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        const team = teamRows[0];

        // Get all students for this request
        const [students] = await db.execute(`
            SELECT student_id, first_name, surname, date_of_birth, grade, role,
                   dietary_requirements, shirt_size, parent_guardian_consent_form,
                   signed_integrity_declaration, created_at
            FROM student_request
            WHERE request_id = ?
        `, [requestId]);

        // Get coach for this request
        const [coachRows] = await db.execute(`
            SELECT coach_id, first_name, surname, email, phone_no, date_of_birth,
                   staff_number, dietary_requirements, shirt_size,
                   signed_integrity_declaration, school_id, created_at
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

// GET /api/register - fetch all registration requests with filters (for admin)
router.get('/', async (req, res) => {
    try {
        const { search, is_approved } = req.query;
        let query = `
            SELECT r.*, s.school_name, e.name AS event_name
            FROM team_request r
            LEFT JOIN School s ON r.school_id = s.school_id
            LEFT JOIN Event e ON r.event = e.event_id
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

// PUT /api/register/:id/approve - approve a request (admin)
router.put('/:id/approve', async (req, res) => {
    try {
        const [result] = await db.execute('UPDATE team_request SET is_approved = 1 WHERE request_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request approved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to approve' });
    }
});

// GET /api/register/:id/download/:field
// Download a specific file from a registration request
router.get('/:id/download/:field', async (req, res) => {
    try {
        const requestId = req.params.id;
        const field = req.params.field;

        // Allowed fields (from team_request, student_request, coach_request)
        const allowedFields = [
            'material_bill', 'engineering_plan', 'project_report', 'engineering_journal',
            'parent_guardian_consent', 'signed_integrity_declaration', 'coach_integrity'
        ];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ message: 'Invalid file field' });
        }

        let filename = null;
        let studentIndex = null;
        let isStudentField = false;
        let isCoachField = false;

        // Handle student files: they come as "parent_guardian_consent_0" or "signed_integrity_declaration_0"
        if (field.startsWith('parent_guardian_consent')) {
            const match = field.match(/parent_guardian_consent_(\d+)/);
            if (match) {
                studentIndex = parseInt(match[1], 10);
                isStudentField = true;
            }
        } else if (field.startsWith('signed_integrity_declaration')) {
            const match = field.match(/signed_integrity_declaration_(\d+)/);
            if (match) {
                studentIndex = parseInt(match[1], 10);
                isStudentField = true;
            }
        } else if (field === 'coach_integrity') {
            isCoachField = true;
        }

        // Query the request details
        const [teamRows] = await db.execute('SELECT * FROM team_request WHERE request_id = ?', [requestId]);
        if (teamRows.length === 0) return res.status(404).json({ message: 'Request not found' });

        if (!isStudentField && !isCoachField && teamRows[0][field]) {
            filename = teamRows[0][field];
        } else if (isCoachField) {
            const [coachRows] = await db.execute('SELECT signed_integrity_declaration FROM coach_request WHERE request_id = ?', [requestId]);
            if (coachRows.length && coachRows[0].signed_integrity_declaration) {
                filename = coachRows[0].signed_integrity_declaration;
            }
        } else if (isStudentField && studentIndex !== null) {
            const [studentRows] = await db.execute('SELECT parent_guardian_consent_form, signed_integrity_declaration FROM student_request WHERE request_id = ?', [requestId]);
            if (studentRows.length > studentIndex) {
                if (field.startsWith('parent_guardian_consent')) {
                    filename = studentRows[studentIndex].parent_guardian_consent_form;
                } else if (field.startsWith('signed_integrity_declaration')) {
                    filename = studentRows[studentIndex].signed_integrity_declaration;
                }
            }
        }

        if (!filename) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '../uploads/requests/', filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File does not exist on server' });
        }

        res.download(filePath, filename);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Download failed' });
    }
});

module.exports = router;