from django.urls import path,include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'stations', views.StationViewSet, basename='station')
router.register(r"users", views.UserViewSet,basename="signup")
router.register(r"admin", views.AdminViewSet,basename="admin")
router.register(r"pilot", views.PilotViewSet,basename="pilot")
router.register(r"bus", views.BusViewSet,basename="bus")


urlpatterns = [
    path('',include(router.urls)),   # for above routers
    path('login/', views.Login.as_view(), name="login"),
    path('logout/', views.Logout.as_view(), name='logout'),
    path('user/', views.view_details.as_view(), name="user"),
    path('getonline/', views.getonline.as_view(), name="getonline"),  
]
