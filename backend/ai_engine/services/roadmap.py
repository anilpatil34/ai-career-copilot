"""
Learning Roadmap AI Service.
Generates personalized learning roadmaps based on missing skills.
"""
import logging
from .base import call_ai, parse_json_response

logger = logging.getLogger('ai_engine')

MOCK_ROADMAP = {
    "roadmap": [
        {
            "phase": 1,
            "title": "Foundation Phase",
            "duration": "2-3 weeks",
            "skills": ["Docker Basics", "Linux Command Line"],
            "resources": [
                "Docker Official Tutorial (docs.docker.com)",
                "Linux Journey (linuxjourney.com)"
            ],
            "projects": [
                "Dockerize a simple web application",
                "Set up a multi-container app with Docker Compose"
            ]
        },
        {
            "phase": 2,
            "title": "Cloud Fundamentals",
            "duration": "3-4 weeks",
            "skills": ["AWS EC2", "S3", "IAM", "VPC"],
            "resources": [
                "AWS Free Tier Tutorials",
                "AWS Certified Cloud Practitioner Study Guide"
            ],
            "projects": [
                "Deploy a web app on AWS EC2",
                "Set up a static website hosting on S3"
            ]
        },
        {
            "phase": 3,
            "title": "CI/CD & Automation",
            "duration": "2-3 weeks",
            "skills": ["GitHub Actions", "CI/CD Pipelines", "Automated Testing"],
            "resources": [
                "GitHub Actions Documentation",
                "CI/CD Best Practices (Martin Fowler)"
            ],
            "projects": [
                "Create a CI/CD pipeline for a full-stack app",
                "Set up automated testing with coverage reports"
            ]
        }
    ],
    "total_duration": "7-10 weeks",
    "summary": "This roadmap focuses on building cloud and DevOps skills through hands-on projects and structured learning."
}

ROADMAP_PROMPT = """You are an expert career coach and technical learning advisor. Create a detailed, personalized learning roadmap based on the skills the user needs to learn.

The user is missing these skills: {skills}

Return your response as a valid JSON object with exactly these keys:
{{
    "roadmap": [
        {{
            "phase": <phase number>,
            "title": "<phase title>",
            "duration": "<estimated time>",
            "skills": [<skills to learn in this phase>],
            "resources": [<recommended learning resources with URLs>],
            "projects": [<hands-on projects to build>]
        }}
    ],
    "total_duration": "<total estimated time>",
    "summary": "<brief overview of the learning path>"
}}

Create 3-5 phases ordered from foundational to advanced. Be specific with resources and projects.

IMPORTANT: Return ONLY the JSON object. No additional text."""


def generate_roadmap(missing_skills: list) -> dict:
    """
    Generate a personalized learning roadmap based on missing skills.
    """
    if not missing_skills:
        return {"roadmap": [], "total_duration": "N/A", "summary": "No missing skills identified."}

    skills_str = ", ".join(missing_skills)
    prompt = ROADMAP_PROMPT.format(skills=skills_str)

    content = call_ai(
        system_prompt="You are a career learning advisor. Always respond with valid JSON only.",
        user_prompt=prompt,
        max_tokens=3000,
    )

    if not content:
        logger.warning("Using mock roadmap data")
        return MOCK_ROADMAP.copy()

    result = parse_json_response(content)
    if not result or 'roadmap' not in result:
        logger.warning("Using mock roadmap data (parse failed)")
        return MOCK_ROADMAP.copy()

    logger.info(f"Roadmap generated for skills: {skills_str}")
    return result
