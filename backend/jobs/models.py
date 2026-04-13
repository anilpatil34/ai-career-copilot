"""
Job description and match result models.
"""
from django.db import models
from django.contrib.auth.models import User
from resumes.models import Resume


class JobDescription(models.Model):
    """Stores job descriptions submitted by users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_descriptions')
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField()
    url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Job Description'

    def __str__(self):
        return f"{self.title} at {self.company}" if self.company else self.title


class JobMatchResult(models.Model):
    """Stores AI job matching results."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_matches')
    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='match_results')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='job_matches')
    match_percentage = models.IntegerField(default=0, help_text='Match percentage 0–100')
    matching_skills = models.JSONField(default=list)
    missing_keywords = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    summary = models.TextField(blank=True, default='')
    result_data = models.JSONField(default=dict, help_text='Full raw AI response')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Job Match Result'

    def __str__(self):
        return f"Match: {self.job.title} — {self.match_percentage}%"
