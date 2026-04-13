"""
Job Description Matching AI Service.
Compares resume with a job description and returns match analysis.
"""
import logging
from .base import call_ai, parse_json_response

logger = logging.getLogger('ai_engine')

MOCK_MATCH = {
    "match_percentage": 68,
    "matching_skills": ["Python", "JavaScript", "React", "Communication"],
    "missing_keywords": ["Kubernetes", "AWS", "Terraform", "Go"],
    "suggestions": [
        "Add experience with cloud services (AWS/GCP).",
        "Mention containerization experience with Docker.",
        "Include relevant certifications.",
        "Tailor your resume summary to match the job title."
    ],
    "summary": "Good foundational match. Adding cloud and DevOps experience would significantly improve your candidacy."
}

MATCH_PROMPT = """You are an expert job recruiter and resume matcher. Compare the following resume with the job description and provide a detailed match analysis.

Return your response as a valid JSON object with exactly these keys:
{{
    "match_percentage": <integer 0-100>,
    "matching_skills": [<skills from resume that match the job>],
    "missing_keywords": [<important keywords/skills from the job that are missing in the resume>],
    "suggestions": [<specific suggestions to improve the match>],
    "summary": "<brief 2-3 sentence assessment of the match>"
}}

IMPORTANT: Return ONLY the JSON object. No additional text.

RESUME:
---
{resume_text}
---

JOB DESCRIPTION:
---
{job_description}
---"""


def match_job_description(resume_text: str, job_description: str) -> dict:
    """
    Compare resume with job description using AI.
    Returns structured match results.
    """
    if len(resume_text) > 8000:
        resume_text = resume_text[:8000] + "\n...[truncated]"
    if len(job_description) > 5000:
        job_description = job_description[:5000] + "\n...[truncated]"

    prompt = MATCH_PROMPT.format(
        resume_text=resume_text,
        job_description=job_description
    )

    content = call_ai(
        system_prompt="You are a professional recruiter. Always respond with valid JSON only.",
        user_prompt=prompt,
    )

    if not content:
        logger.warning("Using mock match data")
        return MOCK_MATCH.copy()

    result = parse_json_response(content)
    if not result:
        logger.warning("Using mock match data (JSON parse failed)")
        return MOCK_MATCH.copy()

    # Validate
    try:
        result['match_percentage'] = max(0, min(100, int(result.get('match_percentage', 0))))
    except (ValueError, TypeError):
        result['match_percentage'] = 0

    for key in ['matching_skills', 'missing_keywords', 'suggestions']:
        if key not in result:
            result[key] = []

    logger.info(f"Job matched — {result['match_percentage']}%")
    return result
