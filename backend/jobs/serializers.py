"""
Serializers for jobs app.
"""
from rest_framework import serializers
from .models import JobDescription, JobMatchResult


class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = ('id', 'title', 'company', 'description', 'url', 'created_at')
        read_only_fields = ('id', 'created_at')


class JobMatchResultSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    resume_name = serializers.CharField(source='resume.original_filename', read_only=True)

    class Meta:
        model = JobMatchResult
        fields = (
            'id', 'job', 'job_title', 'job_company', 'resume', 'resume_name',
            'match_percentage', 'matching_skills', 'missing_keywords',
            'suggestions', 'summary', 'result_data', 'created_at'
        )
        read_only_fields = fields


class JobMatchRequestSerializer(serializers.Serializer):
    """Input serializer for job matching."""
    resume_id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    company = serializers.CharField(max_length=255, required=False, default='')
    description = serializers.CharField()
