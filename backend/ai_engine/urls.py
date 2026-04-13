"""URL patterns for AI engine."""
from django.urls import path
from .views import RoadmapView, ChatView, InterviewQuestionsView, InterviewEvaluateView

urlpatterns = [
    path('roadmap/generate/', RoadmapView.as_view(), name='roadmap-generate'),
    path('chat/', ChatView.as_view(), name='chat'),
    path('interview/questions/', InterviewQuestionsView.as_view(), name='interview-questions'),
    path('interview/evaluate/', InterviewEvaluateView.as_view(), name='interview-evaluate'),
]
