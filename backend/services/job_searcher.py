"""
Job Searcher Service
Searches for real job listings from LinkedIn, Indeed, Glassdoor, and other
platforms using the JSearch API (via RapidAPI).
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"


async def search_jobs(
    query: str,
    location: str = "India",
    num_pages: int = 1,
    date_posted: str = "month",
    remote_only: bool = False,
) -> list[dict]:
    """
    Search for real job listings using JSearch API.

    Args:
        query: Job search query (e.g., "Python Developer")
        location: Location filter (e.g., "India", "Remote")
        num_pages: Number of result pages (1 page = ~10 results)
        date_posted: "all", "today", "3days", "week", "month"
        remote_only: If True, only return remote jobs

    Returns:
        List of job dictionaries with standardized fields
    """
    if not RAPIDAPI_KEY or RAPIDAPI_KEY == "your_rapidapi_key_here":
        # Return mock data if no API key configured
        return _get_mock_jobs(query)

    headers = {
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
    }

    params = {
        "query": f"{query} in {location}",
        "page": "1",
        "num_pages": str(num_pages),
        "date_posted": date_posted,
    }

    if remote_only:
        params["remote_jobs_only"] = "true"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(JSEARCH_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

        jobs = []
        for item in data.get("data", []):
            job = {
                "id": item.get("job_id", ""),
                "title": item.get("job_title", "Unknown Title"),
                "company": item.get("employer_name", "Unknown Company"),
                "company_logo": item.get("employer_logo", None),
                "location": _format_location(item),
                "description": item.get("job_description", "")[:1500],
                "apply_link": item.get("job_apply_link", ""),
                "source": item.get("job_publisher", "Unknown"),
                "date_posted": item.get("job_posted_at_datetime_utc", ""),
                "employment_type": item.get("job_employment_type", ""),
                "is_remote": item.get("job_is_remote", False),
                "min_salary": item.get("job_min_salary"),
                "max_salary": item.get("job_max_salary"),
                "salary_currency": item.get("job_salary_currency", ""),
                "salary_period": item.get("job_salary_period", ""),
                "highlights": {
                    "qualifications": (item.get("job_highlights", {}) or {}).get("Qualifications", []),
                    "responsibilities": (item.get("job_highlights", {}) or {}).get("Responsibilities", []),
                },
            }
            jobs.append(job)

        return jobs

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise ValueError("API rate limit reached. Please try again later.")
        raise ValueError(f"Job search failed: {e.response.status_code}")
    except httpx.RequestError:
        raise ValueError("Failed to connect to job search service. Check your internet connection.")


def _format_location(item: dict) -> str:
    """Format job location from JSearch response fields."""
    city = item.get("job_city", "")
    state = item.get("job_state", "")
    country = item.get("job_country", "")

    parts = [p for p in [city, state, country] if p]
    location = ", ".join(parts)

    if item.get("job_is_remote"):
        location = f"Remote{' — ' + location if location else ''}"

    return location or "Location not specified"


def _get_mock_jobs(query: str) -> list[dict]:
    """Return mock job data when no API key is available."""
    mock_jobs = [
        {
            "id": "mock-1",
            "title": f"Senior {query.split()[0] if query.split() else 'Software'} Developer",
            "company": "TechCorp Solutions",
            "company_logo": None,
            "location": "Bangalore, Karnataka, India",
            "description": f"We are looking for a talented {query} professional to join our team. You will be responsible for designing, developing, and maintaining high-quality software solutions. Requirements: 3+ years of experience, strong problem-solving skills, and excellent communication.",
            "apply_link": "https://example.com/apply/1",
            "source": "LinkedIn",
            "date_posted": "2026-06-01T00:00:00.000Z",
            "employment_type": "FULLTIME",
            "is_remote": False,
            "min_salary": 1200000,
            "max_salary": 2000000,
            "salary_currency": "INR",
            "salary_period": "YEAR",
            "highlights": {
                "qualifications": ["3+ years experience", "Strong analytical skills", "Bachelor's degree in CS"],
                "responsibilities": ["Design and develop software", "Code review", "Mentor junior developers"],
            },
        },
        {
            "id": "mock-2",
            "title": f"{query.split()[0] if query.split() else 'Full Stack'} Engineer",
            "company": "InnovateTech Pvt Ltd",
            "company_logo": None,
            "location": "Remote — Mumbai, India",
            "description": f"Join our growing team as a {query} Engineer. Work on cutting-edge projects using the latest technologies. We offer competitive salary, flexible work hours, and opportunities for growth.",
            "apply_link": "https://example.com/apply/2",
            "source": "Indeed",
            "date_posted": "2026-06-03T00:00:00.000Z",
            "employment_type": "FULLTIME",
            "is_remote": True,
            "min_salary": 1500000,
            "max_salary": 2500000,
            "salary_currency": "INR",
            "salary_period": "YEAR",
            "highlights": {
                "qualifications": ["2+ years experience", "Proficiency in relevant technologies"],
                "responsibilities": ["Build scalable applications", "Collaborate with cross-functional teams"],
            },
        },
        {
            "id": "mock-3",
            "title": f"Lead {query.split()[0] if query.split() else 'Software'} Architect",
            "company": "GlobalSoft Inc",
            "company_logo": None,
            "location": "Hyderabad, Telangana, India",
            "description": f"Looking for an experienced {query} professional to lead our architecture team. You'll define technical strategies, guide development teams, and ensure our systems meet the highest quality standards.",
            "apply_link": "https://example.com/apply/3",
            "source": "Glassdoor",
            "date_posted": "2026-06-05T00:00:00.000Z",
            "employment_type": "FULLTIME",
            "is_remote": False,
            "min_salary": 2500000,
            "max_salary": 4000000,
            "salary_currency": "INR",
            "salary_period": "YEAR",
            "highlights": {
                "qualifications": ["8+ years experience", "Architecture expertise", "Leadership experience"],
                "responsibilities": ["Define technical strategy", "Lead development teams", "System design"],
            },
        },
        {
            "id": "mock-4",
            "title": f"Junior {query.split()[0] if query.split() else 'Software'} Developer",
            "company": "StartupHub Technologies",
            "company_logo": None,
            "location": "Pune, Maharashtra, India",
            "description": f"Great opportunity for freshers! We are hiring a Junior {query} Developer. Training will be provided. Looking for enthusiastic candidates with strong fundamentals.",
            "apply_link": "https://example.com/apply/4",
            "source": "LinkedIn",
            "date_posted": "2026-06-06T00:00:00.000Z",
            "employment_type": "FULLTIME",
            "is_remote": False,
            "min_salary": 500000,
            "max_salary": 800000,
            "salary_currency": "INR",
            "salary_period": "YEAR",
            "highlights": {
                "qualifications": ["0-1 years experience", "Strong fundamentals", "Eagerness to learn"],
                "responsibilities": ["Write clean code", "Fix bugs", "Learn from senior developers"],
            },
        },
        {
            "id": "mock-5",
            "title": f"{query.split()[0] if query.split() else 'Software'} Consultant",
            "company": "Digital Dynamics",
            "company_logo": None,
            "location": "Remote — Delhi NCR, India",
            "description": f"Seeking a {query} Consultant for contract-based work. Flexible hours, work from anywhere. Must have strong communication and technical skills.",
            "apply_link": "https://example.com/apply/5",
            "source": "Indeed",
            "date_posted": "2026-06-04T00:00:00.000Z",
            "employment_type": "CONTRACTOR",
            "is_remote": True,
            "min_salary": None,
            "max_salary": None,
            "salary_currency": "",
            "salary_period": "",
            "highlights": {
                "qualifications": ["5+ years experience", "Consulting background", "Excellent communication"],
                "responsibilities": ["Client consultation", "Technical solutions", "Project delivery"],
            },
        },
    ]
    return mock_jobs
