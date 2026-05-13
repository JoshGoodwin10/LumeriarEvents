// utils/emailService.js
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json'); // Where to store user's access token
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json'); // Path to your downloaded JSON

/**
 * Reads previously authorized credentials from the token file.
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request authorization to call the Gmail API.
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        keyfilePath: CREDENTIALS_PATH,
        scopes: SCOPES,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Creates a base64 encoded email body.
 * @param {string} to Recipient email address
 * @param {string} subject Subject line of the email
 * @param {string} bodyText Plain text body of the email
 * @returns {string} Base64 encoded email ready for the Gmail API
 */
function encodeEmail(to, subject, bodyText) {
    // Construct a raw email string
    const email = [
        `To: ${to}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        bodyText,
    ].join('\n');

    // Encode the email string to base64, then make it URL-safe
    return Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Sends an email using the Gmail API.
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} body Email body (plain text)
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, body) {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    const rawMessage = encodeEmail(to, subject, body);

    try {
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage,
            },
        });
        console.log(`✅ Email sent to ${to}:`, response.data.id);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        throw new Error(`Gmail API error: ${error.message}`);
    }
}

module.exports = { sendEmail };