from django.shortcuts import render
from rest_framework.views import APIView
from django.conf import settings

class LoginView(APIView):
    def get(self, request):
        return render(request, 'login.html')

class HomeView(APIView):
    def get(self, request):
        return render(request, 'home.html',{"WEBSOCKET_URL":settings.WEBSOCKET_URL})
 
class EmployeeView(APIView):
    def get(self, request):
        return render(request, 'admin.html')

class PilotView(APIView):
    def get(self, request):
        all_params = request.GET
        # Handle GET request, render pilot.html template
        return render(request, 'pilot.html',{"WEBSOCKET_URL":settings.WEBSOCKET_URL})
    
class BusView(APIView):
    def get(self, request):
        return render(request, 'Bus.html')    

class ShowAllBusView(APIView):
    def get(self, request):
        return render(request, 'allbus.html')    

class ShowAllPilotView(APIView):
    def get(self, request):
        return render(request, 'allpilot.html')    
