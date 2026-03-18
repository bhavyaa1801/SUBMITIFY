# SUBMITIFY — AI-Powered Lab File Generator
> Generate complete, print-ready programming practical files in seconds using Groq AI.

Enter your college details and experiment list. SUBMITIFY writes the cover page, index,
algorithms, source code, and output — formatted and ready to download as PDF and Word.

**Live:** [submitify-pi.vercel.app](https://submitify-pi.vercel.app)
---

## How it works

1. Enter your university, department, and student details
2. Add your experiment list and select a programming language
3. SUBMITIFY calls Groq AI (LLaMA 3.3 70B) to generate aim, algorithm, code, and output
4. Previously generated experiments are served instantly from the PostgreSQL cache
5. Download a formatted A4 PDF or Word file — cover page, index, and all experiments included

<img width="692" height="489" alt="image" src="https://github.com/user-attachments/assets/4311c9e5-995e-49c8-9fc5-382a656e0a67" />

---

## Architecture
```
Browser
  └── React + Vite + Tailwind  (Vercel)
        └── FastAPI + Python   (Render)
              ├── PostgreSQL / Supabase  ← cache lookup (hit = skip AI)
              ├── Groq API (LLaMA 3.3)  ← on cache miss
              └── Document generation
                    ├── wkhtmltopdf + pdfkit → PDF
                    └── python-docx         → Word
```

**Key design decisions:**
- **Cache-first**: Every generated experiment is stored by `(question, subject, language)`. Repeat requests are instant and free.
- **Separation of concerns**: AI generation, caching, and document rendering are independent layers — each can be swapped or scaled without touching the others.
- **Stateless backend**: No session state. Every request is self-contained, making horizontal scaling straightforward.

---

## Features

- **Cover page** — university, department, student and professor details
- **Auto index** — lists all experiments with date and sign columns
- **AI-generated content** — aim, algorithm, source code, and output per experiment
- **9 languages** — C, C++, Java, Python, JavaScript, TypeScript, SQL, R, MATLAB
- **PDF + Word download** — print-ready A4 layout
- **Smart caching** — previously generated experiments reused instantly; no redundant API calls

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | FastAPI + Python |
| AI | Groq — llama-3.3-70b-versatile |
| Database | PostgreSQL via Supabase |
| PDF generation | wkhtmltopdf + pdfkit |
| Word generation | python-docx |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## Database Schema
```sql
CREATE TABLE IF NOT EXISTS subjects (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS languages (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS experiments (
    id          SERIAL PRIMARY KEY,
    question    TEXT    NOT NULL,
    subject_id  INTEGER REFERENCES subjects(id),
    language_id INTEGER REFERENCES languages(id),
    aim         TEXT,
    algorithm   TEXT,
    code        TEXT,
    output      TEXT,
    result      TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(question, subject_id, language_id)
);
```

The `UNIQUE(question, subject_id, language_id)` constraint is what powers the cache — identical requests resolve to the same row.

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- [wkhtmltopdf](https://wkhtmltopdf.org/downloads.html)
- [Groq API key](https://console.groq.com)

### Backend
```bash
cd pdf_gen
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Create `pdf_gen/.env`:
```env
GROQ_API_KEY=your_groq_api_key
WKHTMLTOPDF_PATH=C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe
API_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DB_HOST=localhost
DB_NAME=practical_generator
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
```

Run the schema SQL above to initialise tables, then:
```bash
uvicorn api:app --reload
```

### Frontend
```bash
cd pdf_gen/wingardiumLABiosa
npm install
```

Create `wingardiumLABiosa/.env`:
```env
VITE_API_URL=http://localhost:8000
```
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Set `VITE_API_URL` to your Render backend URL |
| Backend | Render | Set all env vars from `.env` in Render's dashboard |
| Database | Supabase | Use the connection string as `DB_*` env vars |

---
