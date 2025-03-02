# Author(s): Dylan Connolly
# Purpose: Viewing data in JSON format for testing purposes
# Modified: 2/25/2025 @ 10:19:44 EST

# rooms/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register(r'libraries', api_views.LibraryViewSet)
router.register(r'floors', api_views.FloorViewSet)
router.register(r'rooms', api_views.RoomViewSet)
router.register(r'reservations', api_views.ReservationViewSet)
router.register(r'materials', api_views.MaterialViewSet)

urlpatterns = [
    path('demo/', api_views.demo_view, name='demo'),

    path('', include(router.urls)),

    path('rooms/<str:room_id>/availability/', api_views.check_room_availability, name='room-availability'),
    
    path('libraries/<int:library_id>/floors/', 
         api_views.FloorViewSet.as_view({'get': 'list'}), 
         {'library': lambda x: x}, 
         name='library-floors'),
    
    path('floors/<int:floor_id>/rooms/', 
         api_views.RoomViewSet.as_view({'get': 'list'}), 
         {'floor': lambda x: x}, 
         name='floor-rooms'),

     path('libraries/<int:library_id>/materials/',
         api_views.MaterialViewSet.as_view({'get': 'list'}),
         {'library': lambda x: x},
         name='library-materials'),
]