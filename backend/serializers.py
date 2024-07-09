# from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Bu,Pilot,Station,Employee,BaseUser

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model=Employee
        fields="__all__"
       
class PilotSerializer(serializers.ModelSerializer):
    class Meta:
        model=Pilot
        fields="__all__"

class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bu
        fields = "__all__"

    def validate(self, data):
        frm_id = data.get('frm')
        to_id = data.get('to')

        if frm_id == to_id and frm_id !=None and to_id != None:
            raise serializers.ValidationError("Departure and destination stations cannot be the same.")
        return data

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'
                         
class UserSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer()
    pilot = PilotSerializer()
    class Meta:
        model = BaseUser
        exclude=["groups","user_permissions","is_active","date_joined","is_staff","is_superuser","last_login"]      

class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Declare password as write-only
    class Meta:
        model = BaseUser
        exclude=["groups","user_permissions","is_active","date_joined","is_staff","is_superuser","last_login"] 

    def create(self, validated_data):
        password = validated_data.pop("password")  # Remove password from validated data
        user = BaseUser.objects.create(**validated_data)
        user.set_password(password)  # Set hashed password
        user.save()
        return user   