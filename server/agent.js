import OpenAI from "openai";

/**
 * AI Email Agent — 3-Stage Agentic Pipeline
 *
 * Stage 1: Classification & Urgency Detection
 * Stage 2: Summarization & Action Item Extraction
 * Stage 3: Reply Generation (for important emails)
 *
 * Supports both OpenAI direct keys and OpenRouter keys (sk-or-v1-*)
 */

/**
 * Create the AI client — auto-detects OpenRouter vs direct OpenAI
 */
function createClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  const isOpenRouter = apiKey?.startsWith("sk-or-");

  if (isOpenRouter) {
    console.log("  🔀 Using OpenRouter proxy");
    return {
      client: new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      }),
      model: "openai/gpt-4o-mini",
    };
  }

  return {
    client: new OpenAI({ apiKey }),
    model: "gpt-4o-mini",
  };
}

const CLASSIFICATION_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "email_classifications",
    strict: true,
    schema: {
      type: "object",
      properties: {
        classifications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              emailId: {
                type: "number",
                description: "The ID of the email being classified",
              },
              category: {
                type: "string",
                enum: ["Important", "Action Required", "Ignore", "Spam"],
                description: "The classification category",
              },
              urgency: {
                type: "string",
                enum: ["Critical", "High", "Medium", "Low", "None"],
                description: "Urgency level of the email",
              },
              reasoning: {
                type: "string",
                description:
                  "Clear, human-readable reasoning for why this classification was chosen",
              },
              deadlineDetected: {
                type: "string",
                description:
                  "Any deadline mentioned in the email, or 'None' if no deadline found",
              },
            },
            required: [
              "emailId",
              "category",
              "urgency",
              "reasoning",
              "deadlineDetected",
            ],
            additionalProperties: false,
          },
        },
      },
      required: ["classifications"],
      additionalProperties: false,
    },
  },
};

const SUMMARY_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "email_summaries",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summaries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              emailId: {
                type: "number",
                description: "The ID of the email",
              },
              summary: {
                type: "string",
                description:
                  "A concise one-line summary of the email (max 20 words)",
              },
              actionItems: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "List of specific action items extracted from the email. Empty array if none.",
              },
              keyEntities: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "Key people, dates, amounts, or entities mentioned",
              },
            },
            required: ["emailId", "summary", "actionItems", "keyEntities"],
            additionalProperties: false,
          },
        },
      },
      required: ["summaries"],
      additionalProperties: false,
    },
  },
};

const REPLY_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "email_replies",
    strict: true,
    schema: {
      type: "object",
      properties: {
        replies: {
          type: "array",
          items: {
            type: "object",
            properties: {
              emailId: {
                type: "number",
                description: "The ID of the email being replied to",
              },
              suggestedReply: {
                type: "string",
                description:
                  "A professional, contextually appropriate reply to the email",
              },
              tone: {
                type: "string",
                enum: ["Formal", "Professional", "Casual", "Urgent"],
                description: "The tone used in the suggested reply",
              },
            },
            required: ["emailId", "suggestedReply", "tone"],
            additionalProperties: false,
          },
        },
      },
      required: ["replies"],
      additionalProperties: false,
    },
  },
};

/**
 * Format emails into a readable string for prompts
 */
function formatEmailsForPrompt(emails) {
  return emails
    .map(
      (e) =>
        `--- EMAIL ID: ${e.id} ---\nFrom: ${e.sender}\nSubject: ${e.subject}\nBody:\n${e.body}\n--- END EMAIL ${e.id} ---`
    )
    .join("\n\n");
}

/**
 * Stage 1: Classify emails and detect urgency
 */
async function classifyEmails(client, model, emails) {
  const formattedEmails = formatEmailsForPrompt(emails);

  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: `You are an expert email triage assistant. Your job is to classify emails into exactly one of these categories:

- **Important**: Emails from real people or organizations that contain significant information, require attention, or involve business relationships (partnership proposals, client communications, HR notices, billing from real services).
- **Action Required**: Emails that explicitly request the recipient to DO something — submit a report, attend a meeting, complete a task, make a decision, or respond by a deadline.
- **Ignore**: Low-priority emails that are informational only — newsletters, digests, casual social messages, FYI-type emails with no required action.
- **Spam**: Unsolicited promotional emails, phishing attempts, scams, or emails from unknown/suspicious senders trying to sell something or extract personal information.

CLASSIFICATION RULES:
1. If an email has BOTH important info AND a required action, classify as "Action Required" (action takes priority).
2. Look for urgency signals: deadlines, words like "URGENT", "ASAP", "immediately", "by [date]", "reminder", "final notice".
3. Phishing indicators: requests for personal/financial info, suspicious domains, too-good-to-be-true offers, excessive urgency with unknown senders.
4. Newsletters and marketing from legitimate companies that the user subscribed to are "Ignore", not "Spam".
5. Always provide clear, specific reasoning that references actual content from the email.`,
      },
      {
        role: "user",
        content: `Classify each of the following emails:\n\n${formattedEmails}`,
      },
    ],
    response_format: CLASSIFICATION_SCHEMA,
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Stage 2: Summarize emails and extract action items
 */
