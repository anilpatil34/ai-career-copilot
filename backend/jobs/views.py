"""
Views for job description matching.
"""
import logging
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import JobDescription, JobMatchResult
from .serializers import JobMatchResultSerializer, JobMatchRequestSerializer
from resumes.models import Resume

logger = logging.getLogger(__name__)


class JobMatchView(APIView):
    """
    POST /api/job/match/
    Compare a resume with a job description using AI.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = JobMatchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Get the resume
        try:
            resume = Resume.objects.get(id=data['resume_id'], user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not resume.parsed_text:
            return Response(
                {'error': 'Resume has not been parsed. Please analyze it first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create job description record
        job = JobDescription.objects.create(
            user=request.user,
            title=data['title'],
            company=data.get('company', ''),
            description=data['description'],
        )

        # Run AI matching
        try:
            from ai_engine.services.matcher import match_job_description
            ai_result = match_job_description(resume.parsed_text, data['description'])
        except Exception as e:
            logger.error(f"Job matching failed: {e}")
            return Response(
                {'error': f'Job matching failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save match result
        match_pct = ai_result.get('match_percentage', 0)
        try:
            match_pct = max(0, min(100, int(match_pct)))
        except (ValueError, TypeError):
            match_pct = 0

        match_result = JobMatchResult.objects.create(
            user=request.user,
            job=job,
            resume=resume,
            match_percentage=match_pct,
            matching_skills=ai_result.get('matching_skills', []),
            missing_keywords=ai_result.get('missing_keywords', []),
            suggestions=ai_result.get('suggestions', []),
            summary=ai_result.get('summary', ''),
            result_data=ai_result,
        )

        result_serializer = JobMatchResultSerializer(match_result)
        logger.info(f"Job matched: {job.title} — {match_pct}%")
        return Response({
            'message': 'Job matching completed.',
            'data': result_serializer.data
        }, status=status.HTTP_201_CREATED)


class JobHistoryView(generics.ListAPIView):
    """
    GET /api/job/history/
    List all job match results for the current user.
    """
    serializer_class = JobMatchResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobMatchResult.objects.filter(
            user=self.request.user
        ).select_related('job', 'resume').order_by('-created_at')
