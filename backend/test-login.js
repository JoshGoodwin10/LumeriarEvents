// test-login.js
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
    });

    const [rows] = await db.execute(
        'SELECT * FROM Login WHERE email_address = ?', ['test@email.com']
    );

    if (rows.length === 0) {
        console.log('❌ No user found with that email');
        return;
    }

    const user = rows[0];
    console.log('✅ User found:', user.LoginID);
    console.log('🔑 Hash in DB:', user.password);
    console.log('🔑 Hash length:', user.password.length);

    const match = await bcrypt.compare('testpass', user.password);
    console.log('🔐 Password match:', match);

    await db.end();
}

test().catch(console.error);