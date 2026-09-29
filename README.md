# 🧠 DealMind — AI Sales Agent That Remembers Every Deal

> **An AI-powered sales intelligence agent that learns from customer interactions using persistent memory.**

DealMind helps sales representatives prepare for customer conversations by remembering important information from previous interactions — including customer concerns, objections, competitors, pricing discussions, stakeholder priorities, commitments, and outcomes.

Instead of treating every conversation as a new conversation, DealMind uses **Hindsight** to retain and recall relevant experience and provide more personalized sales intelligence over time.

---

## 🚀 What Problem Does DealMind Solve?

Sales teams interact with customers across multiple meetings, calls, emails, and follow-ups.

Important details can easily get lost:

* What pricing concerns did the customer raise?
* Which competitor are they evaluating?
* What did the CTO ask about security?
* What implementation timeline did they prefer?
* What commitments were made in the previous meeting?
* What worked successfully in earlier conversations?

Traditional AI assistants can generate responses, but without persistent memory they may not maintain useful context across interactions.

**DealMind solves this by giving the sales agent persistent memory.**

---

## 💡 How DealMind Works

The core workflow is:

```text
Sales Interaction
       ↓
   Hindsight Retain
       ↓
 Persistent Memory
       ↓
   Hindsight Recall
       ↓
 Relevant Deal Context
       ↓
 AI Sales Agent
       ↓
 Personalized Sales Intelligence
```

A sales representative can record an interaction and later ask:

> **"Prepare me for my next call with Acme."**

DealMind retrieves relevant memories and generates a contextual briefing based on what happened previously.

---

## 🧠 Why Hindsight?

Hindsight is the central memory layer of DealMind.

### Retain

Important information from sales interactions is stored as memory.

Examples:

* Customer objections
* Pricing discussions
* Competitor mentions
* Stakeholder requirements
* Follow-up commitments
* Previous outcomes

### Recall

When the sales representative needs information, DealMind retrieves relevant memories instead of starting from zero.

### Learn From Experience

Over multiple interactions, the agent can build a richer understanding of the customer and deal.

```text
Interaction 1
    ↓
Memory

Interaction 2
    ↓
More Memory

Interaction 3
    ↓
Richer Customer Context

Next Call
    ↓
Personalized Preparation
```

---

## ✨ Key Features

### 📊 Sales Dashboard

View customers, active deals, deal stages, and important sales information from one place.

### 🧠 Memory Lab

Add customer interactions and observe how information becomes part of the agent's persistent memory.

### 📞 Prepare Me for This Call

Generate an AI-powered briefing before a customer call using previously retained memories.

### 💬 AI Sales Assistant

Interact with the sales agent and ask questions about customers, deals, concerns, and previous interactions.

### 🕒 Memory Activity

View the memory activity associated with a customer and understand what the agent has learned.

### 👥 Customer & Deal Context

Keep customer information and deal-specific context together so the AI can provide more relevant responses.

---

## 🏗️ System Architecture

```text
┌───────────────────────────────────────────┐
│              DealMind Frontend            │
│          React + TypeScript + Vite        │
│                                           │
│  Dashboard │ Customers │ Memory │ Agent  │
└───────────────────┬───────────────────────┘
                    │ REST API
                    ▼
┌───────────────────────────────────────────┐
│              FastAPI Backend              │
│                                           │
│  Customer APIs                            │
│  Deal APIs                                │
│  Memory APIs                              │
│  AI Agent APIs                            │
└───────────────┬───────────────┬───────────┘
                │               │
                ▼               ▼
       ┌────────────────┐  ┌───────────────┐
       │ Hindsight Cloud│  │  Groq LLM     │
       │                │  │               │
       │ Retain         │  │ AI Responses  │
       │ Recall         │  │               │
       │ Memory         │  │               │
       └────────────────┘  └───────────────┘
```

---

## 🔄 Example Workflow

### Step 1 — Record an Interaction

A sales representative records information from a customer conversation.

Example:

> Acme is evaluating Salesforce as a competitor. The customer has concerns about pricing and the CTO wants more information about security.

### Step 2 — Retain the Experience

DealMind sends the interaction to Hindsight.

The information becomes part of the customer's persistent memory.

### Step 3 — Continue the Deal

More conversations take place.

Additional information can be retained:

> Acme prefers a six-week implementation timeline and wants a technical walkthrough before the next meeting.

### Step 4 — Prepare for the Next Call

The sales representative selects:

**Prepare Me for This Call**

DealMind recalls relevant memories and generates a contextual briefing.

### Step 5 — Personalized Intelligence

The agent can surface:

* Previous pricing concerns
* Salesforce comparison
* CTO security requirements
* Preferred implementation timeline
* Previous commitments
* Recommended conversation context

---

## 🆚 Before vs After Memory

### Without Persistent Memory

