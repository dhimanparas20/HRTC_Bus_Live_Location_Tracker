from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name="home"),
    path('login/', views.LoginView.as_view(), name="login"),
    path('pilot/', views.PilotView.as_view(), name='pilot'),
    path('employee/', views.EmployeeView.as_view(), name='employee'),
    path('bus/', views.BusView.as_view(), name="bus"),
    path('showallbus/', views.ShowAllBusView.as_view(), name="showallbus"),
    path('showallpilot/', views.ShowAllPilotView.as_view(), name="showallpilot"),
]