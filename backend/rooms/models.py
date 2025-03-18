# Author(s): Dylan Connolly and Colby Leavitt
# Purpose: Define the models for Library, Floor, Room, Reservation, Material
# Modified: 2/28/2025 @ 9:20 PM EST

# backend/rooms/models.py
# Enhanced Room model with comprehensive ID system

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.text import slugify
import uuid
import re


class Library(models.Model):
    """Model representing a physical library building on campus."""
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    opening_time = models.TimeField()
    closing_time = models.TimeField()

    # New field for standardized library code that's used in room IDs
    code = models.CharField(
        max_length=10,
        unique=True,
        blank=True,
        help_text="Unique code for the library used in room IDs (e.g., 'STROZ', 'DIRAC')"
    )

    class Meta:
        verbose_name_plural = "Libraries"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-generate library code from name if not provided
        if not self.code and self.name:
            # Create a code from the library name
            # Take the first letter plus up to four more consonants, all uppercase
            name = self.name.upper()
            consonants = ''.join([c for c in name if c.isalpha() and c.upper() not in 'AEIOU'])
            vowels = ''.join([c for c in name if c.isalpha() and c.upper() in 'AEIOU'])

            # Start with first character, then add consonants, then vowels if needed
            code = name[0]

            # Add consonants (up to 3 more)
            if len(consonants) > 1:
                code += consonants[1:min(4, len(consonants))]

            # If code is still less than 3 chars, add vowels
            if len(code) < 3 and vowels:
                code += vowels[:3-len(code)]

            # If STILL too short, just use first 4 letters of name
            if len(code) < 3 and len(name) >= 3:
                code = name[:4]

            # Ensure code is between 3-10 characters
            code = code[:10]

            # Check if this code already exists
            counter = 0
            temp_code = code
            while Library.objects.filter(code=temp_code).exists():
                counter += 1
                suffix = str(counter)
                # Truncate code if necessary to make room for the numeric suffix
                prefix = code[:10-len(suffix)]
                temp_code = f"{prefix}{suffix}"

            self.code = temp_code

        super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        # Validate library code format
        if self.code:
            if not re.match(r'^[A-Z][A-Z0-9]{2,9}$', self.code):
                raise ValidationError({
                    'code': "Library code must start with a letter and contain 3-10 uppercase letters and numbers."
                })


class Floor(models.Model):
    """Model representing a floor within a library."""
    library = models.ForeignKey(Library, on_delete=models.CASCADE, related_name="floors")
    number = models.IntegerField()
    description = models.TextField(blank=True)
    floor_map = models.JSONField(
        blank=True,
        null=True,
        help_text="JSON representation of the floor layout"
    )

    class Meta:
        ordering = ["library", "number"]
        unique_together = ["library", "number"]

    def __str__(self):
        return f"{self.library.name} - Floor {self.number}"

    @property
    def floor_code(self):
        """
        Generate a standard floor code (e.g., 'F1', 'B1' for basement)
        This is used as part of room identifiers
        """
        if self.number < 0:
            return f"B{abs(self.number)}"  # Basement floors
        return f"F{self.number}"


class Room(models.Model):
    """
    Model representing a reserve-able study room.

    Room IDs follow the format: LIBCODE-FLOORCODE-ROOMNUM
    Examples:
    - STROZ-F1-101 (Strozier Library, Floor 1, Room 101)
    - DIRAC-F3-A5 (Dirac Library, Floor 3, Room A5)
    - SCI-B1-15 (Science Library, Basement 1, Room 15)
    """

    # The unique room identifier is now auto-generated based on library, floor and room number
    room_id = models.CharField(
        max_length=30,
        unique=True,
        help_text="Unique room identifier (auto-generated, e.g., 'STROZ-F1-101')"
    )

    # The actual room number as displayed on the door (can be alphanumeric)
    room_number = models.CharField(
        max_length=10,
        help_text="Room number as displayed on the door (e.g., '101', 'A5')"
    )

    # each room belongs to a specific floor
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="rooms")
    capacity = models.IntegerField(help_text="Maximum number of people allowed")
    is_graduate_only = models.BooleanField(default=False)

    # Room amenities
    has_whiteboard = models.BooleanField(default=False)
    has_monitor = models.BooleanField(default=False)
    has_window = models.BooleanField(default=False)

    # for interactive floor map (define positions, width, height)
    position_x = models.FloatField(null=True, blank=True, help_text="X coordinate on floor map")
    position_y = models.FloatField(null=True, blank=True, help_text="Y coordinate on floor map")
    width = models.FloatField(null=True, blank=True, help_text="Width on floor map")
    height = models.FloatField(null=True, blank=True, help_text="Height on floor map")

    # list of pair-tuples, choices limit the possible values for this field
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('maintenance', 'Under Maintenance'),
        ('closed', 'Closed')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    class Meta:
        ordering = ["floor__library", "floor__number", "room_number"]
        # Ensure each room number is unique per floor
        unique_together = ["floor", "room_number"]

    def __str__(self):
        return f"{self.room_id} ({self.floor.library.name})"

    def save(self, *args, **kwargs):
        # Auto-generate room_id if not provided
        if not self.room_id and self.floor and self.room_number:
            library_code = self.floor.library.code
            floor_code = self.floor.floor_code
            self.room_id = f"{library_code}-{floor_code}-{self.room_number}"

        super().save(*args, **kwargs)

    def clean(self):
        """Validate room data and room_id format"""
        super().clean()

        if not self.room_number:
            raise ValidationError({
                'room_number': "Room number is required."
            })

        # Validate room number format (allows alphanumeric with some special chars)
        if not re.match(r'^[A-Za-z0-9][A-Za-z0-9\-]{0,8}[A-Za-z0-9]$', self.room_number):
            raise ValidationError({
                'room_number': "Room number must be 1-10 alphanumeric characters and may include hyphens."
            })

        # If room_id is manually provided, validate its format
        if self.room_id and self.floor:
            expected_prefix = f"{self.floor.library.code}-{self.floor.floor_code}-"
            if not self.room_id.startswith(expected_prefix):
                raise ValidationError({
                    'room_id': f"Room ID must follow the format '{expected_prefix}ROOMNUM'."
                })

    def is_available(self, start_time, end_time):
        """ Check if room is available during the specified time period. """
        if 'available' != self.status:
            return False

        # check for conflicting reservations
        conflicting_reservations = self.reservations.filter(
            models.Q(start_time__lt=end_time) & models.Q(end_time__gt=start_time),
            status__in=['confirmed', 'pending']
        ).exists()

        return not conflicting_reservations

    @property
    def library(self):
        """Convenience property to access the library directly"""
        return self.floor.library

    @property
    def display_name(self):
        """User-friendly room display name"""
        return f"{self.floor.library.name} {self.room_number}"

    @property
    def location_description(self):
        """Detailed location description"""
        return f"{self.floor.library.name}, Floor {self.floor.number}, Room {self.room_number}"


