"""
AI Resume Parser — FastAPI Backend
Main application with endpoints for resume parsing, job searching, and matching.
"""

import os
import tempfile
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from services.resume_parser import parse_resume
from services.job_searcher import search_jobs
from services.job_matcher import match_jobs

app = FastAPI(
    title="AI Resume Parser API",
    description="Parse resumes, search jobs, and match candidates using AI",
    version="1.0.0",
)

# CORS — allow the Vite dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ─────────────────────────────────────

class JobSearchRequest(BaseModel):
    query: str
    location: str = "India"
    remote_only: bool = False
    date_posted: str = "month"


class MatchRequest(BaseModel):
    parsed_resume: dict
    jobs: list[dict]


# ── Health Check ─────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Check if the server is running and API keys are configured."""
    gemini_configured = bool(os.getenv("GOOGLE_API_KEY")) and os.getenv("GOOGLE_API_KEY") != "your_gemini_api_key_here"
    rapid_configured = bool(os.getenv("RAPIDAPI_KEY")) and os.getenv("RAPIDAPI_KEY") != "your_rapidapi_key_here"

    return {
        "status": "ok",
        "gemini_configured": gemini_configured,
        "rapidapi_configured": rapid_configured,
    }


# ── Endpoint: Parse Resume ──────────────────────────────────────

@app.post("/api/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Upload a resume file (PDF, DOCX, TXT) and get structured parsed data.
    """
    # Validate file type
    allowed_extensions = {".pdf", ".docx", ".doc", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed_extensions)}",
        )

    # Validate file size (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    # Save to temp file and parse
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        result = await parse_resume(tmp_path, file.filename)
        return {"success": True, "data": result}

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "rate_limit_exceeded" in error_msg:
            import re
            time_match = re.search(r"Please try again in ([\w\d.]+)", error_msg)
            wait_time = time_match.group(1).rstrip('.') if time_match else "a short while"
            raise HTTPException(
                status_code=429, 
                detail=f"The model is on a cooling period due to token limits. Please try again in {wait_time} when the token resets."
            )
        raise HTTPException(status_code=500, detail=f"Parsing failed: {error_msg}")
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


# ── Endpoint: Search Jobs ───────────────────────────────────────

@app.post("/api/search-jobs")
async def search_jobs_endpoint(request: JobSearchRequest):
    """
    Search for real job listings from LinkedIn, Indeed, Glassdoor, etc.
    """
    try:
        jobs = await search_jobs(
            query=request.query,
            location=request.location,
            remote_only=request.remote_only,
            date_posted=request.date_posted,
        )
        return {"success": True, "data": jobs, "count": len(jobs)}

    except ValueError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job search failed: {str(e)}")


# ── Endpoint: Match Jobs ────────────────────────────────────────

@app.post("/api/match")
async def match_jobs_endpoint(request: MatchRequest):
    """
    Match parsed resume data against job listings using AI.
    Returns jobs enriched with compatibility scores.
    """
    try:
        matched_jobs = await match_jobs(request.parsed_resume, request.jobs)
        return {"success": True, "data": matched_jobs}

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "rate_limit_exceeded" in error_msg:
            import re
            time_match = re.search(r"Please try again in ([\w\d.]+)", error_msg)
            wait_time = time_match.group(1).rstrip('.') if time_match else "a short while"
            raise HTTPException(
                status_code=429, 
                detail=f"The model is on a cooling period due to token limits. Please try again in {wait_time} when the token resets."
            )
        raise HTTPException(status_code=500, detail=f"Matching failed: {error_msg}")


# ── Run ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("\n[INFO] AI Resume Parser API starting...")
    print("[INFO] Docs: http://localhost:8000/docs\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
