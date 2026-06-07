# AI Resume Parser

An intelligent, AI-powered application that parses resumes (PDF, DOCX, TXT), extracts structured data using LLaMA 3 (via Groq), and finds matching jobs from across the web. 

This project uses a **FastAPI** backend for robust data processing and AI integration, and a **React (Vite)** frontend for a fast, modern user interface.

## 🚀 Features
- **Upload Resumes:** Supports `.pdf`, `.docx`, and `.txt` files.
- **AI Data Extraction:** Extracts name, email, skills, work experience, and education cleanly using the blazing-fast Groq API.
- **Job Search & Matching:** Searches for real job listings using RapidAPI (JSearch) and matches them against the extracted resume profile with an AI compatibility score.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI, Uvicorn
- **AI/APIs:** Groq API (LLaMA 3), RapidAPI (JSearch)

---

## 💻 Local Setup Instructions

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (for the frontend)
- [Python 3.8+](https://www.python.org/) (for the backend)

### 1. Backend Setup (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Copy `backend/.env.example` to `backend/.env` (or create a new `.env` file).
   - Add your API keys:
     ```env
     GROQ_API_KEY=your_groq_api_key_here
     RAPIDAPI_KEY=your_rapidapi_key_here
     ```
5. Start the backend server:
   ```bash
   python main.py
   # Or using uvicorn directly:
   # uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The backend will be running at `http://localhost:8000`*

### 2. Frontend Setup (React/Vite)
1. Open a **new terminal tab** and make sure you are in the root directory (`AI Resume Parser`).
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:5173`*

---

## 🌐 Deployment (Render)

**Backend (Web Service):**
- Connect your GitHub repo to Render.
- Root Directory: `backend`
- Environment: `Python 3`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- *Don't forget to add your Environment Variables (`GROQ_API_KEY`, `RAPIDAPI_KEY`) in the Render dashboard.*

**Frontend (Static Site):**
- Connect your GitHub repo to Render or Vercel.
- Root Directory: `.` (or leave empty)
- Build Command: `npm run build`
- Publish Directory: `dist`
- *You'll need to update the API base URL in your frontend code to point to your deployed backend URL instead of `http://localhost:8000`.*
