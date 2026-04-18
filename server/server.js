import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { processEmails } from "./agent.js";
import sampleEmails from "./sampleEmails.js";
import {
  getAuthUrl,
  handleCallback,
  isGmailConnected,
  fetchEmails,
  disconnectGmail,
} from "./gmail.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    agent: "AI Email Inbox Cleaner",
    version: "1.0.0",
    gmailConnected: isGmailConnected(),
  });
});

/**
 * Get sample emails for demo mode
 */
app.get("/api/sample-emails", (req, res) => {
  res.json({ emails: sampleEmails });
});

// ==========================================
// Gmail OAuth2 Endpoints
// ==========================================

/**
 * Check Gmail connection status
 */
app.get("/api/gmail/status", (req, res) => {
  res.json({ connected: isGmailConnected() });
});

/**
 * Start Gmail OAuth2 flow — returns the consent URL
 */
app.get("/api/gmail/auth", (req, res) => {
  try {
    const url = getAuthUrl();
    res.json({ authUrl: url });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      hint: "Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file",
    });
  }
});

/**
 * Gmail OAuth2 callback — Google redirects here after user consents
 */
app.get("/api/gmail/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    await handleCallback(code);
    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}?gmail=connected`);
  } catch (err) {
    console.error("Gmail callback error:", err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}?gmail=error&message=${encodeURIComponent(err.message)}`);
  }
});

/**
 * Fetch emails from Gmail
 * Query params: count (number), query (Gmail search query)
 */
app.get("/api/gmail/fetch", async (req, res) => {
  try {
    const count = Math.min(parseInt(req.query.count) || 10, 20);
    const query = req.query.query || "in:inbox";
    const emails = await fetchEmails(count, query);
    res.json({ emails, count: emails.length });
  } catch (err) {
    console.error("Gmail fetch error:", err);
    res.status(500).json({
      error: "Failed to fetch Gmail emails",
      message: err.message,
    });
  }
});

/**
 * Disconnect Gmail
 */
app.post("/api/gmail/disconnect", (req, res) => {
  disconnectGmail();
  res.json({ success: true, message: "Gmail disconnected" });
});

// ==========================================
// AI Agent Endpoint
// ==========================================

/**
 * Process emails through the AI agent pipeline
 *
 * Body: { emails: [{id, subject, sender, body}, ...] }
 * Response: Full structured analysis
 */
app.post("/api/process-emails", async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        error: "Please provide an array of emails",
        expected: {
          emails: [
            {
              subject: "string",
              sender: "string",
              body: "string",
            },
          ],
        },
      });
    }

    // Validate email structure
    for (const email of emails) {
      if (!email.subject || !email.sender || !email.body) {
        return res.status(400).json({
          error:
            "Each email must have subject, sender, and body fields",
          invalidEmail: email,
        });
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error:
          "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.",
      });
    }

    console.log(`\n🤖 Processing ${emails.length} emails through AI agent...`);

    const stageLog = [];
    const result = await processEmails(emails, (update) => {
      const icon =
        update.status === "processing" ? "⏳" : "✅";
      console.log(
        `  ${icon} Stage ${update.stage}: ${update.name} — ${update.status}`
      );
      stageLog.push(update);
    });

    console.log(`✨ Done! Processed ${result.totalEmails} emails.\n`);

    res.json({
      success: true,
      pipeline: {
        stages: [
          "Classification & Urgency Detection",
          "Summarization & Action Items",
          "Reply Generation",
        ],
        stageLog,
      },
      ...result,
    });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({
      error: "Failed to process emails",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Email Agent Server running on http://localhost:${PORT}`);
  console.log(`📧 POST /api/process-emails — Process emails`);
  console.log(`📋 GET  /api/sample-emails  — Get sample emails`);
  console.log(`📬 GET  /api/gmail/auth     — Connect Gmail`);
  console.log(`📨 GET  /api/gmail/fetch    — Fetch Gmail emails`);
  console.log(`💚 GET  /api/health          — Health check`);
  console.log(`\n📌 Gmail status: ${isGmailConnected() ? "✅ Connected" : "❌ Not connected"}\n`);
});
