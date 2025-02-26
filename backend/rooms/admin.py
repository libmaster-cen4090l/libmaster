# Author(s): Dylan Connolly
# Purpose: Define the Administration interface
# Modified: 2/25/2025 @ 9:15:19 PM EST

from django.contrib import admin
from .models import Library, Floor, Room, Reservation

"""
Django's admin interface provides a built-in way to manage our application data
It automatically creates UI for viewing, adding, editing, and deleting records
The configuration below customizes how each model appears in the admin interface
"""

@admin.register( Library ) # this decorator registers the model with the admin site
class LibraryAdmin( admin.ModelAdmin ):
    # controls which fields appear as columns in the list view
    list_display = ( 'name', 'location', 'opening_time', 'closing_time' )

    # enables the search box to find libraries by these fields
    search_fields = ( 'name', 'location' )

    # with this config, admins can easily see library hours and search by name

@admin.register( Floor )
class FloorAdmin( admin.ModelAdmin ):
    # these fields will show as columns in the floors list
    list_display = ( 'library', 'number', 'description' )
    list_filter = ( 'library', )
    search_fields = ( 'library__name', 'number', 'description' )

@admin.register( Room )
class RoomAdmin( admin.ModelAdmin ):
    # shows these fields in the rooms list
    list_display = ( 'room_id', 'floor', 'capacity', 'status' )

    # multiple filters to help admins find rooms with specific criteria
    # the floor__library lets adminds filter rooms by their library
    list_filter = ( 'floor__library', 'floor', 'status', 'has_whiteboard', 'has_monitor' )

    # search functionality for finding specific rooms
    search_fields = ( 'room_id', 'floor__library__name' )

    # fieldsets organize the add/edit form into logical secitons
    # each tuple has a section name and a dictionary of options
    fieldsets = (
        # basic room information (None indicates this section has no heading)
        ( None, {
            'fields': ( 'room_id', 'floor', 'capacity', 'status' )
        }),
        # group all amenity fields together
        ( 'Amenities', {
            'fields': ( 'has_whiteboard', 'has_monitor', 'has_window' )
        }),
        # floor map coordinates in a collapsible section to save space
        # 'collapse' means this section starts folded up
        ( 'Map Position', {
            'classes': ( 'collapse', ),
            'fields': ( 'position_x', 'position_y', 'width', 'height' )
        }),
    )

@admin.register( Reservation )
class ReservationAdmin( admin.ModelAdmin ):
    # essential reservation info shown in the list view
    list_display = ( 'reservation_id', 'user', 'room', 'start_time', 'end_time', 'status' )

    # filters to help admins find reservations (by status, library, and date)
    list_filter = ( 'status', 'room__floor__library', 'start_time' )

    # search by username or room ID
    search_fields = ( 'user__username', 'room__room_id' )

    # fields that cannot be edited by admins (these are to be system generated)
    # this prevents accidental changes to important identification fields
    readonly_fields = ( 'reservation_id', 'created_at', 'modified_at' )

    # organize the reservation form into logical sections
    fieldsets = (
        # core reservation details
        ( None, {
            'fields': ( 'reservation_id', 'user', 'room', 'status' )
        }),
        # time period information grouped together
        ( 'Reservation Time', {
            'fields': ( 'start_time', 'end_time' )
        }),
        # additional information about the reservation
        ( 'Details', {
            'fields': ( 'purpose', 'num_attendees', 'notes' )
        }),
        # system tracking fields into a collapsible section
        ( 'Metadata', {
            'classes': ( 'collapse', ),
            'fields': ( 'created_at', 'modified_at' )
        }),
    )

