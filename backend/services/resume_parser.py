"""
Resume Parser Service
Extracts text from PDF/DOCX/TXT files, then uses Google Gemini to parse
structured data (skills, experience, education, contact info).
"""

import os
import json
import tempfile
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure Groq API (using OpenAI SDK format)
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY", ""),
    base_url="https://api.groq.com/openai/v1",
)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using pypdf."""
    import pypdf

    text = ""
    with open(file_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    from docx import Document

    doc = Document(file_path)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text.strip()


def extract_text_from_txt(file_path: str) -> str:
    """Extract text from a plain text file."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read().strip()


def extract_text(file_path: str, filename: str) -> str:
    """Route to the correct extractor based on file extension."""
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    elif ext == ".txt":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")


PARSE_PROMPT = """You are an expert resume parser. Analyze the following resume text and extract structured data.

Return ONLY valid JSON in exactly this format (no markdown, no code fences):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or null",
  "location": "City, Country or null",
  "summary": "A brief 2-3 sentence professional summary based on the resume",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "description": "Brief description of responsibilities"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/School Name",
      "year": "Graduation year or range"
    }
  ],
  "suggested_job_titles": ["Job Title 1", "Job Title 2", "Job Title 3"]
}

Important rules:
- Extract ALL skills mentioned, including tools, technologies, frameworks, and soft skills.
- If a field is not found in the resume, use null for strings or empty arrays for lists.
- The "suggested_job_titles" should be realistic job titles this person is qualified for.
- Keep descriptions concise.

Resume text:
"""


async def parse_resume(file_path: str, filename: str) -> dict:
    """
    Full parsing pipeline:
    1. Extract raw text from the file
    2. Send to Gemini for structured parsing
    3. Return parsed JSON data
    """
    # Step 1: Extract text
    raw_text = extract_text(file_path, filename)

    if not raw_text or len(raw_text.strip()) < 20:
        raise ValueError("Could not extract meaningful text from the file. Please ensure the file is not empty or image-only.")

    # Step 2: Send to Groq
    if not client.api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set. Please add it to your .env file.")

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert resume parser."
            },
            {
                "role": "user",
                "content": PARSE_PROMPT + raw_text
            }
        ],
        temperature=0.1,
        max_tokens=4096,
    )

    # Step 3: Parse the response
    response_text = response.choices[0].message.content.strip()

    # Clean up any markdown code fences if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        # Remove first and last lines (code fences)
        lines = [l for l in lines if not l.strip().startswith("```")]
        response_text = "\n".join(lines)

    try:
        parsed_data = json.loads(response_text)
    except json.JSONDecodeError:
        # Try to find JSON in the response
        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        if start != -1 and end > start:
            parsed_data = json.loads(response_text[start:end])
        else:
            raise ValueError("AI returned an invalid response. Please try again.")

    # Add the raw text for reference
    parsed_data["raw_text"] = raw_text[:2000]  # Keep first 2000 chars for matching

    return parsed_data
