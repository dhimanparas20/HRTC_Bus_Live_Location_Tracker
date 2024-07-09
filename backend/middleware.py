from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        token = self.get_token_from_scope(scope)
        scope['user'] = await self.get_user_from_token(token)
        return await self.inner(scope, receive, send)

    def get_token_from_scope(self, scope):
        query_params = scope.get('query_string', b'').decode()
        token = None
        try:
            for param in query_params.split('&'):
                key, value = param.split('=')
                if key == 'token':
                    token = value
                    break
            return token  
        except:
            token = "notoken"
            return token


    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return AnonymousUser()