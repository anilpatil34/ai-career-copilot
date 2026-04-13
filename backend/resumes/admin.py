from django.contrib import admin
from .models import Resume, AnalysisResult


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'user', 'is_parsed', 'file_size', 'uploaded_at')
    list_filter = ('is_parsed', 'uploaded_at')
    search_fields = ('original_filename', 'user__username')


@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = ('resume', 'score', 'analyzed_at')
    list_filter = ('score',)
    search_fields = ('resume__original_filename',)
