# Author(s): Dylan Connolly
# Purpose: Define the models for Library, Floor, Room, Reservation
# Modified: 2/25/2025 @ 8:24:29 PM EST

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid

class Library( models.Model ):
    """Model representing a physical library building on campus."""
    # CharField is for text fields with a maximum length
    name = models.CharField( max_length=100 )
    location = models.CharField( max_length=255 )

    # blank=True means the field is optional in forms
    description = models.TextField( blank=True )

    # TimeField stores the time of day (without date)
    opening_time = models.TimeField()
    closing_time = models.TimeField()

    class Meta:
        # Meta class configures model-wide behaviors
        # controls how Django refers to multiple libraries in the admin
        verbose_name_plural = "Libraries"
        # default ordering when querying this model
        ordering = [ "name" ]

    def __str__( self ):
        # determines how the object appears as a string
        return self.name

class Floor( models.Model ):
    """Model representing a floor within a library."""
    # ForeignKey creats a many-to-one relationship
    # one library has many floors, so the Floor model has the ForeignKey
    # on_delete=models.CASCADE means if a library is deleted, its floors are also deleted
    # related_name creates a reverse access from Library to its floors
    library = models.ForeignKey( Library, on_delete=models.CASCADE, related_name="floors" )
    number = models.IntegerField()
    description = models.TextField( blank=True )
    # JSONField stores structured data as JSON
    # useful for flexible data like floor layout that might vary between floors
    floor_map = models.JSONField( blank=True, null=True, 
                                 help_text="JSON representation of the floor layout" )

    class Meta:
        ordering = [ "library", "number" ]
        # unique_together ensures a library can't have duplicate floor numbers
        unique_together = [ "library", "number" ]

    def __str__( self ):
        return f"{self.library.name} - Floor {self.number}"

class Room( models.Model ):
    """ Model representing a reserve-able study room. """
    room_id = models.CharField( max_length=20, unique=True, 
                               help_text="Unique room identifier (e.g., 'STR101')" )
    # each room belongs to a specific floor
    floor = models.ForeignKey( Floor, on_delete=models.CASCADE, related_name="rooms" )
    capacity = models.IntegerField( help_text="Maximum number of people allowed" )
    # BooleanField stores True/False values
    has_whiteboard = models.BooleanField( default=False )
    has_monitor = models.BooleanField( default=False )
    has_window = models.BooleanField( default=False )

    # for interactive floor map (define positions, width, height)
    position_x = models.FloatField( null=True, blank=True, help_text="X coordinate on floor map" )
    position_y = models.FloatField( null=True, blank=True, help_text="Y coordinate on floor map" )
    width = models.FloatField( null=True, blank=True, help_text="Width on floor map" )
    height = models.FloatField( null=True, blank=True, help_text="Height on floor map" )

    # list of pair-tuples, choices limit the possible values for this field
    # first item in tuple is the actual value stored, second is the human-readable name
    STATUS_CHOICES = [
        ( 'available', 'Available' ),
        ( 'maintenance', 'Under Maintenance' ),
        ( 'closed', 'Closed' )
    ]
    status = models.CharField( max_length=20, choices=STATUS_CHOICES, default='available' )

    class Meta:
        ordering = [ "room_id" ]

    def __str__( self ):
        return f"{self.room_id} ({self.floor.library.name})"

    def is_available( self, start_time, end_time ):
        """ Check if room is available during the specified time period. """
        if 'available' != self.status:
            return False

        # check for conflicting reservations 
        # ( self.reservations attribute is attained via a reverse-lookup in Reservations class )
        # models.Q objects allow for complex queries ( think SQL )
        conflicting_reservations = self.reservations.filter(
            models.Q( start_time__lt=end_time ) & models.Q( end_time__gt=start_time ),
            status__in=[ 'confirmed', 'pending' ]
        ).exists()

        return not conflicting_reservations

class Reservation( models.Model ):
    """ Model representing a room reservation. """
    # UUIDField uses universally unique identifiers instead of auto-incrementing numbers
    # more secure for public-facing ids, harder to guess/enumerate
    reservation_id = models.UUIDField( primary_key=True, default=uuid.uuid4, editable=False )
    
    # link to Django's built-in User model (the person making the reservation
    user = models.ForeignKey( User, on_delete=models.CASCADE, related_name="reservations" )

    # link to our Room model (which room is being reserved)
    room = models.ForeignKey( Room, on_delete=models.CASCADE, related_name="reservations" )

    # DateTimeField stores both date and time information
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    # auto_now_add sets the field to the current time when the object is first created
    created_at = models.DateTimeField( auto_now_add=True )

    # auto_now updates the field to current time whenever the object is SAVED
    modified_at = models.DateTimeField( auto_now=True )
    
    # list of pair-tuples for reservation status
    STATUS_CHOICES = [
        ( 'pending', 'Pending' ),
        ( 'confirmed', 'Confirmed' ),
        ( 'cancelled', 'Cancelled' ),
        ( 'completed', 'Completed' )
    ]
    status = models.CharField( max_length=20, choices=STATUS_CHOICES, default='pending' )

    # additional fields for reservations
    purpose = models.CharField( max_length=255, blank=True,
                               help_text="Brief description of the reservation purpose" )
    num_attendees = models.IntegerField( default=1 )
    notes = models.TextField( blank=True )

    class Meta:
        ordering = [ "-start_time" ] # newest reservations first ( note the - sign )
        # database-level constraint ensures end time is after start time
        # this is enforced even if someone bypasses Python validation
        constraints = [
            models.CheckConstraint(
                check=models.Q( end_time__gt=models.F( 'start_time' ) ),
                name='check_end_time_after_start_time'
            )
        ]

    def __str__( self ):
        srt = self.start_time.strftime( '%Y-%m-%d %H:%M' )
        end = self.end_time.strftime( '%H:%M' )
        return f"{self.room.room_id} - {srt} to {end}"

    def clean( self ):
        """ Validate reservation times and availability. """
        # ensure start_time is in the future
        if self.start_time and self.start_time < timezone.now():
            raise ValidationError( "Reservation start time must be in the future." )

        # ensure end_time is after start_time
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError( "Reservation end time must be after start time." )

        # check room availability if this is a new reservation, or 
        # status is changing to confirmed
            # MODIFIED CONDITION: This will catch both new and existing confirmed reservations
        if self._state.adding or self.status == 'confirmed':
        # Check for conflicting reservations
            conflicting_reservations = Reservation.objects.filter(
                room=self.room,
                status='confirmed',             # Only check against confirmed reservations
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            )

            # if this is an existing reservation
            if self.pk:
                conflicting_reservations = conflicting_reservations.exclude( pk=self.pk )

            if conflicting_reservations.exists():
                raise ValidationError( "This room is already reserved during the selected time period." )

        # now, check if the room status allows reservations
        if 'available' != self.room.status:
            raise ValidationError( "This room is not available for reservations at this time." )

        # check if reservation is within library's opening hours
        library = self.room.floor.library
        start_time_hour = self.start_time.time()
        end_time_hour = self.end_time.time()

        if start_time_hour < library.opening_time or end_time_hour > library.closing_time:
            raise ValidationError(
                f"Reservations must be within library hours ({library.opening_time} - {library.closing_time})."
            )
        
        # check if number of attendees exceeds room capacity
        if self.num_attendees > self.room.capacity:
            raise ValidationError(
                f"Number of attendees exceeds maximum room capacity ({self.room.capacity})."
            )
