"""
Serializers for Resume upload and analysis.
"""
from rest_framework import serializers
from .models import Resume, AnalysisResult


class ResumeUploadSerializer(serializers.ModelSerializer):
    """Serializer for resume file upload."""

    class Meta:
        model = Resume
        fields = ('id', 'file', 'original_filename', 'file_size', 'uploaded_at')
        read_only_fields = ('id', 'original_filename', 'file_size', 'uploaded_at')

    def validate_file(self, value):
        # Validate file extension
        allowed_extensions = ['.pdf', '.docx', '.doc']
        ext = value.name.rsplit('.', 1)[-1].lower() if '.' in value.name else ''
        if f'.{ext}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file type '.{ext}'. Allowed: {', '.join(allowed_extensions)}"
            )
        # Validate file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must be under 5MB.")
        return value


class AnalysisResultSerializer(serializers.ModelSerializer):
    """Serializer for analysis results."""
    resume_name = serializers.CharField(source='resume.original_filename', read_only=True)

    class Meta:
        model = AnalysisResult
        fields = (
            'id', 'resume', 'resume_name', 'score', 'skills', 'missing_skills',
            'strengths', 'weaknesses', 'suggestions', 'recommended_roles',
            'summary', 'result_data', 'analyzed_at'
        )
        read_only_fields = fields


class ResumeListSerializer(serializers.ModelSerializer):
    """Serializer for listing resumes with analysis status."""
    has_analysis = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = (
            'id', 'original_filename', 'file_size', 'is_parsed',
            'has_analysis', 'score', 'uploaded_at'
        )

    def get_has_analysis(self, obj):
        return hasattr(obj, 'analysis')

    def get_score(self, obj):
        if hasattr(obj, 'analysis'):
            return obj.analysis.score
        return None
