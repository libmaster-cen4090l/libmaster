from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import status
from .serializers import UserSerializer
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()

        user = User.objects.get(username=request.data['username'])
        user.set_password(request.data['password'])
        user.save()

        refresh = RefreshToken.for_user(user)

        response = Response({
            'access': str(refresh.access_token),
        })

        cookie_max_age = 3600 * 24 * 14 # 14 days
        response.set_cookie('refresh_token', refresh, max_age=cookie_max_age, httponly=True )

        return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def logout(request):
    response = Response({"message": "Logged out succesfully!"}, status=status.HTTP_200_OK)
    response.delete_cookie('refresh_token')
    return response

# HTTP-only cookie workaround (https://github.com/jazzband/djangorestframework-simplejwt/issues/71#issuecomment-1380751960)
class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None
    def validate(self, attrs):
        attrs['refresh'] = self.context['request'].COOKIES.get('refresh_token')
        if attrs['refresh']:
            return super().validate(attrs)
        else:
            raise InvalidToken('No valid token found in cookie \'refresh_token\'')

# HTTP-only cookie workaround
class CookieTokenObtainPairView(TokenObtainPairView):
  def finalize_response(self, request, response, *args, **kwargs):
    if response.data.get('refresh'):
        cookie_max_age = 3600 * 24 * 14 # 14 days
        response.set_cookie('refresh_token', response.data['refresh'], max_age=cookie_max_age, httponly=True )
        del response.data['refresh']
    return super().finalize_response(request, response, *args, **kwargs)

# HTTP-only cookie workaround
class CookieTokenRefreshView(TokenRefreshView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('refresh'):
            cookie_max_age = 3600 * 24 * 14 # 14 days
            response.set_cookie('refresh_token', response.data['refresh'], max_age=cookie_max_age, httponly=True )
            del response.data['refresh']
        return super().finalize_response(request, response, *args, **kwargs)
    serializer_class = CookieTokenRefreshSerializer