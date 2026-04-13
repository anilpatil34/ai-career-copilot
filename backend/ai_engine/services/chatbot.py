"""
AI Chatbot Service.
Provides career-related chat assistance with conversation history.
"""
import logging
from .base import get_ai_client

logger = logging.getLogger('ai_engine')

SYSTEM_PROMPT = """You are an expert AI Career Copilot assistant. You help users with:
- Career advice and planning
- Resume improvement tips
- Interview preparation
- Skill development recommendations
- Job search strategies
- Salary negotiation tips
- Cover letter guidance

Be professional, encouraging, and specific in your advice. 
Keep responses concise but helpful (2-4 paragraphs max).
If the user asks something unrelated to careers, politely redirect them to career topics."""


def chatbot_response(messages: list, user_context: str = '') -> str:
    """
    Generate a chatbot response using conversation history.
    
    Args:
        messages: List of {"role": "user"|"assistant", "content": "..."}
        user_context: Optional context about the user's resume/skills.
    
    Returns:
        AI response text.
    """
    client, model = get_ai_client()

    if not client:
        return _mock_response(messages[-1]['content'] if messages else '')

    # Build message list
    system = SYSTEM_PROMPT
    if user_context:
        system += f"\n\nUser's context: {user_context}"

    api_messages = [{"role": "system", "content": system}]

    # Include last 10 messages for context
    for msg in messages[-10:]:
        api_messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    try:
        response = client.chat.completions.create(
            model=model,
            messages=api_messages,
            temperature=0.7,
            max_tokens=1000,
        )
        content = response.choices[0].message.content.strip()
        logger.info("Chatbot response generated")
        return content
    except Exception as e:
        logger.error(f"Chatbot API call failed: {e}")
        return _mock_response(messages[-1]['content'] if messages else '')


def _mock_response(user_message: str) -> str:
    """Provide a mock response when AI is unavailable."""
    user_lower = user_message.lower()
    if any(word in user_lower for word in ['resume', 'cv']):
        return ("Great question about resumes! Here are some tips:\n\n"
                "1. **Quantify your achievements** — Use numbers to show impact (e.g., 'Increased sales by 25%').\n"
                "2. **Tailor for each job** — Customize your resume for each application.\n"
                "3. **Use action verbs** — Start bullets with strong verbs like Built, Led, Designed.\n"
                "4. **Keep it concise** — Aim for 1-2 pages maximum.\n\n"
                "Would you like me to help with anything specific about your resume?")
    elif any(word in user_lower for word in ['interview', 'prepare']):
        return ("Here are some interview preparation tips:\n\n"
                "1. **Research the company** — Understand their mission, products, and culture.\n"
                "2. **Practice STAR method** — Structure answers: Situation, Task, Action, Result.\n"
                "3. **Prepare questions** — Have 3-5 thoughtful questions for the interviewer.\n"
                "4. **Mock interviews** — Practice with a friend or use tools like Pramp.\n\n"
                "What type of interview are you preparing for?")
    elif any(word in user_lower for word in ['skill', 'learn', 'course']):
        return ("For skill development, I recommend:\n\n"
                "1. **Identify gaps** — Use our Resume Analyzer to find missing skills.\n"
                "2. **Online platforms** — Coursera, Udemy, and freeCodeCamp offer great courses.\n"
                "3. **Build projects** — Hands-on experience is invaluable.\n"
                "4. **Contribute to open source** — Great for learning and networking.\n\n"
                "What specific skills are you looking to develop?")
    else:
        return ("I'm your AI Career Copilot! I can help you with:\n\n"
                "• 📄 **Resume tips** — How to improve your resume\n"
                "• 🎯 **Job searching** — Strategies for finding opportunities\n"
                "• 💼 **Interview prep** — Getting ready for interviews\n"
                "• 📚 **Skill development** — What to learn next\n"
                "• 💰 **Salary negotiation** — How to negotiate offers\n\n"
                "What would you like help with today?")
