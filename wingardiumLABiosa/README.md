# SUBMITIFY — AI-Powered Lab File Generator

Generate complete programming practical files in seconds using Groq AI.

## What it does

Enter your college details and experiment list. SUBMITIFY writes the cover page, index, algorithms, source code, and output — formatted and print-ready as PDF and Word.

## Features

- **Cover page** — university, department, student and professor details
- **Auto index** — lists all experiments with date and sign columns
- **AI-generated content** — aim, algorithm, source code, and output per experiment
- **Multiple languages** — C, C++, Java, Python, JavaScript, TypeScript, SQL, R, MATLAB
- **PDF + Word download** — print-ready A4 layout
- **Smart caching** — previously generated experiments are stored and reused instantly

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | FastAPI + Python |
| AI | Groq (llama-3.3-70b-versatile) |
| Database | PostgreSQL (Supabase) |
| PDF Generation | wkhtmltopdf + pdfkit |
| Word Generation | python-docx |

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- wkhtmltopdf — [download here](https://wkhtmltopdf.org/downloads.html)
- Groq API key — [get here](https://console.groq.com)

### Backend
```bash
cd pdf_gen
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

Create `.env` in `pdf_gen/`:
```
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

Create database tables:
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
    question    TEXT NOT NULL,
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

Start backend:
```bash
uvicorn api:app --reload
```

### Frontend
```bash
cd pdf_gen/wingardiumLABiosa
npm install
```

Create `.env` in `wingardiumLABiosa/`:
```
VITE_API_URL=http://localhost:8000
```

Start frontend:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |

## site is live

[https://submitify-pi.vercel.app](https://submitify-pi.vercel.app)

