from django.urls import path, re_path
from .consumers import ChessRoomConsumer, LobbyConsumer, NotificationConsumer, ComputerRoomConsumer

websocket_urlpatterns = [
    re_path(r'ws/chess_room/(?P<chess_room_name>\w+)/$', ChessRoomConsumer.as_asgi()),
    re_path(r'ws/computer_room/(?P<chess_room_name>\w+)/$', ComputerRoomConsumer.as_asgi()),
    re_path(r'ws/chess_lobby/', LobbyConsumer.as_asgi()),
    re_path(r'ws/notifications/', NotificationConsumer.as_asgi())
]