from phonenumber_field.modelfields import PhoneNumberField
from django.db import models
from .managers import CustomUserManager
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.contrib.auth import get_user_model

# get custom user model or use settings.AUTH_USER_MODEL
# User = get_user_model()
from django.conf import settings
User = settings.AUTH_USER_MODEL

# Extend Base User model
class BaseUser(AbstractUser):
    phone_number = PhoneNumberField(blank=True, null=True, unique=True)
    objects = CustomUserManager()

    # Removed USERNAME_FIELD and REQUIRED_FIELDS attributes

    def __str__(self):
        return self.username  # Changed from email to username
    
#List of Stations for the Buses
class Station(models.Model):
    id = models.AutoField(primary_key=True)
    stationName = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.stationName    
    
#HRTC office Employee    
class Employee(models.Model):
    username = models.OneToOneField(User,primary_key=True,max_length=15,on_delete=models.CASCADE)
    officeAddress = models.ForeignKey(Station,on_delete=models.SET_NULL,null=True)
    
    def __str__(self):
        return str(self.username) + "-" + str(self.officeAddress)
    def save(self, *args, **kwargs):
        if self.username.username == 'admin':
            raise ValueError("The user 'admin' cannot be added as an employee.")
        super().save(*args, **kwargs)    

#HRTC Pilot
class Pilot(models.Model):
    username = models.OneToOneField(User,unique=True,max_length=15,on_delete=models.CASCADE)
    phone_number = PhoneNumberField(blank=True, null=True, unique=True,editable=False)
    isOnline = models.BooleanField(default=False)
    currentBus = models.CharField(max_length=15,blank=True)
    fname = models.CharField(max_length=30, editable=False,blank=True)
    lname = models.CharField(max_length=30, editable=False,blank=True)
    
    def __str__(self):
        return str(self.username)
    def save(self, *args, **kwargs):
        if self.username.username == 'admin':
            raise ValueError("The user 'admin' cannot be added as a pilot.")
        # Auto-fill fname and lname from the User model
        self.fname = self.username.first_name
        self.lname = self.username.last_name
        self.phone_number = self.username.phone_number
        
        super().save(*args, **kwargs)

    def clean(self):
        if Employee.objects.filter(username=self.username).exists():
            raise ValidationError("This user is already registered as an employee.")    
    
#HRTC Bus
class Bu(models.Model):
    regNo = models.CharField(primary_key=True, max_length=15)
    depo = models.ForeignKey(Station, max_length=15, on_delete=models.CASCADE)
    frm = models.ForeignKey(Station, related_name='departure_station', on_delete=models.SET_NULL, null=True)
    to = models.ForeignKey(Station, related_name='destination_station', on_delete=models.SET_NULL, null=True)
    latitude = models.FloatField(max_length=20, blank=True, default=0.0)
    longitude = models.FloatField(max_length=20, blank=True, default=0.0)
    isOnline = models.BooleanField(default=False)
    currentPilot = models.ForeignKey(Pilot, on_delete=models.CASCADE, blank=True, null=True)
    message = models.TextField(max_length=250,default="",null=True,blank=True)
    lastupdated = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.frm_id == self.to_id:
            raise ValidationError("Departure and destination stations cannot be the same.")

    def __str__(self):
        return str(self.regNo) + " " + str(self.frm) + "-" + str(self.to)
                  