```text
Sales Rep:
"Prepare me for my Acme call."

AI:
"Please provide more information about Acme
and your previous conversations."
```

### With DealMind + Hindsight

```text
Sales Rep:
"Prepare me for my Acme call."

AI:
"Acme previously raised pricing concerns,
is evaluating Salesforce, and their CTO
wanted additional security information.

They also preferred a six-week implementation
timeline discussed during the previous meeting."
```

The difference is **context built from previous experience**.

---

## 🛠️ Technology Stack

| Layer       | Technology                            |
| ----------- | ------------------------------------- |
| Frontend    | React, TypeScript, Vite               |
| Styling     | Tailwind CSS                          |
| Backend     | Python, FastAPI                       |
| AI Model    | Groq                                  |
| Memory      | Hindsight Cloud                       |
| API         | REST                                  |
| Development | Antigravity / AI-assisted development |

---

## 📁 Project Structure

```text
dealmind/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── ...
│   └── services/
│       └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file for local development.

```env
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=dealmind-sales-memory
GROQ_API_KEY=your_groq_api_key
```

**Never commit your real `.env` file or API keys to GitHub.**

The repository contains `.env.example` with placeholder values.

---

## ▶️ Running DealMind Locally

### 1. Clone the repository

```bash
git clone https://github.com/rithikanagineni/dealmind-ai.git
cd dealmind-ai
```

### 2. Start the backend

From the project root:

```bash
py -m uvicorn backend.main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔌 Backend API

Important endpoints include:

| Method | Endpoint                             | Purpose                           |
| ------ | ------------------------------------ | --------------------------------- |
| GET    | `/api/health`                        | Backend health check              |
| GET    | `/api/customers`                     | List customers                    |
| GET    | `/api/customers/{id}`                | Customer details                  |
| GET    | `/api/deals`                         | List deals                        |
| POST   | `/api/memory/retain`                 | Store an interaction in Hindsight |
| POST   | `/api/memory/recall`                 | Retrieve relevant memories        |
| POST   | `/api/agent/prepare-call`            | Generate call preparation         |
| POST   | `/api/agent/chat`                    | Interact with the AI sales agent  |
| GET    | `/api/memory/activity/{customer_id}` | View customer memory activity     |

---

## 🔐 Security

DealMind follows basic application security practices:

* API keys are stored in environment variables.
* Secrets are excluded through `.gitignore`.
* `.env` is not committed to the repository.
* `.env.example` contains placeholders only.
* Backend APIs provide the controlled interface between the frontend and external AI/memory services.

---

## 🧪 Demo Scenario

A sample customer journey can be demonstrated using:

**Customer:** Acme Corporation

### Initial interaction

The customer discusses:

* Pricing
* Salesforce as a competitor
* Security requirements from the CTO

### Later interaction

The customer discusses:

* Six-week implementation timeline
* Technical walkthrough
* Follow-up requirements

### Next call

The sales representative asks:

> **"Prepare me for my Acme call."**

DealMind recalls the relevant experience and creates a personalized briefing.

This demonstrates the transition from:

**AI that responds → AI that remembers → AI that learns from experience.**

---

## 📸 Screenshots

Add screenshots of the following sections here:

### DealMind Dashboard

`![DealMind Dashboard](screenshots/dashboard.png)`

### Customer / Deal View

`![Customer Deal View](screenshots/customer-view.png)`

### Hindsight Memory Activity

`![Memory Activity](screenshots/memory-activity.png)`

### AI Call Preparation

`![AI Call Preparation](screenshots/call-preparation.png)`

---

## 🎯 Design Goal

DealMind is designed around one principle:

> **Every customer interaction should make the next conversation more informed.**

The goal is not simply to build an AI chatbot, but to create an AI sales agent that can accumulate useful experience and use that experience when it matters.

---

## 🔮 Future Improvements

Potential extensions include:

* Automatic extraction of memories from call transcripts
* CRM integrations
* Deal-risk detection
* Automatic follow-up generation
* Stakeholder relationship tracking
* Account-level intelligence
* Meeting transcript analysis
* Sales performance analytics
* Automated next-best-action recommendations

---

## 👩‍💻 Development

DealMind was developed using AI-assisted development workflows alongside conventional software engineering practices.

The development process focused on:

1. Designing the sales-agent workflow
2. Integrating Hindsight as the persistent memory layer
3. Building REST APIs with FastAPI
4. Connecting the AI agent to Groq
5. Creating the React-based sales dashboard
6. Testing memory retention and recall
7. Demonstrating how accumulated memory changes future AI responses

---

## 📌 Project Summary

**DealMind** is an AI sales intelligence agent that uses **Hindsight** to remember customer interactions and provide context-aware assistance.

Instead of starting every conversation from scratch, the agent can use accumulated experience to help sales representatives understand:

**what happened → what was learned → what matters now.**

---

## 📄 License

This project is provided for demonstration and educational purposes.
