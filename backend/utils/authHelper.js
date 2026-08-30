// utils/authHelpers.js
const bcrypt = require('bcrypt');
const db = require('../db');
const { sendEmail } = require('./email');

async function createLoginAndSendEmail(email, rawPassword, role, userId, firstName) {
    // Hash password using bcrypt (same as existing)
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    // Insert into login table
    await db.execute(
        'INSERT INTO login (email_address, password, role, user_id) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, role, userId]
    );

    // Send email with credentials
    await sendEmail(
        email,
        `Your Lumeriar ${role.charAt(0).toUpperCase() + role.slice(1)} Account`,
        `Dear ${firstName},\n\nYour ${role} account has been created.\nEmail: ${email}\nTemporary password: ${rawPassword}\n\nPlease log in and change your password immediately.\n\nLogin: ${process.env.FRONTEND_URL}/login`
    );
}

module.exports = { createLoginAndSendEmail };