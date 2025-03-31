# Author(s): Dylan Connolly and Colby Leavitt
# Purpose: Define the Administration interface
# Modified: 2/28/2025 @ 9:21:19 PM EST
from django.contrib import admin
from .models import Library, Floor, Room, Reservation, Material

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
    # Update the list_display to include room_number and administrator approval
    list_display = ('room_id', 'room_number', 'floor', 'capacity', 'is_graduate_only', 'requires_admin_approval', 'status')

    # Add filters for the new fields
    list_filter = ('floor__library', 'floor', 'is_graduate_only', 'requires_admin_approval', 'status', 'has_whiteboard', 'has_monitor')

    # Search by both room_id and room_number
    search_fields = ('room_id', 'room_number', 'floor__library__name')

    # Update fieldsets to include room_number in the appropriate section
    fieldsets = (
        # Basic room information section - ADD room_number here
        (None, {
            'fields': ('room_number', 'floor', 'capacity', 'is_graduate_only', 'requires_admin_approval', 'status')
        }),
        # Amenities section
        ('Amenities', {
            'fields': ('has_whiteboard', 'has_monitor', 'has_window')
        }),
        # Map position section
        ('Map Position', {
            'classes': ('collapse',),
            'fields': ('position_x', 'position_y', 'width', 'height')
        }),
    )
    
    # Make room_id read-only since it's auto-generated
    readonly_fields = ('room_id',)
    
    # If you want to show room_id in the form (as read-only)
    # Add this to the first fieldset:
    # 'fields': ('room_id', 'room_number', 'floor', 'capacity', 'status')

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

    # for more pragmatic handling of reservations in rooms req. admin approval
    def get_queryset( self, request ):
        queryset = super().get_queryset( request )
        # exclude pending reservations that require admin approval,
        #  as these are handled by PendingReservationsAdmin
        return queryset.exclude(
                status='pending',
                room__requires_admin_approval = True
        )

# proxy model for interfacing PendingReservationsAdmin with Reservation model
# docs: https://docs.djangoproject.com/en/5.1/topics/db/models/#proxy-models
class PendingReservation( Reservation ):
    class Meta:
        proxy = True
        verbose_name = "Pending Reservation"
        verbose_name_plural = "Pending Reservations"

# Author: Dylan Connolly
# Allows a smoother workflow for library administrators.
# displays reservations pending their approval, facilitates easy processing
@admin.register( PendingReservation )
class PendingReservationsAdmin( admin.ModelAdmin ):
    list_display = ( 'reservation_id', 'user', 'room', 'start_time', 'end_time', 'created_at' )
    list_filter = ( 'room__floor__library', 'room__floor', 'start_time' )
    search_fields = ( 'user__username', 'room__room_id' )
    actions = ['approve_reservations', 'deny_reservations']

    def get_queryset( self, request ):
        return Reservation.objects.filter(
                status='pending',
                room__requires_admin_approval=True
        )

    def approve_reservations( self, request, queryset ):
        updated = queryset.update( status='confirmed' )
        self.message_user( request, f"{updated} reservations have been approved." )
    approve_reservations.short_description = "Approve selected reservations"

    def deny_reservations( self, request, queryset ):
        updated = queryset.update( status='cancelled' )
        self.message_user( request, f"{updated} reservations have been denied." )
    deny_reservations.short_description = "Deny selected reservations"

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    """Manages materials in admin"""
    list_display = ("id", "name", "library", "created_at") 
    list_filter = ("library", "name")  
    search_fields = ("id", "name", "library__name")  
    ordering = ("library", "name")
