from django.urls import path
from .views import Home, ChessRoom, ProfileSearch, Profile, Follow, SendChallenge, AcceptChallenge

urlpatterns = [
    path('lobby/', Home.as_view(), name='home'),
    path('game/<str:chess_room_name>/', ChessRoom.as_view(), name='chess_room'),
    path('search/', ProfileSearch.as_view(), name='profile_search'),
    path('profile/<int:pk>/', Profile.as_view(), name='profile'),
    path('profile_follow/<int:pk>/', Follow.as_view(), name='profile_follow'),
    path('send_challenge/<int:pk>/<int:challenger_pk>', SendChallenge.as_view(), name='send_challenge'),
    path('accept_challenge/<int:pk>/<str:accepted>/', AcceptChallenge.as_view(), name='accept_challenge')
]