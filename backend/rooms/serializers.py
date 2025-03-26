from rest_framework import serializers
from .models import Library, Floor, Room, Reservation, Material

class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = ['id', 'name', 'location', 'description', 'opening_time', 'closing_time']

class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = ['id', 'library', 'number', 'description', 'floor_map']

class RoomSerializer(serializers.ModelSerializer):
    library_name = serializers.CharField(source='floor.library.name', read_only=True)
    floor_number = serializers.IntegerField(source='floor.number', read_only=True)
    library_code = serializers.CharField(source='floor.library.code', read_only=True)
    display_name = serializers.CharField(read_only=True)
    location_description = serializers.CharField(read_only=True)
    room_number = serializers.CharField()
    
    class Meta:
        model = Room
        fields = [
            'id',
            'room_id', 'room_number', 'floor', 'library_name', 'library_code', 
            'floor_number', 'display_name', 'location_description',
            'capacity', 'has_whiteboard', 'has_monitor', 'has_window',
            'status', 'position_x', 'position_y', 'width', 'height',
            'is_graduate_only', 'requires_admin_approval'
        ] # added is_graduate_only and requires_admin_approval for exposing
          # room permission fields to frontend

class ReservationSerializer(serializers.ModelSerializer):
    room_id = serializers.CharField(source='room.room_id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'reservation_id', 'room', 'room_id', 'user', 'username',
            'start_time', 'end_time', 'status', 'purpose', 
            'num_attendees', 'notes', 'created_at', 'modified_at'
        ]
        read_only_fields = ['reservation_id', 'user', 'created_at', 'modified_at']


class RoomAvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name', 'library', 'created_at']
