from .models import Bu,Pilot,Station,Employee,BaseUser
from .serializers import BusSerializer,PilotSerializer,StationSerializer,EmployeeSerializer,UserSerializer,CreateUserSerializer
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view,action
from django.forms.models import model_to_dict
from rest_framework.mixins import ListModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet,ReadOnlyModelViewSet
from rest_framework.permissions import BasePermission

# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework_simplejwt.tokens import RefreshToken

#when sending token in header we nedd to specify Toekn or Bearer
# use [BearerTokenAuthentication] insted of [TokenAuthentication]
class BearerTokenAuthentication(TokenAuthentication):
    keyword = 'Bearer'

#Custom Permission class
#So that only admin tokens are accepted and not pilot.
class IsEmployeeUser(BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow access if the user is a superuser
        if request.user.is_superuser:
            return True
        
        # Check if the user is associated with an Employee instance
        return Employee.objects.filter(username=request.user).exists()

#Create New Main User            
class UserViewSet(ModelViewSet):
    queryset = BaseUser.objects.all()
    serializer_class = CreateUserSerializer
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsEmployeeUser]
    filterset_fields = ['username','id']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Serialize the user instance to include in the response
            user_serializer = self.serializer_class(user)
            return Response({"message": "User created successfully","data":user_serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

    def destroy(self, request, *args, **kwargs):
        user_id = kwargs.get('pk')
        try:
            user = BaseUser.objects.get(pk=user_id)
            user.delete()
            return Response({"message": "User deleted successfully","id":user.username}, status=status.HTTP_200_OK)
        except BaseUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
    # def list(self, request, *args, **kwargs):
    #     users = BaseUser.objects.all()
    #     serializer = UserSerializer(users, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)   

#Pilot Viewset
class PilotViewSet(ModelViewSet):
    queryset = Pilot.objects.all()
    serializer_class = PilotSerializer
    authentication_classes = [BearerTokenAuthentication]  
    permission_classes = [IsEmployeeUser]

#Bus Viewset
class BusViewSet(ModelViewSet):
    queryset = Bu.objects.all()
    serializer_class = BusSerializer
    authentication_classes = [BearerTokenAuthentication]  
    permission_classes = [IsEmployeeUser] 
    filterset_fields = ['regNo','depo','currentPilot','frm','to']
    ordering_fields = ['depo']       
        
#Employee Viewset        
class AdminViewSet(ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsEmployeeUser]

#Returns the list of stations (readonly)
class StationViewSet(ReadOnlyModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer 
    filterset_fields = ['stationName','id']
    ordering_fields = ['stationName','id']
    # filter_backends = [DjangoFilterBackend]

#login for Employee and Pilot. returns a token
class Login(APIView):
    def post(self, request, format=None):
        try:
            username = request.data['username']
            password = request.data['password']
            # print(username,password)
        except:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)  
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        token,_ = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user) # or use payload = model_to_dict(user) 
        # refresh = RefreshToken.for_user(user)
        return Response({"payload":serializer.data,"access":str(token.key)})

#Logout
class Logout(APIView):
    def post(self, request, format=None):
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token_key = auth_header.split(' ')[1]
            try:
                token = Token.objects.get(key=token_key)
                token.delete()
                return Response({'success': 'Successfully logged out'}, status=status.HTTP_200_OK)
            except Token.DoesNotExist:
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Authorization header missing or invalid'}, status=status.HTTP_400_BAD_REQUEST)

#Return User Details for Logged in Users
class view_details(APIView):
    # authentication_classes = [JWTAuthentication]
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        # auth_token = request.auth
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data)    

#Get list of buses that are online
class getonline(APIView):
    filterset_fields = ['frm','to',"regNo"]
    def get(self, request, format=None):
        frm = request.query_params.get('from', None)
        to = request.query_params.get('to', None)
        regNo = request.query_params.get('regno', None)

        if (regNo):
            bus_instances = Bu.objects.filter(regNo=regNo, isOnline=True)            
            serializer = BusSerializer(bus_instances, many=True)
            return Response(serializer.data)
            
   
        if to==None and frm !=None:
            bus_instances = Bu.objects.filter(frm=frm, isOnline=True)            
            serializer = BusSerializer(bus_instances, many=True)
            return Response(serializer.data)
        elif frm==None and to !=None:
            bus_instances = Bu.objects.filter(to=to, isOnline=True)
            serializer = BusSerializer(bus_instances, many=True)
            return Response(serializer.data)
        elif frm!=None and to!=None:
            bus_instances = Bu.objects.filter(to=to,frm=frm, isOnline=True)
            serializer = BusSerializer(bus_instances, many=True)
            return Response(serializer.data)
        else:
            # Handle the case when 'frm' is not provided
            return Response({"error": "'from'/'to' parameter is missing"}, status=400)

       


