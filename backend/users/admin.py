from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_role', 'target_role', 'experience_years', 'created_at')
    search_fields = ('user__username', 'user__email', 'current_role')
    list_filter = ('experience_years',)
