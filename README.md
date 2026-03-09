# ContractAI

AI-powered legal contract analysis SaaS built with React, Vite, Tailwind CSS, Supabase, Groq AI, and Stripe.

## Features

- 🔐 **Supabase Authentication** — Signup, login, and magic link auth
- 📄 **Drag & Drop Upload** — PDF and DOCX support with Supabase Storage
- 🤖 **AI Analysis** — Groq API (llama-3.3-70b) extracts risk score, summary, risky clauses, and safer alternatives
- 📊 **Results Dashboard** — Tabbed view with Summary, Risky Clauses, Full Analysis, and Alternatives
- 🔒 **Paywall** — Free users see a blurred preview; upgrade to unlock full reports
- 💳 **Stripe Payments** — ₹299/month Pro plan with checkout and webhook handling
- 🌙 **Dark Mode** — Toggle with localStorage persistence
- 📱 **Responsive** — Mobile-first design with glassmorphism and gradient backgrounds
- 📥 **PDF Reports** — Download formatted reports (Pro users)
- 📈 **Usage Tracking** — 2 free analyses/month, unlimited for Pro

## Quick Start

### 1. Clone and install

```bash
cd contractAI
npm install
npm run install:all
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your actual keys
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase-schema.sql`
3. Go to **Storage** → Create a bucket called `contracts` (set as public)
4. Copy your **Project URL** and **Anon Key** to `.env`
5. Copy your **Service Role Key** to `.env`

### 4. Set up Groq

1. Get an API key from [console.groq.com](https://console.groq.com)
2. Add to `.env` as `GROQ_API_KEY`

### 5. Set up Stripe

1. Get keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Add Publishable, Secret, and Webhook Secret keys to `.env`
3. For local testing: `stripe listen --forward-to localhost:3001/api/webhook`

### 6. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Express.js, Node.js |
| Auth & DB | Supabase (PostgreSQL) |
| AI | Groq API (llama-3.3-70b-versatile) |
| Payments | Stripe Checkout + Webhooks |
| File Processing | pdf-parse, mammoth |
| PDF Reports | PDFKit |
# contractai
# contractai