class Reservation(models.Model):
    """ Model representing a room reservation. """
    # UUIDField uses universally unique identifiers instead of auto-incrementing numbers
    reservation_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # link to Django's built-in User model (the person making the reservation
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations")

    # link to our Room model (which room is being reserved)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="reservations")

    # DateTimeField stores both date and time information
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    # auto_now_add sets the field to the current time when the object is first created
    created_at = models.DateTimeField(auto_now_add=True)

    # auto_now updates the field to current time whenever the object is SAVED
    modified_at = models.DateTimeField(auto_now=True)

    # list of pair-tuples for reservation status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # additional fields for reservations
    purpose = models.CharField(
        max_length=255,
        blank=True,
        help_text="Brief description of the reservation purpose"
    )
    num_attendees = models.IntegerField(default=1)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_time"]  # newest reservations first
        # database-level constraint ensures end time is after start time
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='check_end_time_after_start_time'
            )
        ]

    def __str__(self):
        start = self.start_time.strftime('%Y-%m-%d %H:%M')
        end = self.end_time.strftime('%H:%M')
        return f"{self.room.room_id} - {start} to {end}"

    def clean(self):
        """ Validate reservation times and availability. """
        # ensure start_time is in the future
        if self.start_time and self.start_time < timezone.now():
            raise ValidationError("Reservation start time must be in the future.")

        # ensure end_time is after start_time
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError("Reservation end time must be after start time.")

        # check room availability if this is a new reservation, or
        # status is changing to confirmed
        if self._state.adding or self.status == 'confirmed':
            # Check for conflicting reservations
            conflicting_reservations = Reservation.objects.filter(
                room=self.room,
                status='confirmed',  # Only check against confirmed reservations
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            )

            # if this is an existing reservation
            if self.pk:
                conflicting_reservations = conflicting_reservations.exclude(pk=self.pk)

            if conflicting_reservations.exists():
                raise ValidationError("This room is already reserved during the selected time period.")

        # check if the room status allows reservations
        if 'available' != self.room.status:
            raise ValidationError("This room is not available for reservations at this time.")

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

    @property
    def duration_minutes(self):
        """Calculate the duration of the reservation in minutes"""
        if not self.start_time or not self.end_time:
            return 0
        delta = self.end_time - self.start_time
        return delta.total_seconds() // 60

    @property
    def is_active(self):
        """Determine if the reservation is currently active"""
        now = timezone.now()
        return (
            self.status in ['confirmed', 'pending'] and
            self.start_time <= now and
            self.end_time > now
        )

    @property
    def is_upcoming(self):
        """Determine if the reservation is upcoming (not started yet)"""
        now = timezone.now()
        return self.status in ['confirmed', 'pending'] and self.start_time > now


class Material(models.Model):
    """A model representing a material that can be rented from the library"""
    MATERIAL_TYPES = [
        ("calculator", "Calculator"),
        ("markers", "Markers"),
        ("phone_charger", "Phone Charger"),
    ]

    id = models.AutoField(primary_key=True)  # Unique identifier
    name = models.CharField(max_length=50, choices=MATERIAL_TYPES)
    library = models.ForeignKey(Library, on_delete=models.CASCADE, related_name="materials")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_name_display()} - {self.library.name}"