async function summarizeEmails(client, model, emails) {
  const formattedEmails = formatEmailsForPrompt(emails);

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `You are a concise email summarization assistant. For each email:

1. Write a ONE-LINE summary (max 20 words) that captures the core message. Be specific, not generic.
2. Extract ALL action items — specific tasks the recipient needs to do. Each action item should be a clear, actionable statement. If there are no action items, return an empty array.
3. Extract key entities — important names, dates, dollar amounts, deadlines, or organizations mentioned.

Be precise. Don't add action items that aren't explicitly stated or implied in the email.`,
      },
      {
        role: "user",
        content: `Summarize each email and extract action items:\n\n${formattedEmails}`,
      },
    ],
    response_format: SUMMARY_SCHEMA,
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Stage 3: Generate suggested replies for important/action-required emails
 */
async function generateReplies(client, model, emails, classifications) {
  // Filter to only Important and Action Required emails
  const replyWorthy = classifications.classifications.filter(
    (c) => c.category === "Important" || c.category === "Action Required"
  );

  if (replyWorthy.length === 0) return { replies: [] };

  const replyEmails = emails.filter((e) =>
    replyWorthy.some((c) => c.emailId === e.id)
  );

  const formattedEmails = formatEmailsForPrompt(replyEmails);

  const response = await client.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `You are a professional email reply assistant. Generate suggested replies for the given emails.

RULES:
1. Match the tone to the context — urgent situations get urgent responses, casual emails get casual responses.
2. Acknowledge the key points from the original email.
3. If there are action items, confirm you'll handle them or state your plan.
4. Keep replies concise but complete (3-6 sentences).
5. Include a proper greeting and sign-off.
6. Never fabricate commitments — use phrases like "I'll look into this" or "Let me review and get back to you" when appropriate.`,
      },
      {
        role: "user",
        content: `Generate professional suggested replies for these emails:\n\n${formattedEmails}`,
      },
    ],
    response_format: REPLY_SCHEMA,
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Main agent pipeline — processes emails through all 3 stages
 */
export async function processEmails(emails, onStageUpdate) {
  const { client, model } = createClient();

  // Ensure all emails have IDs
  const indexedEmails = emails.map((email, idx) => ({
    ...email,
    id: email.id || idx + 1,
  }));

  // Stage 1: Classification
  onStageUpdate?.({
    stage: 1,
    name: "Classification & Urgency Detection",
    status: "processing",
  });
  const classifications = await classifyEmails(client, model, indexedEmails);
  onStageUpdate?.({
    stage: 1,
    name: "Classification & Urgency Detection",
    status: "complete",
    result: classifications,
  });

  // Stage 2: Summarization
  onStageUpdate?.({
    stage: 2,
    name: "Summarization & Action Items",
    status: "processing",
  });
  const summaries = await summarizeEmails(client, model, indexedEmails);
  onStageUpdate?.({
    stage: 2,
    name: "Summarization & Action Items",
    status: "complete",
    result: summaries,
  });

  // Stage 3: Reply Generation
  onStageUpdate?.({
    stage: 3,
    name: "Reply Generation",
    status: "processing",
  });
  const replies = await generateReplies(client, model, indexedEmails, classifications);
  onStageUpdate?.({
    stage: 3,
    name: "Reply Generation",
    status: "complete",
    result: replies,
  });

  // Merge all results into a unified response
  const results = indexedEmails.map((email) => {
    const classification = classifications.classifications.find(
      (c) => c.emailId === email.id
    );
    const summary = summaries.summaries.find((s) => s.emailId === email.id);
    const reply = replies.replies.find((r) => r.emailId === email.id);

    return {
      id: email.id,
      subject: email.subject,
      sender: email.sender,
      body: email.body,
      category: classification?.category || "Unknown",
      urgency: classification?.urgency || "None",
      reasoning: classification?.reasoning || "",
      deadlineDetected: classification?.deadlineDetected || "None",
      summary: summary?.summary || "",
      actionItems: summary?.actionItems || [],
      keyEntities: summary?.keyEntities || [],
      suggestedReply: reply?.suggestedReply || null,
      replyTone: reply?.tone || null,
    };
  });

  return {
    totalEmails: results.length,
    categoryCounts: {
      Important: results.filter((r) => r.category === "Important").length,
      "Action Required": results.filter((r) => r.category === "Action Required")
        .length,
      Ignore: results.filter((r) => r.category === "Ignore").length,
      Spam: results.filter((r) => r.category === "Spam").length,
    },
    results,
  };
}
