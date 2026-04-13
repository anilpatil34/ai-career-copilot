# 🚀 AI Career Copilot — Resume Analyzer & Job Assistant

An AI-powered career assistant that analyzes resumes, matches job descriptions, generates learning roadmaps, and provides personalized career advice.

![AI Career Copilot](https://img.shields.io/badge/AI-Career%20Copilot-6366f1?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure register/login/logout with token refresh |
| 📄 **Resume Upload** | Upload PDF/DOCX, auto-parse text |
| 🤖 **AI Resume Analysis** | Score (0-100), skills, strengths, weaknesses, suggestions |
| 🎯 **Job Matching** | Paste JD → get match %, missing keywords, suggestions |
| 🗺️ **Learning Roadmap** | AI-generated step-by-step learning plan |
| 💬 **AI Chatbot** | Career advice, interview prep, salary negotiation |
| 📊 **Dashboard** | Stats overview, score chart, match history |

---

## 🛠️ Tech Stack

- **Backend**: Python Django + Django REST Framework
- **Frontend**: React.js 18 (Vite)
- **Database**: MySQL (SQLite fallback for dev)
- **AI**: OpenAI-compatible API (Groq / Grok xAI / DeepSeek / OpenAI)
- **Auth**: JWT (Simple JWT)
- **Deployment**: GitHub Actions, Render + Vercel ready

---

## 📦 Project Structure

```
ai-career-copilot/
├── backend/
│   ├── config/          # Django project settings
│   ├── users/           # Authentication & profiles
│   ├── resumes/         # Resume upload & parsing
│   ├── jobs/            # Job description matching
│   ├── ai_engine/       # AI services (analyzer, matcher, roadmap, chatbot)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, ScoreCircle, LoadingSpinner
│   │   ├── pages/       # Dashboard, Resume, JobMatcher, Chat, Roadmap
│   │   ├── context/     # AuthContext (JWT)
│   │   ├── services/    # API service layer (Axios)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/ci.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+ (optional, SQLite works for dev)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate     # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env with your settings (especially AI_API_KEY)

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | ❌ | Register new user |
| POST | `/api/auth/login/` | ❌ | Login (returns JWT) |
| POST | `/api/auth/logout/` | ✅ | Logout (blacklist token) |
| POST | `/api/auth/token/refresh/` | ❌ | Refresh access token |
| GET/PUT | `/api/auth/profile/` | ✅ | User profile |
| GET | `/api/auth/dashboard/` | ✅ | Dashboard stats |
| POST | `/api/resume/upload/` | ✅ | Upload resume (PDF/DOCX) |
| GET | `/api/resume/list/` | ✅ | List user resumes |
| POST | `/api/resume/analyze/<id>/` | ✅ | Analyze resume with AI |
| GET | `/api/resume/analysis/<id>/` | ✅ | Get analysis result |
| DELETE | `/api/resume/delete/<id>/` | ✅ | Delete resume |
| POST | `/api/job/match/` | ✅ | Match JD against resume |
| GET | `/api/job/history/` | ✅ | Job match history |
| POST | `/api/roadmap/generate/` | ✅ | Generate learning roadmap |
| POST | `/api/chat/` | ✅ | Chat with AI assistant |

---

## 🤖 AI Configuration

The project supports multiple AI providers via OpenAI-compatible API:

```env
# Groq (Free, fast, recommended for development)
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key
AI_MODEL=llama-3.3-70b-versatile
AI_BASE_URL=https://api.groq.com/openai/v1

# xAI Grok
AI_API_KEY=your_grok_key
AI_MODEL=grok-2-latest
AI_BASE_URL=https://api.x.ai/v1

# DeepSeek
AI_API_KEY=your_deepseek_key
AI_MODEL=deepseek-chat
AI_BASE_URL=https://api.deepseek.com

# OpenAI
AI_API_KEY=your_openai_key
AI_MODEL=gpt-4o-mini
AI_BASE_URL=https://api.openai.com/v1
```

> **Note**: Without an API key, the app uses mock data for all AI features.

---

## 📸 Screenshots

> Screenshots will be added after deployment.

| Page | Description |
|------|-------------|
| Login | Modern glassmorphism auth UI |
| Dashboard | Stats, score circle, match history |
| Resume Upload | Drag-and-drop with AI analysis |
| Job Matcher | JD comparison with match % |
| AI Chatbot | Career advice chat interface |
| Roadmap | Phased learning timeline |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend build check
cd frontend
npm run build
```

---

## 🚢 Deployment

### Render (Backend)
1. Connect GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn config.wsgi:application`
4. Add environment variables from `.env.example`

### Vercel (Frontend)
1. Connect GitHub repo
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add `VITE_API_URL` environment variable

---

Built with ❤️ using Django, React, and AI
