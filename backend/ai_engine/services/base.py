"""
Base AI client factory.
Provides a reusable OpenAI-compatible client that works with
Grok (xAI), DeepSeek, OpenAI, Groq, and other compatible APIs.
"""
import json
import re
import logging
from django.conf import settings

logger = logging.getLogger('ai_engine')

# ── Mock fallback data ────────────────────────────────────────────────────────
MOCK_ANALYSIS = {
    "score": 72,
    "skills": ["Python", "JavaScript", "React", "Django", "SQL", "Communication"],
    "missing_skills": ["Docker", "AWS", "CI/CD", "TypeScript", "Kubernetes"],
    "strengths": [
        "Strong foundation in full-stack web development.",
        "Good mix of technical and soft skills.",
        "Experience with modern frameworks like React and Django."
    ],
    "weaknesses": [
        "Lacks cloud deployment experience.",
        "No mention of testing frameworks.",
        "Could quantify achievements more clearly."
    ],
    "suggestions": [
        "Add specific metrics (e.g., improved performance by 20%).",
        "Include GitHub/portfolio links.",
        "Learn Docker and cloud deployment.",
        "Add a professional summary section."
    ],
    "recommended_roles": [
        "Full Stack Developer",
        "Frontend Engineer",
        "Python Developer"
    ],
    "summary": "Solid resume with good technical skills. Focus on adding cloud/DevOps experience and quantifying achievements for better impact."
}


def get_ai_client():
    """
    Create and return an OpenAI-compatible client based on settings.
    Returns (client, model_name) tuple, or (None, None) if no API key.
    """
    api_key = getattr(settings, 'AI_API_KEY', '')
    if not api_key:
        logger.warning("No AI_API_KEY configured. AI features will use mock data.")
        return None, None

    try:
        from openai import OpenAI
        base_url = getattr(settings, 'AI_BASE_URL', 'https://api.groq.com/openai/v1')
        model = getattr(settings, 'AI_MODEL', 'llama-3.3-70b-versatile')

        client = OpenAI(api_key=api_key, base_url=base_url)
        logger.info(f"AI client initialized: {base_url} / {model}")
        return client, model
    except ImportError:
        logger.error("openai package not installed")
        return None, None
    except Exception as e:
        logger.error(f"Failed to create AI client: {e}")
        return None, None


def call_ai(system_prompt: str, user_prompt: str, temperature: float = 0.3, max_tokens: int = 2500) -> str:
    """
    Make an AI API call and return the raw text response.
    Returns empty string on failure.
    """
    client, model = get_ai_client()
    if not client:
        return ''

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = response.choices[0].message.content.strip()
        return content
    except Exception as e:
        logger.error(f"AI API call failed: {e}")
        return ''


def parse_json_response(content: str) -> dict:
    """
    Parse JSON from AI response, handling markdown fences and thinking tags.
    """
    if not content:
        return {}

    # Remove <think>...</think> tags (DeepSeek)
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()

    # Remove markdown code fences
    if '```' in content:
        match = re.search(r'```(?:json)?\s*\n?(.*?)```', content, re.DOTALL)
        if match:
            content = match.group(1).strip()

    # Extract JSON object
    if not content.startswith('{'):
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            content = json_match.group(0)

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}\nContent: {content[:200]}")
        return {}
