from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime
from .models import Library, Floor, Room, Reservation, Material
from .serializers import LibrarySerializer, FloorSerializer, RoomSerializer, ReservationSerializer, RoomAvailabilitySerializer, MaterialSerializer
from django.http import JsonResponse


# ViewSets for browsing (no authentication required)
class LibraryViewSet(viewsets.ReadOnlyModelViewSet):

    """
    API endpoint for listing libraries.
    No authentication required for read-only access.
    """

    queryset = Library.objects.all()
    serializer_class = LibrarySerializer
    permission_classes = [permissions.AllowAny]



class FloorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing floors.
    No authentication required for read-only access.
    """
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Floor.objects.all()
        library_id = self.request.query_params.get('library', None)
        if library_id is not None:
            queryset = queryset.filter(library_id=library_id)
        return queryset


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing rooms.
    No authentication required for read-only access.
    """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'room_id' # lookups now by room_id , not pk
    
    def get_queryset(self):
        queryset = Room.objects.all()
        user = self.request.user

        floor_id = self.request.query_params.get('floor', None)
        if floor_id is not None:
            queryset = queryset.filter(floor_id=floor_id)

        status = self.request.query_params.get('status', None)
        if status is not None:
            queryset = queryset.filter(status=status)

        if not user.groups.filter(name='Graduate Students').exists():
            queryset = queryset.filter(is_graduate_only=False)

        return queryset


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_room_availability(request, room_id):
    """
    Check room availability for a specific date.
    No authentication required to check availability.
    """
    room = get_object_or_404(Room, room_id=room_id)
    date_param = request.query_params.get('date', None)
    
    if date_param:
        try:
            date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        date = timezone.now().date()
    
    # Get the start and end of the day
    start_datetime = timezone.make_aware(datetime.combine(date, datetime.min.time()))
    end_datetime = timezone.make_aware(datetime.combine(date, datetime.max.time()))
    
    # Get reservations for this room on this date
    reservations = Reservation.objects.filter(
        room=room,
        start_time__date=date,
        status__in=['pending', 'confirmed']
    ).order_by('start_time')
    
    serializer = ReservationSerializer(reservations, many=True)
    
    # Check if room is available (status is 'available')
    is_available = room.status == 'available'
    
    return Response({
        "room": room.room_id,
        "date": date,
        "is_available": is_available,
        "reservations": serializer.data
    })


# Reservation management (requires authentication)
class ReservationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing reservations.
    Authentication required for creating/managing reservations.
    """
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Regular users see only their own reservations
        if not self.request.user.is_staff:
            return Reservation.objects.filter(user=self.request.user)
        # Staff can see all reservations
        return Reservation.objects.all()
    
    # modified by Dylan to support room permissions
    def perform_create( self, serializer ):
        room = Room.objects.get( pk=serializer.validated_data['room'].pk )

        # set default status based on room properties
        initial_status = 'pending' if room.requires_admin_approval else 'confirmed'

        # publish the newly created reservation and its status
        serializer.save( user=self.request.user, status=initial_status )

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # check if room is provided as a string room_id
        if 'room' in data and isinstance(data['room'], str) and not data['room'].isdigit():
            try:
                # find room by room_id
                room = Room.objects.get( room_id=data['room'] )
                user_is_grad = self.request.user.groups.filter(name='Graduate Students').exists()
                data['room'] = room.pk  # replace with actual primary key

                if room.is_graduate_only and not user_is_grad:
                    return Response(
                        {"error": "This room is available only to graduate students."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Room.DoesNotExist:
                return Response(
                    {"error": f"Room with ID '{data['room']}' not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class MaterialViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MaterialSerializer
    queryset = Material.objects.all() 
    def get_queryset(self):
        library_id = self.kwargs.get('library_id')
        return Material.objects.filter(library_id=library_id)


def demo_view(request):
    # get counts of each model
    libraries = Library.objects.all()
    library_count = libraries.count()
    floor_count = Floor.objects.count()
    room_count = Room.objects.count()
    reservation_count = Reservation.objects.count()
    
    # get sample data
    sample_rooms = []
    for library in libraries:
        for floor in library.floors.all():
            for room in floor.rooms.all()[:3]:  # up to 3 rooms per floor
                room_data = {
                    "id": room.room_id,
                    "location": f"{library.name}, Floor {floor.number}",
                    "capacity": room.capacity,
                    "status": room.status,
                    "has_whiteboard": room.has_whiteboard,
                    "reservations": room.reservations.count()
                }
                sample_rooms.append(room_data)
    
    # return JSON response
    return JsonResponse({
        "model_counts": {
            "libraries": library_count,
            "floors": floor_count,
            "rooms": room_count,
            "reservations": reservation_count
        },
        "sample_rooms": sample_rooms
    })

# Update room_detail view to support lookup by old or new format
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def room_detail(request, room_id):
    """
    Get detailed information about a specific room by its room_id.
    Supports both old and new format room IDs for backward compatibility.
    """
    try:
        room = Room.objects.get(room_id=room_id)
        serializer = RoomSerializer(room)
        return Response(serializer.data)
    except Room.DoesNotExist:
        # Debug: Print all available room_ids to help diagnose
        all_room_ids = Room.objects.values_list('room_id', flat=True)
        print(f"Available room_ids: {list(all_room_ids)}")
        
        return Response(
            {"error": f"Room with ID '{room_id}' not found"},
            status=status.HTTP_404_NOT_FOUND
        )
