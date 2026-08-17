const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql-223c0825-lumeriar-bushpig2003-44b1-lumeriar.j.aivencloud.com",
  port: parseInt(process.env.DB_PORT || "16553"),
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_GH7_aBBEA_STciEbE3M",
  database: process.env.DB_NAME || "lumeriartest",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log("✅  MySQL connected");
    conn.release();
  })
  .catch(err => {
    console.error("❌  MySQL connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
