/**
 * hash-password.js
 * Run with: node hash-password.js "yourPlainTextPassword"
 *
 * Then UPDATE your Login table:
 *   UPDATE Login SET password = '<output_hash>' WHERE LoginID = ?;
 */

const bcrypt = require("bcryptjs");

const plain = process.argv[2];

if (!plain) {
  console.error("Usage: node hash-password.js <plainTextPassword>");
  process.exit(1);
}

bcrypt.hash(plain, 10).then(hash => {
  console.log("\nBcrypt hash (copy this into your DB):\n");
  console.log(hash);
  console.log();
});
