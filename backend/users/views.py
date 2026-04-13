"""
Views for user authentication and profile management.
"""
import logging
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    CustomTokenObtainPairSerializer,
)

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user account.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Generate tokens for immediate login
        refresh = RefreshToken.for_user(user)
        logger.info(f"New user registered: {user.username}")
        return Response({
            'message': 'Registration successful.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Authenticate user and return JWT tokens.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklist the refresh token to log out.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning(f"Logout error: {e}")
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/profile/ - Get current user profile.
    PUT /api/auth/profile/ - Update profile.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class DashboardStatsView(APIView):
    """
    GET /api/auth/dashboard/
    Return aggregated dashboard data for the current user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from resumes.models import Resume, AnalysisResult
        from jobs.models import JobMatchResult

        resumes = Resume.objects.filter(user=user)
        analyses = AnalysisResult.objects.filter(resume__user=user)
        job_matches = JobMatchResult.objects.filter(user=user)

        # Compute latest scores
        latest_analysis = analyses.order_by('-analyzed_at').first()
        latest_score = latest_analysis.score if latest_analysis else 0
        all_skills = []
        missing_skills = []
        if latest_analysis and latest_analysis.result_data:
            all_skills = latest_analysis.result_data.get('skills', [])
            missing_skills = latest_analysis.result_data.get('missing_skills', [])

        # Job match history
        match_history = []
        for jm in job_matches.order_by('-created_at')[:10]:
            match_history.append({
                'id': jm.id,
                'job_title': jm.job.title if jm.job else 'N/A',
                'company': jm.job.company if jm.job else 'N/A',
                'match_percentage': jm.match_percentage,
                'date': jm.created_at.isoformat(),
            })

        return Response({
            'resume_count': resumes.count(),
            'analysis_count': analyses.count(),
            'latest_score': latest_score,
            'skills': all_skills,
            'missing_skills': missing_skills,
            'job_match_count': job_matches.count(),
            'match_history': match_history,
            'avg_match': (
                round(sum(jm.match_percentage for jm in job_matches) / job_matches.count())
                if job_matches.exists() else 0
            ),
        })
