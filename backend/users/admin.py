from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone_number', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('full_name', 'email', 'phone_number')