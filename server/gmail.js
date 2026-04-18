import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_PATH = path.join(__dirname, "gmail_token.json");

/**
 * Gmail Integration Module
 *
 * Handles OAuth2 authentication and email fetching from Gmail API.
 * Flow: getAuthUrl() → user consents → handleCallback() → fetchEmails()
 */

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/gmail/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generate the Google OAuth2 consent URL
 */
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  });
}

/**
 * Exchange the authorization code for tokens and save them
 */
export async function handleCallback(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save tokens for future use
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log("  ✅ Gmail tokens saved");

  return tokens;
}

/**
 * Check if we have saved Gmail tokens
 */
export function isGmailConnected() {
  return fs.existsSync(TOKEN_PATH);
}

/**
 * Get an authenticated Gmail client
 */
function getAuthenticatedClient() {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error("Gmail not connected. Please authenticate first.");
  }

  const oauth2Client = getOAuth2Client();
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
  oauth2Client.setCredentials(tokens);

  return oauth2Client;
}

/**
 * Decode base64url encoded email body
 */
function decodeBase64Url(data) {
  if (!data) return "";
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Extract the text body from email parts (handles multipart messages)
 */
function extractBody(payload) {
  // Simple body
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart — look for text/plain first, then text/html
  if (payload.parts) {
    // Try text/plain first
    const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
    if (textPart?.body?.data) {
      return decodeBase64Url(textPart.body.data);
    }

    // Try text/html and strip tags
    const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
    if (htmlPart?.body?.data) {
      const html = decodeBase64Url(htmlPart.body.data);
      return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 3000); // Cap body length
    }

    // Nested multipart
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }

  return "(No readable body content)";
}

/**
 * Get a header value from Gmail message headers
 */
function getHeader(headers, name) {
  const header = headers?.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header?.value || "";
}

/**
 * Fetch recent emails from Gmail
 * @param {number} maxResults - Number of emails to fetch (default 10, max 20)
 * @param {string} query - Gmail search query (default: inbox emails)
 */
export async function fetchEmails(maxResults = 10, query = "in:inbox") {
  const oauth2Client = getAuthenticatedClient();
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  console.log(`  📨 Fetching ${maxResults} emails from Gmail (query: "${query}")...`);

  // List message IDs
  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults: Math.min(maxResults, 20),
    q: query,
  });

  const messages = listRes.data.messages || [];

  if (messages.length === 0) {
    return [];
  }

  // Fetch full message details for each
  const emails = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: messages[i].id,
      format: "full",
    });

    const headers = msg.data.payload?.headers || [];
    const subject = getHeader(headers, "Subject") || "(No Subject)";
    const sender = getHeader(headers, "From") || "(Unknown Sender)";
    const body = extractBody(msg.data.payload);

    emails.push({
      id: i + 1,
      gmailId: messages[i].id,
      subject,
      sender,
      body: body.substring(0, 3000), // Cap for AI processing
    });
  }

  console.log(`  ✅ Fetched ${emails.length} emails from Gmail`);
  return emails;
}

/**
 * Disconnect Gmail (remove saved tokens)
 */
export function disconnectGmail() {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
    console.log("  🔌 Gmail disconnected, tokens removed");
  }
}
