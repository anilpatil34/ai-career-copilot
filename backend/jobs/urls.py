"""URL patterns for jobs app."""
from django.urls import path
from .views import JobMatchView, JobHistoryView

urlpatterns = [
    path('match/', JobMatchView.as_view(), name='job-match'),
    path('history/', JobHistoryView.as_view(), name='job-history'),
]
