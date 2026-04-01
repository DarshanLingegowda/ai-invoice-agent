# Invoice Agent

A fully working invoice management app powered by Gemini AI.

## Features

- **Invoice Management** — Create, edit, view, and delete invoices
- **AI Agent** — Chat with Gemini to query data, create invoices, and get insights
- **Analytics** — Revenue overview, status breakdown, top clients
- **Status Tracking** — Draft → Sent → Paid / Overdue

## Quick Start

```bash
npm install
cp .env.example .env
# Add your Anthropic API key to .env
npm run dev
```

Open http://localhost:5173

## API Key

Set your Anthropic API key in one of two ways:
GOOGLE_API_KEY=your_api_key_here
2. In the app: go to **Settings** and paste your key (stored in localStorage)

Get a key at https://console.anthropic.com

## Stack

- React 18 + Vite
- Lucide React icons
- Gemini claude-sonnet-4-20250514 via Anthropic API
- localStorage for persistence
