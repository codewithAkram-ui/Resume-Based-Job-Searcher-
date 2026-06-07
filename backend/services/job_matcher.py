"""
Job Matcher Service
Uses Google Gemini to compare parsed resume data against job listings
and produce compatibility scores with reasoning.
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

MATCH_PROMPT = """You are an expert recruiter and career advisor. Compare the following candidate's resume data against the job listings and score each job for compatibility.

For each job, provide:
1. A match_score from 0 to 100
2. A brief reason explaining the score (2-3 sentences)
3. A list of matching_skills (skills from the resume that match the job)
4. A list of missing_skills (skills the job needs that the candidate lacks)

Return ONLY valid JSON in exactly this format (no markdown, no code fences):
{
  "matches": [
    {
      "job_id": "the job id",
      "match_score": 85,
      "reason": "Strong match because...",
      "matching_skills": ["Python", "React"],
      "missing_skills": ["Kubernetes"]
    }
  ]
}

Scoring guidelines:
- 90-100: Perfect match — candidate has almost all required skills and experience
- 75-89: Strong match — candidate meets most requirements with minor gaps
- 60-74: Good match — candidate has relevant skills but notable gaps
- 40-59: Moderate match — some overlap but significant gaps
- 0-39: Weak match — candidate's profile doesn't align well

CANDIDATE RESUME:
Name: {name}
Skills: {skills}
Experience: {experience}
Education: {education}
Summary: {summary}

JOB LISTINGS:
{jobs}
"""


async def match_jobs(parsed_resume: dict, jobs: list[dict]) -> list[dict]:
    """
    Match a parsed resume against a list of jobs using Gemini AI.

    Args:
        parsed_resume: Structured resume data from the parser
        jobs: List of job listings from the searcher

    Returns:
        List of jobs with match scores and reasoning
    """
    if not jobs:
        return []

    # Prepare resume summary for the prompt
    name = parsed_resume.get("name", "Unknown")
    skills = ", ".join(parsed_resume.get("skills", []))
    experience = json.dumps(parsed_resume.get("experience", []), indent=2)
    education = json.dumps(parsed_resume.get("education", []), indent=2)
    summary = parsed_resume.get("summary", "No summary available")

    # Prepare jobs summary — limit to essential info to save tokens
    jobs_summary = ""
    for i, job in enumerate(jobs[:10]):  # Max 10 jobs to stay within token limits
        jobs_summary += f"""
Job {i+1}:
  ID: {job['id']}
  Title: {job['title']}
  Company: {job['company']}
  Description: {job['description'][:500]}
  Qualifications: {', '.join(job.get('highlights', {}).get('qualifications', [])[:5])}
---
"""

    # Build the full prompt
    prompt = MATCH_PROMPT.format(
        name=name,
        skills=skills,
        experience=experience,
        education=education,
        summary=summary,
        jobs=jobs_summary,
    )

    # Call Gemini
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.2,
            max_output_tokens=4096,
        ),
    )

    # Parse response
    response_text = response.text.strip()

    # Clean up markdown code fences
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        response_text = "\n".join(lines)

    try:
        match_data = json.loads(response_text)
    except json.JSONDecodeError:
        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        if start != -1 and end > start:
            match_data = json.loads(response_text[start:end])
        else:
            # Fallback: return jobs with estimated scores
            return _fallback_scoring(parsed_resume, jobs)

    # Merge match data back into job listings
    matches_by_id = {m["job_id"]: m for m in match_data.get("matches", [])}

    enriched_jobs = []
    for job in jobs[:10]:
        match = matches_by_id.get(job["id"], {})
        enriched_job = {
            **job,
            "match_score": match.get("match_score", 50),
            "match_reason": match.get("reason", "Score estimated based on profile overlap."),
            "matching_skills": match.get("matching_skills", []),
            "missing_skills": match.get("missing_skills", []),
        }
        enriched_jobs.append(enriched_job)

    # Sort by match score descending
    enriched_jobs.sort(key=lambda x: x["match_score"], reverse=True)

    return enriched_jobs


def _fallback_scoring(parsed_resume: dict, jobs: list[dict]) -> list[dict]:
    """Simple keyword-based fallback scoring when AI is unavailable."""
    resume_skills = set(s.lower() for s in parsed_resume.get("skills", []))

    enriched_jobs = []
    for job in jobs[:10]:
        desc_lower = job.get("description", "").lower()
        quals = " ".join(job.get("highlights", {}).get("qualifications", [])).lower()
        full_text = desc_lower + " " + quals

        # Count skill matches
        matching = [s for s in parsed_resume.get("skills", []) if s.lower() in full_text]
        score = min(95, int((len(matching) / max(len(resume_skills), 1)) * 100))

        enriched_job = {
            **job,
            "match_score": max(score, 20),
            "match_reason": f"Matched {len(matching)} of {len(resume_skills)} skills from your resume.",
            "matching_skills": matching,
            "missing_skills": [],
        }
        enriched_jobs.append(enriched_job)

    enriched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    return enriched_jobs
