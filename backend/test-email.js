// test-email.js
require('dotenv').config();
const sendEmail = require('./utils/email');   // 👈 now this is the function

sendEmail('bushpig2003@gmail.com', 'Test Subject', { name: 'Test', message: 'Hello' })
    .then(() => console.log('Email sent successfully'))
    .catch(console.error);