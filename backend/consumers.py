from channels.generic.websocket import JsonWebsocketConsumer,AsyncJsonWebsocketConsumer 
from .models import Bu,Pilot
from .serializers import BusSerializer, PilotSerializer
from django.contrib.auth.models import AnonymousUser
from .serializers import BusSerializer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async ,async_to_sync
from django.shortcuts import get_object_or_404


class AsyncHRTCConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['bus_id']
        self.user = self.scope["user"]
        # self.userinstance = None
        
        try:
            self.businstance = await self.get_bus_instance()
            if (self.user != AnonymousUser()):
                self.userinstance = await self.get_pilot_instance()

            await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
            )
            await self.accept()
                    
        except Exception as e:
            await self.accept()
            await self.send_json({
                "error": "Invalid Registration Number or Pilot",
                "message": "Please enter the right Registration Number or Pilot credentials",
            })
            await self.close()    

    async def disconnect(self, close_code):
        # Leave room group
        if (self.user != AnonymousUser()):
            pilot_data = {"currentBus": "", "isOnline": False}
            bus_data = {"isOnline": False, "currentPilot": "", "frm": "", "to": "","latitude":"0.0","longitude":"0.0"}
            await self.update_pilot_and_bus(pilot_data=pilot_data,bus_data=bus_data)
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        await self.close()

    #Step 1 of message receiving
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        if self.user != AnonymousUser():
            try:
                if text_data:
                    await self.receive_json(await self.decode_json(text_data), **kwargs)
                else:
                    raise ValueError("No text section for incoming WebSocket frame!")
            except ValueError as e:
                self.send_json({'error': str(e)})       
    
    #Step 2 of message receiving
    async def receive_json(self, content, **kwargs):
        pilot_id = await (self.get_pilot_id())
        # Send message to room group  
        await (self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'user': self.user.username,
                'pilotid': pilot_id,
                'content': content
            }
        ))

    # Receive message from room group
    #Step 3 of message receiving
    async def chat_message(self, event):
        try:
            content = event['content']
            content['Pilot'] =  event['user']
            content['currentPilot'] =  event['pilotid']  
            content['isOnline'] = True 
                    
            # Update the instances with provided data
            pilot_data = {"currentBus": self.group_name, "isOnline": True}
            await self.update_pilot_and_bus(pilot_data, content)
            await self.send_json(content)   

        except Exception as e:
            print(e)
            content = event['content']
            await self.send_json(content)      

    @database_sync_to_async
    def get_pilot_instance(self):
        return Pilot.objects.filter(username=self.user.id).first()
    
    @database_sync_to_async
    def get_pilot_id(self):
        return self.user.pilot.id

    @database_sync_to_async
    def get_bus_instance(self):
        return get_object_or_404(Bu, regNo=self.group_name)
    
    @database_sync_to_async
    def update_pilot_and_bus(self, pilot_data, bus_data):
        try:
            pilotserializer = PilotSerializer(self.userinstance, data=pilot_data, partial=True)
            busserializer = BusSerializer(self.businstance, data=bus_data, partial=True)
            if pilotserializer.is_valid() and busserializer.is_valid():
                pilotserializer.save()
                busserializer.save()
            else:
                print(pilotserializer.errors)
                print(busserializer.errors)
                raise ValueError("Invalid data for Pilot or Bus")
        except Exception as e:
            print("EXCEPTION",e)

class SyncHRTCConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['bus_id']
        self.user = self.scope["user"] 
        
        try:
            self.businstance = self.get_bus_instance()
            if (self.user != AnonymousUser()):
                self.userinstance = self.get_pilot_instance()
            async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
            ) 
            self.accept()
                    
        except Exception as e:
            self.accept()
            self.send_json({
                "error": "Invalid Registration Number or Pilot",
                "message": "Please enter the right Registration Number or Pilot credentials"
            })
            self.close()    

    def disconnect(self, close_code):
        # Leave room group
        if (self.user != AnonymousUser()):
            pilot_data = {"currentBus": "", "isOnline": False}
            bus_data = {"isOnline": False, "currentPilot": "", "frm": "", "to": "","latitude":"0.0","longitude":"0.0","message":""}
            
            self.update_pilot_and_bus(pilot_data=pilot_data,bus_data=bus_data)
            
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

    #Step 1 of message receiving
    def receive(self, text_data=None, bytes_data=None, **kwargs):
        if self.user != AnonymousUser():
            try:
                if text_data:
                    self.receive_json(self.decode_json(text_data), **kwargs)
                else:
                    raise ValueError("No text section for incoming WebSocket frame!")
            except ValueError as e:
                self.send_json({'error': str(e)})       
    
    #Step 2 of message receiving
    def receive_json(self, content, **kwargs):
        # Send message to room group  
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'chat_message',
                'user': self.user.username,
                'pilotid':self.user.pilot.id,
                'content': content
            }
        )              

    # Receive message from room group
    #Step 3 of message receiving
    def chat_message(self, event):
        try:
            content = event['content']
            content['Pilot'] =  event['user']
            content['currentPilot'] =  event['pilotid']  
            content['isOnline'] = True  
                    
            # Update the instances with provided data
            pilot_data = {"currentBus": self.group_name, "isOnline": True}
            self.update_pilot_and_bus(pilot_data, content)
            self.send_json(content)     

        except Exception as e:
            content = event['content']
            self.send_json(content)      

    def get_pilot_instance(self):
        return Pilot.objects.filter(username=self.user.id).first()

    def get_bus_instance(self):
        return get_object_or_404(Bu, regNo=self.group_name)

    def update_pilot_and_bus(self, pilot_data, bus_data):
        pilotserializer = PilotSerializer(self.userinstance, data=pilot_data, partial=True)
        busserializer = BusSerializer(self.businstance, data=bus_data, partial=True)
        
        if pilotserializer.is_valid() and busserializer.is_valid():
            pilotserializer.save()
            busserializer.save()
        else:
            raise ValueError("Invalid data for Pilot or Bus")
