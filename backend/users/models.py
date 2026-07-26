import uuid

from django.db import models


class Profile(models.Model):
    """
    App-side extension of a Supabase auth user.

    `id` must match the UUID Supabase assigns in auth.users when a user
    signs up. Supabase owns signup, login, password reset, and JWT issuance.
    This model only stores the SwiftMed-specific fields Supabase doesn't know
    about.

    Every other app (stores, orders, delivery, prescriptions) should FK to
    this model, not to Django's built-in auth.User.
    """

    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        STORE_OWNER = 'store_owner', 'Store owner'
        RIDER = 'rider', 'Rider'
        ADMIN = 'admin', 'Admin'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} ({self.role})'