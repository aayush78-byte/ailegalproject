
# AI Legal Sentinel - India 🛡️⚖️

An AI-powered legal contract analyzer tailored for Indian law. It detects high-risk clauses, explains legal implications in plain English, and provides negotiation suggestions.

## Features
- **Rule-Based Engine**: Matches thousands of keywords and patterns based on Indian statutes (Contract Act, Minimum Wages, Copyright Act, etc.).
- **LLM Contextualization**: Uses Cerebras (LLama 3.1) for lightning-fast analysis and "Plain English" explanations.
- **Risk Scoring**: Provides a 0-100 score with intuitive recommendations (Safe, Alert, Avoid).
- **Responsive Dashboard**: Upload PDFs/Word docs and get instant feedback.

## Project Structure
```text
ai-legal-sentinel/
├── backend/            # Flask API, Rule Engine, AI Logic
│   ├── data/           # Legal rules (JSON), law datasets
│   └── Dockerfile      # Backend container config
├── frontend/           # React + Tailwind + Vite Dashboard
│   └── Dockerfile      # Frontend container config
└── docker-compose.yml  # Unified orchestration
```

## Quick Start (Docker)

1. Create a `.env` file in the root with your API keys:
   ```bash
   LLM_PROVIDER=cerebras
   CEREBRAS_API_KEY=your_key_here
   ```
2. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Open [http://localhost:5173](http://localhost:5173).

## Manual Setup

### Backend
1. `cd backend`
2. `python3 -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `python app.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## License
MIT
