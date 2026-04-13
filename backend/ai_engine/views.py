"""
Views for AI Engine — Roadmap generation, Chatbot, and Interview Prep.
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .services.roadmap import generate_roadmap
from .services.chatbot import chatbot_response
from .services.interview import generate_interview_questions, evaluate_answer

logger = logging.getLogger('ai_engine')


class RoadmapView(APIView):
    """
    POST /api/roadmap/generate/
    Generate a learning roadmap based on missing skills.
    Body: { "skills": ["Docker", "AWS", ...] }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        skills = request.data.get('skills', [])
        if not skills or not isinstance(skills, list):
            return Response(
                {'error': 'Please provide a list of skills.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = generate_roadmap(skills)
            return Response({
                'message': 'Roadmap generated successfully.',
                'data': result
            })
        except Exception as e:
            logger.error(f"Roadmap generation failed: {e}")
            return Response(
                {'error': f'Roadmap generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatView(APIView):
    """
    POST /api/chat/
    Chat with the AI career assistant.
    Body: { "messages": [{"role": "user", "content": "..."}], "context": "..." }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get('messages', [])
        context = request.data.get('context', '')

        if not messages:
            return Response(
                {'error': 'Please provide at least one message.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reply = chatbot_response(messages, user_context=context)
            return Response({
                'message': 'Response generated.',
                'data': {
                    'role': 'assistant',
                    'content': reply,
                }
            })
        except Exception as e:
            logger.error(f"Chatbot failed: {e}")
            return Response(
                {'error': f'Chatbot error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterviewQuestionsView(APIView):
    """
    POST /api/interview/questions/
    Generate interview questions for a role.
    Body: { "role": "Frontend Developer", "skills": ["React", ...] }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = request.data.get('role', '').strip()
        skills = request.data.get('skills', [])

        if not role:
            return Response(
                {'error': 'Please provide a role/domain for interview preparation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = generate_interview_questions(role, user_skills=skills)
            return Response({
                'message': 'Interview questions generated.',
                'data': result
            })
        except Exception as e:
            logger.error(f"Interview question generation failed: {e}")
            return Response(
                {'error': f'Failed to generate questions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterviewEvaluateView(APIView):
    """
    POST /api/interview/evaluate/
    Evaluate a candidate's answer to an interview question.
    Body: { "question": "...", "answer": "...", "role": "..." }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('question', '').strip()
        answer = request.data.get('answer', '').strip()
        role = request.data.get('role', '')

        if not question or not answer:
            return Response(
                {'error': 'Please provide both the question and your answer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = evaluate_answer(question, answer, role=role)
            return Response({
                'message': 'Answer evaluated.',
                'data': result
            })
        except Exception as e:
            logger.error(f"Interview evaluation failed: {e}")
            return Response(
                {'error': f'Failed to evaluate answer: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
