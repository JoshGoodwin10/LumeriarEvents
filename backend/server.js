const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ROUTES
const authRoutes = require("./routes/auth");
const teamsRoutes = require("./routes/teams");
const schoolsRoutes = require("./routes/schools");
const studentsRoutes = require("./routes/students");
const coachesRoutes = require("./routes/coaches");
const eventsRoutes = require("./routes/events");
const scoresRoutes = require("./routes/scores");
const judgesRoutes = require("./routes/judges");
const requestsRoutes = require("./routes/requests");
const registerRoutes = require("./routes/register");
const awardsRoutes = require('./routes/awards');
const documentsRoutes = require('./routes/documents');
const appealsRoutes = require('./routes/appeals');
// etc.

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamsRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/students', studentsRoutes);
app.use("/api/coaches", coachesRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/judges", judgesRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/register", registerRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/appeals', appealsRoutes);
// etc.

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
