from django.contrib import admin
from .models import JobDescription, JobMatchResult


@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'user', 'created_at')
    search_fields = ('title', 'company')


@admin.register(JobMatchResult)
class JobMatchResultAdmin(admin.ModelAdmin):
    list_display = ('job', 'resume', 'match_percentage', 'created_at')
    list_filter = ('match_percentage',)
