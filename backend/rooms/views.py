from django.shortcuts import render
from django.http import JsonResponse
from .models import Library, Floor, Room, Reservation

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
