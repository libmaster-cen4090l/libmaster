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

    class Meta:
        model = Room
        fields = [
            'room_id', 'floor', 'library_name', 'floor_number', 
            'capacity', 'has_whiteboard', 'has_monitor', 'has_window',
            'status', 'position_x', 'position_y', 'width', 'height'
        ]

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