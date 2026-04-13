"""
Resume Analysis AI Service.
Analyzes resume text and returns structured assessment.
"""
import logging
from .base import call_ai, parse_json_response, MOCK_ANALYSIS

logger = logging.getLogger('ai_engine')

ANALYSIS_PROMPT = """You are an expert career counselor and resume analyst. Analyze the following resume thoroughly and provide a detailed assessment.

Return your response as a valid JSON object with exactly these keys:
{{
    "score": <integer 0-100>,
    "skills": [<list of key skills identified>],
    "missing_skills": [<list of important skills that are missing based on the candidate's profile>],
    "strengths": [<list of resume strengths>],
    "weaknesses": [<list of resume weaknesses>],
    "suggestions": [<list of specific, actionable suggestions to improve the resume>],
    "recommended_roles": [<list of best matching job roles>],
    "summary": "<brief 2-3 sentence overall assessment>"
}}

IMPORTANT: Return ONLY the JSON object. No additional text.

Resume:
---
{resume_text}
---"""


def analyze_resume_text(resume_text: str) -> dict:
    """
    Analyze resume text using AI and return structured results.
    Falls back to mock data if AI is unavailable.
    """
    # Truncate very long resumes
    if len(resume_text) > 12000:
        resume_text = resume_text[:12000] + "\n...[truncated]"

    prompt = ANALYSIS_PROMPT.format(resume_text=resume_text)
    content = call_ai(
        system_prompt="You are a professional resume analyst. Always respond with valid JSON only.",
        user_prompt=prompt,
    )

    if not content:
        logger.warning("Using mock analysis data (no AI response)")
        return MOCK_ANALYSIS.copy()

    result = parse_json_response(content)
    if not result:
        logger.warning("Using mock analysis data (JSON parse failed)")
        return MOCK_ANALYSIS.copy()

    # Validate and fill required keys
    required_keys = ['score', 'skills', 'missing_skills', 'strengths',
                     'weaknesses', 'suggestions', 'recommended_roles']
    for key in required_keys:
        if key not in result:
            result[key] = [] if key != 'score' else 0

    # Ensure score is int
    try:
        result['score'] = max(0, min(100, int(result['score'])))
    except (ValueError, TypeError):
        result['score'] = 0

    logger.info(f"Resume analyzed — Score: {result['score']}")
    return result
