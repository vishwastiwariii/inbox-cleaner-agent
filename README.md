# AI Email Inbox Cleaner 📮

An intelligent AI agent that acts as your personal email assistant — filtering, summarizing, and prioritizing your inbox using a multi-stage agentic pipeline powered by OpenAI GPT-4o.

## 🎯 What It Does

🏷️ **Classifies** every email into: Important | Action Required | Ignore | Spam  
📝 **Summarizes** each email in one concise line  
📌 **Extracts** key action items and deadlines  
💬 **Suggests** professional replies for important emails  
🧠 **Explains** reasoning behind every classification decision  

## 🏗️ Architecture

```
┌───────────────── Frontend (Vite + React) ─────────────────┐
│  Email Input → Agent Pipeline Animation → Results Dashboard │
└──────────────────────── REST API ──────────────────────────┘
┌───────────────── Backend (Node.js + Express) ──────────────┐
│  Stage 1: Classification │ Stage 2: Summary │ Stage 3: Reply │
│             OpenAI GPT-4o Structured Outputs                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key

### Setup

1. **Clone and install:**
   ```bash
   cd inbox-cleaner
   
   # Backend
   cd server
   npm install
   cp .env.example .env
   # Add your OpenAI API key to .env
   
   # Frontend
   cd ../client
   npm install
   ```

2. **Configure your API key:**
   Edit `server/.env` and replace the placeholder:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Run both servers:**
   ```bash
   # Terminal 1 — Backend
   cd server && node server.js
   
   # Terminal 2 — Frontend
   cd client && npm run dev
   ```

4. **Open** `http://localhost:5173` in your browser

### Demo Mode
Click **"Load Sample Emails"** to instantly load 10 realistic test emails covering all categories — perfect for demos!

## 📊 Features

| Feature | Description |
|---------|-------------|
| **Multi-Stage Agent Pipeline** | 3-stage process: Classify → Summarize → Reply |
| **Structured AI Outputs** | OpenAI JSON Schema enforcement for guaranteed response format |
| **Live Pipeline Animation** | Visual stage-by-stage processing feedback |
| **Smart Categorization** | Urgency detection, deadline extraction, phishing detection |
| **Transparent Reasoning** | Human-readable explanation for every classification |
| **Suggested Replies** | Context-aware, tone-matched reply suggestions |
| **Premium Dark UI** | Glassmorphism design with micro-animations |

## 🧪 Sample Email Categories

The demo includes emails covering:
- 🔴 **Important**: Partnership proposals, AWS billing, HR notices
- 🟠 **Action Required**: Budget reports, tech specs, health insurance enrollment
- 🔵 **Ignore**: Newsletters, casual social messages
- ⚫ **Spam**: Phishing attempts, scam promotions

## 📁 Project Structure

```
inbox-cleaner/
├── server/
│   ├── server.js          # Express API server
│   ├── agent.js           # 3-stage AI pipeline
│   ├── sampleEmails.js    # Demo email data
│   ├── .env               # API key (gitignored)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx        # Main app shell
│   │   ├── index.css      # Design system
│   │   └── components/
│   │       ├── EmailInput.jsx       # JSON input panel
│   │       ├── AgentPipeline.jsx    # Processing animation
│   │       ├── EmailCard.jsx        # Result card
│   │       └── ResultsDashboard.jsx # Results view
│   └── package.json
└── README.md
```

## 🔧 Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4o-mini (Structured Outputs)
- **Styling**: Vanilla CSS with glassmorphism design system
