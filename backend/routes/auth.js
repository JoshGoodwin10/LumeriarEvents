const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const db       = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ─── POST /api/auth/login ────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email_address, password } = req.body;

  // Basic validation
  if (!email_address || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // 1. Look up user by email
    const [rows] = await db.execute(
      "SELECT LoginID, password, email_address, created_at FROM Login WHERE email_address = ?",
      [email_address]
    );

    if (rows.length === 0) {
      // Use a generic message to avoid revealing whether the email exists
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    // 2. Compare password
    //    Assumes passwords are stored as bcrypt hashes.
    //    See the hashing utility at the bottom of this file if you need to
    //    migrate plain-text passwords.
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3. Sign JWT
    const token = jwt.sign(
      {
        LoginID:       user.LoginID,
        email_address: user.email_address,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // 4. Return token + safe user object (never return the password hash)
    return res.json({
      token,
      user: {
        LoginID:       user.LoginID,
        email_address: user.email_address,
        created_at:    user.created_at,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// ─── GET /api/auth/verify ────────────────────────────────────
// Used by the frontend to check whether a stored token is still valid
router.get("/verify", authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;

// ─── UTILITY: Hash a plain-text password (run once in a script) ─
// const bcrypt = require("bcryptjs");
// const hash = await bcrypt.hash("plainTextPassword", 10);
// Then UPDATE Login SET password = hash WHERE LoginID = ?;
