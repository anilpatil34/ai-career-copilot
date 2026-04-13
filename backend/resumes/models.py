"""
Resume and analysis result models.
"""
from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    """Stores uploaded resume files linked to users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    parsed_text = models.TextField(blank=True, default='')
    file_size = models.PositiveIntegerField(default=0, help_text='File size in bytes')
    is_parsed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Resume'
        verbose_name_plural = 'Resumes'

    def __str__(self):
        return f"{self.original_filename} — {self.user.username}"


class AnalysisResult(models.Model):
    """Stores AI analysis results linked to a resume."""
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='analysis')
    score = models.IntegerField(default=0, help_text='Resume quality score 0–100')
    skills = models.JSONField(default=list, help_text='Detected skills')
    missing_skills = models.JSONField(default=list, help_text='Missing/suggested skills')
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    recommended_roles = models.JSONField(default=list)
    summary = models.TextField(blank=True, default='')
    result_data = models.JSONField(default=dict, help_text='Full raw AI response')
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-analyzed_at']
        verbose_name = 'Analysis Result'

    def __str__(self):
        return f"Analysis: {self.resume.original_filename} — Score: {self.score}"
