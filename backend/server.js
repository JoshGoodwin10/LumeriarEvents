const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
