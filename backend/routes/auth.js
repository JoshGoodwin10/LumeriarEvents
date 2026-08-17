const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

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
      'SELECT coach_id, email, password_hash FROM coach WHERE email = ?',
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

module.exports = router; 