"""
Views for resume upload, analysis, and history.
"""
import logging
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Resume, AnalysisResult
from .serializers import ResumeUploadSerializer, AnalysisResultSerializer, ResumeListSerializer
from .services.parser import parse_resume

logger = logging.getLogger('resumes')


class ResumeUploadView(generics.CreateAPIView):
    """
    POST /api/resume/upload/
    Upload a PDF or DOCX resume file.
    """
    serializer_class = ResumeUploadSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        uploaded_file = self.request.FILES.get('file')
        original_name = uploaded_file.name if uploaded_file else 'unknown'
        file_size = uploaded_file.size if uploaded_file else 0
        resume = serializer.save(
            user=self.request.user,
            original_filename=original_name,
            file_size=file_size,
        )
        # Attempt to parse immediately
        try:
            text = parse_resume(resume.file.path)
            resume.parsed_text = text
            resume.is_parsed = True
            resume.save()
            logger.info(f"Resume parsed on upload: {original_name}")
        except Exception as e:
            logger.warning(f"Could not parse resume on upload: {e}")

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data['message'] = 'Resume uploaded successfully.'
        return response


class ResumeListView(generics.ListAPIView):
    """
    GET /api/resume/list/
    List all resumes for the current user.
    """
    serializer_class = ResumeListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(
            user=self.request.user
        ).select_related('analysis').order_by('-uploaded_at')


class ResumeDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/resume/delete/<id>/
    Delete a resume and its analysis.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        filename = instance.original_filename
        self.perform_destroy(instance)
        logger.info(f"Resume deleted: {filename}")
        return Response({'message': f'Resume "{filename}" deleted.'}, status=status.HTTP_200_OK)


class ResumeAnalyzeView(APIView):
    """
    POST /api/resume/analyze/<id>/
    Send resume text to AI for analysis.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Get the resume
        try:
            resume = Resume.objects.get(id=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if already analyzed
        if hasattr(resume, 'analysis'):
            serializer = AnalysisResultSerializer(resume.analysis)
            return Response({
                'message': 'Resume already analyzed.',
                'data': serializer.data
            })

        # Parse resume if not already parsed
        if not resume.is_parsed or not resume.parsed_text:
            try:
                text = parse_resume(resume.file.path)
                resume.parsed_text = text
                resume.is_parsed = True
                resume.save()
            except Exception as e:
                return Response(
                    {'error': f'Error parsing resume: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if len(resume.parsed_text.strip()) < 50:
            return Response(
                {'error': 'Could not extract sufficient text. Please upload a different file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Run AI analysis
        try:
            from ai_engine.services.analyzer import analyze_resume_text
            ai_result = analyze_resume_text(resume.parsed_text)
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return Response(
                {'error': f'AI analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save results
        score = ai_result.get('score', 0)
        try:
            score = max(0, min(100, int(score)))
        except (ValueError, TypeError):
            score = 0

        analysis = AnalysisResult.objects.create(
            resume=resume,
            score=score,
            skills=ai_result.get('skills', []),
            missing_skills=ai_result.get('missing_skills', []),
            strengths=ai_result.get('strengths', []),
            weaknesses=ai_result.get('weaknesses', []),
            suggestions=ai_result.get('suggestions', []),
            recommended_roles=ai_result.get('recommended_roles', []),
            summary=ai_result.get('summary', ''),
            result_data=ai_result,
        )

        serializer = AnalysisResultSerializer(analysis)
        logger.info(f"Resume analyzed: {resume.original_filename} — Score: {score}")
        return Response({
            'message': 'Resume analyzed successfully.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class AnalysisDetailView(generics.RetrieveAPIView):
    """
    GET /api/resume/analysis/<id>/
    Get analysis result by ID.
    """
    serializer_class = AnalysisResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AnalysisResult.objects.filter(
            resume__user=self.request.user
        ).select_related('resume')
