// utils/email.js
const emailjs = require('@emailjs/nodejs');

async function sendEmail(to, subject, templateParams, templateId = null) {
    const params = {
        ...templateParams,
        to_email: to,
        subject: subject,
    };
    const effectiveTemplateId = templateId || process.env.EMAILJS_TEMPLATE_ID;
    console.log('📧 Sending email with params:', JSON.stringify(params, null, 2));

    try {
        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            effectiveTemplateId,
            params,
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );
        console.log(`✅ Email sent to ${to}:`, response.status, response.text);
        return response;
    } catch (err) {
        console.error(`❌ Failed to send email to ${to}:`, err);
        throw new Error(`EmailJS error: ${err.text || err.message}`);
    }
}

module.exports = sendEmail;