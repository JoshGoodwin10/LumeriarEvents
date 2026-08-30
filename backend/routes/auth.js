const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }

  try {
    // 1. Check Admin table (or login table if you use unified)
    const [adminRows] = await db.execute(
      'SELECT LoginID, email_address, password FROM login WHERE email_address = ?',
      [email]
    );
    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        const token = jwt.sign(
          { userId: admin.LoginID, email: admin.email_address, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '8h' }
        );
        return res.json({ token, role: 'admin', userId: admin.LoginID });
      }
    }

    // 2. Check Coach table
    const [coachRows] = await db.execute(
      'SELECT coach_id, email, password_hash, first_name, surname FROM coach WHERE email = ?',
      [email]
    );
    if (coachRows.length > 0) {
      const coach = coachRows[0];
      const match = await bcrypt.compare(password, coach.password_hash);
      if (match) {
        const token = jwt.sign(
          { userId: coach.coach_id, email: coach.email, role: 'coach' },
          process.env.JWT_SECRET,
          { expiresIn: '8h' }
        );
        return res.json({ token, role: 'coach', userId: coach.coach_id });
      }
    }

    // 3. Check Judge table
    const [judgeRows] = await db.execute(
      'SELECT judge_id, email, password_hash FROM judge WHERE email = ?',
      [email]
    );
    if (judgeRows.length > 0) {
      const judge = judgeRows[0];
      const match = await bcrypt.compare(password, judge.password_hash);
      if (match) {
        const token = jwt.sign(
          { userId: judge.judge_id, email: judge.email, role: 'judge' },
          process.env.JWT_SECRET,
          { expiresIn: '8h' }
        );
        return res.json({ token, role: 'judge', userId: judge.judge_id });
      }
    }

    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  if (!old_password || !new_password) {
    return res.status(400).json({ message: 'Old and new passwords are required.' });
  }

  try {
    let table, idColumn;
    if (role === 'judge') {
      table = 'judge';
      idColumn = 'judge_id';
    } else if (role === 'coach') {
      table = 'coach';
      idColumn = 'coach_id';
    } else if (role === 'admin') {
      // Admin password change is not implemented here – you can add separately if needed
      return res.status(403).json({ message: 'Admin password changes are not supported.' });
    } else {
      return res.status(403).json({ message: 'Invalid role.' });
    }

    // Get current password_hash
    const [rows] = await db.execute(`SELECT password_hash FROM ${table} WHERE ${idColumn} = ?`, [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(old_password, rows[0].password_hash);
    if (!match) return res.status(401).json({ message: 'Incorrect old password.' });

    const hashedNew = bcrypt.hashSync(new_password, 10);
    await db.execute(`UPDATE ${table} SET password_hash = ? WHERE ${idColumn} = ?`, [hashedNew, userId]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

// GET /api/auth/profile – fetch current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    let table, idColumn;
    if (role === 'judge') {
      table = 'judge';
      idColumn = 'judge_id';
    } else if (role === 'coach') {
      table = 'coach';
      idColumn = 'coach_id';
    } else {
      return res.status(403).json({ message: 'Invalid role for profile fetch.' });
    }

    const [rows] = await db.execute(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
});

// PUT /api/auth/profile – update profile fields
router.put('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const { first_name, surname, phone_no, date_of_birth, shirt_size, dietary_requirements } = req.body;

  try {
    let table, idColumn;
    let updates = [];
    let values = [];

    if (role === 'judge') {
      table = 'judge';
      idColumn = 'judge_id';
      // Judge table only has these columns
      if (first_name !== undefined) { updates.push('first_name = ?'); values.push(first_name); }
      if (surname !== undefined) { updates.push('surname = ?'); values.push(surname); }
      if (phone_no !== undefined) { updates.push('phone_no = ?'); values.push(phone_no); }
      if (date_of_birth !== undefined) { updates.push('date_of_birth = ?'); values.push(date_of_birth); }
      // shirt_size and dietary_requirements are ignored for judges
    } else if (role === 'coach') {
      table = 'coach';
      idColumn = 'coach_id';
      // Coach has all these fields
      if (first_name !== undefined) { updates.push('first_name = ?'); values.push(first_name); }
      if (surname !== undefined) { updates.push('surname = ?'); values.push(surname); }
      if (phone_no !== undefined) { updates.push('phone_no = ?'); values.push(phone_no); }
      if (date_of_birth !== undefined) { updates.push('date_of_birth = ?'); values.push(date_of_birth); }
      if (shirt_size !== undefined) { updates.push('shirt_size = ?'); values.push(shirt_size); }
      if (dietary_requirements !== undefined) { updates.push('dietary_requirements = ?'); values.push(dietary_requirements); }
    } else {
      return res.status(403).json({ message: 'Invalid role for profile update.' });
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    values.push(userId);
    const query = `UPDATE ${table} SET ${updates.join(', ')} WHERE ${idColumn} = ?`;
    await db.execute(query, values);
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

module.exports = router; 