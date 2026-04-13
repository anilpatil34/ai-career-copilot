"""URL patterns for resumes app."""
from django.urls import path
from .views import (
    ResumeUploadView,
    ResumeListView,
    ResumeDeleteView,
    ResumeAnalyzeView,
    AnalysisDetailView,
)

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('list/', ResumeListView.as_view(), name='resume-list'),
    path('delete/<int:pk>/', ResumeDeleteView.as_view(), name='resume-delete'),
    path('analyze/<int:pk>/', ResumeAnalyzeView.as_view(), name='resume-analyze'),
    path('analysis/<int:pk>/', AnalysisDetailView.as_view(), name='analysis-detail'),
]
