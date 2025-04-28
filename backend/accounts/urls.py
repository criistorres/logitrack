# accounts/urls.py

from django.urls import path
from .views import (
    UserDetailView,
    UserRegistrationView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ChangePasswordView
)

urlpatterns = [
    # Endpoints de Autenticação (mantendo apenas os não redundantes)
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('signup/', UserRegistrationView.as_view(), name='user_registration'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password/change/', ChangePasswordView.as_view(), name='password_change'),
]