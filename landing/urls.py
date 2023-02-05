from django.urls import path
from .views import Landing, Register, Login, Logout

urlpatterns = [
    path('', Landing.as_view(), name='landing'),
    path('login/', Login.as_view(), name='login'),
    path('register/', Register.as_view(), name='register'),
    path('logout/', Logout.as_view(), name='logout'),
] 