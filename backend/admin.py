from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import BaseUser,Employee,Station,Pilot,Bu


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = BaseUser
        fields = ("username", "phone_number")

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = BaseUser
        fields = ("username", "phone_number")

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = BaseUser
    list_display = ("username", "phone_number", "is_staff", "is_active")
    list_filter = ("username", "phone_number", "is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "password", "phone_number")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username", "phone_number", "password1", "password2", "is_staff",
                "is_active", "groups", "user_permissions"
            )}
        ),
    )
    search_fields = ("username",)
    ordering = ("username",)

admin.site.register(BaseUser, CustomUserAdmin)

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    ordering = ['stationName']

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    search_fields = ['username__username','officeAddress__stationName']
    list_display = ['username','officeAddress']
    list_filter = ['officeAddress'] 

@admin.register(Pilot)
class PilotAdmin(admin.ModelAdmin):
    search_fields = ['username__username','currentBus']
    list_display = ['username','currentBus','isOnline']
    list_filter = ['isOnline']  

@admin.register(Bu)
class BuAdmin(admin.ModelAdmin):
    search_fields = ['regNo','depo__stationName','frm__stationName','to__stationName',]
    list_display = ['regNo','depo','frm',"to",'isOnline','currentPilot']
    list_display_links = []
    list_filter = ['depo','frm','to','isOnline']