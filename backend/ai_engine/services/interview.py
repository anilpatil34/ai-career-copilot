"""
Interview Preparation AI Service.
Generates interview questions and evaluates answers for career preparation.
"""
import logging
from .base import call_ai, parse_json_response

logger = logging.getLogger('ai_engine')

MOCK_QUESTIONS = {
    "role": "Full Stack Developer",
    "questions": [
        {
            "id": 1,
            "question": "Can you explain the difference between REST and GraphQL APIs?",
            "category": "Technical",
            "difficulty": "Medium",
            "tips": "Discuss trade-offs, use cases, and when to choose each approach."
        },
        {
            "id": 2,
            "question": "Tell me about a challenging project you worked on. How did you handle it?",
            "category": "Behavioral",
            "difficulty": "Medium",
            "tips": "Use the STAR method: Situation, Task, Action, Result."
        },
        {
            "id": 3,
            "question": "How do you ensure code quality in your projects?",
            "category": "Technical",
            "difficulty": "Easy",
            "tips": "Mention testing, code reviews, CI/CD, linting, and documentation."
        },
        {
            "id": 4,
            "question": "Where do you see yourself in 5 years?",
            "category": "Career",
            "difficulty": "Easy",
            "tips": "Align your goals with the company's growth opportunities."
        },
        {
            "id": 5,
            "question": "How do you handle tight deadlines and pressure?",
            "category": "Behavioral",
            "difficulty": "Medium",
            "tips": "Give specific examples showing prioritization and time management."
        }
    ],
    "summary": "These questions cover a mix of technical, behavioral, and career topics relevant to a Full Stack Developer role."
}

MOCK_EVALUATION = {
    "score": 70,
    "feedback": "Good answer with relevant points. Consider adding specific examples and quantifiable outcomes to strengthen your response.",
    "strengths": [
        "Shows understanding of the concept",
        "Structured response"
    ],
    "improvements": [
        "Add specific examples from your experience",
        "Quantify your achievements where possible",
        "Use the STAR method for behavioral questions"
    ],
    "sample_answer": "A strong answer would include specific examples, metrics, and demonstrate both technical knowledge and practical application."
}

QUESTIONS_PROMPT = """You are an expert career coach and interview preparation specialist. Generate 5 interview questions for the following role/domain.

Role/Domain: {role}
{context_section}

Return your response as a valid JSON object with exactly these keys:
{{
    "role": "<the role being interviewed for>",
    "questions": [
        {{
            "id": <question number>,
            "question": "<the interview question>",
            "category": "<Technical|Behavioral|Career|Problem Solving>",
            "difficulty": "<Easy|Medium|Hard>",
            "tips": "<brief tips for answering this question well>"
        }}
    ],
    "summary": "<brief overview of the question set>"
}}

Generate a balanced mix of technical, behavioral, and career questions. Make them realistic and relevant.

IMPORTANT: Return ONLY the JSON object. No additional text."""

EVALUATE_PROMPT = """You are an expert interview coach. Evaluate the following interview answer and provide detailed feedback.

Question: {question}
Candidate's Answer: {answer}
Role: {role}

Return your response as a valid JSON object with exactly these keys:
{{
    "score": <integer 0-100>,
    "feedback": "<overall feedback on the answer>",
    "strengths": [<list of what was done well>],
    "improvements": [<list of specific areas to improve>],
    "sample_answer": "<a strong sample answer for comparison>"
}}

Be encouraging but honest. Provide actionable feedback.

IMPORTANT: Return ONLY the JSON object. No additional text."""


def generate_interview_questions(role: str, user_skills: list = None) -> dict:
    """
    Generate interview questions for a specific role.
    """
    context_section = ""
    if user_skills:
        context_section = f"\nCandidate's known skills: {', '.join(user_skills)}"

    prompt = QUESTIONS_PROMPT.format(role=role, context_section=context_section)

    content = call_ai(
        system_prompt="You are a professional interview coach. Always respond with valid JSON only.",
        user_prompt=prompt,
        max_tokens=2500,
    )

    if not content:
        logger.warning("Using mock interview questions")
        mock = MOCK_QUESTIONS.copy()
        mock['role'] = role
        return mock

    result = parse_json_response(content)
    if not result or 'questions' not in result:
        logger.warning("Using mock interview questions (parse failed)")
        mock = MOCK_QUESTIONS.copy()
        mock['role'] = role
        return mock

    logger.info(f"Interview questions generated for: {role}")
    return result


def evaluate_answer(question: str, answer: str, role: str = '') -> dict:
    """
    Evaluate a candidate's interview answer using AI.
    """
    prompt = EVALUATE_PROMPT.format(
        question=question,
        answer=answer,
        role=role or 'General'
    )

    content = call_ai(
        system_prompt="You are a professional interview coach. Always respond with valid JSON only.",
        user_prompt=prompt,
        max_tokens=1500,
    )

    if not content:
        logger.warning("Using mock evaluation data")
        return MOCK_EVALUATION.copy()

    result = parse_json_response(content)
    if not result:
        logger.warning("Using mock evaluation data (parse failed)")
        return MOCK_EVALUATION.copy()

    # Validate score
    try:
        result['score'] = max(0, min(100, int(result.get('score', 0))))
    except (ValueError, TypeError):
        result['score'] = 0

    logger.info(f"Interview answer evaluated — Score: {result['score']}")
    return result
