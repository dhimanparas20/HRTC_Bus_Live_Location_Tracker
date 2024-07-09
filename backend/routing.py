from django.urls import path,re_path
from .consumers import AsyncHRTCConsumer,SyncHRTCConsumer


websocket_urlpatterns = [
    # path("ws/chat/<str:room_name>/", ChatConsumer.as_asgi()), 
    re_path(r"hrtc/(?P<bus_id>\w+)$", AsyncHRTCConsumer.as_asgi()),
    re_path(r"hrtc/(?P<bus_id>\w+)/$", AsyncHRTCConsumer.as_asgi()),
    re_path(r"s/hrtc/(?P<bus_id>\w+)$", SyncHRTCConsumer.as_asgi()),
    re_path(r"s/hrtc/(?P<bus_id>\w+)/$", SyncHRTCConsumer.as_asgi()),
] 