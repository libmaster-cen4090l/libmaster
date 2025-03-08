from django.db import migrations, models
import re

def populate_library_codes(apps, schema_editor):
    """
    Generate standardized library codes for all existing libraries.
    These codes will be used in the room_id format.
    """
    Library = apps.get_model('rooms', 'Library')
    
    # Process each library
    for library in Library.objects.all():
        if not library.code:
            # Create a code from the library name
            name = library.name.upper()
            
            # Extract consonants and vowels for potential use in code generation
            consonants = ''.join([c for c in name if c.isalpha() and c.upper() not in 'AEIOU'])
            vowels = ''.join([c for c in name if c.isalpha() and c.upper() in 'AEIOU'])
            
            # Start with first character, then add consonants, then vowels if needed
            code = name[0] if name else ''
            
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
            
            library.code = temp_code
            library.save()
            
            print(f"Library '{library.name}' assigned code: {library.code}")


def extract_room_numbers_and_update_ids(apps, schema_editor):
    """
    Extract room numbers from existing room_ids and update room_ids 
    to follow the new format: LIBCODE-FLOORCODE-ROOMNUM
    """
    Room = apps.get_model('rooms', 'Room')
    Floor = apps.get_model('rooms', 'Floor')
    Library = apps.get_model('rooms', 'Library')
    
    # Track which rooms were updated for logging
    updated_rooms = 0
    failed_rooms = 0
    
    for room in Room.objects.all():
        try:
            # Save original room_id for reference
            original_room_id = room.room_id
            
            # Extract room number from existing room_id using various patterns
            room_number = None
            
            # Try to extract patterns like "STR101" → "101"
            match = re.search(r'[A-Za-z]+(\d+[A-Za-z0-9-]*)', original_room_id)
            if match:
                room_number = match.group(1)
            else:
                # If no clear number pattern, just use the last 5 chars max
                room_number = original_room_id[-5:] if len(original_room_id) > 5 else original_room_id
            
            # Clean up room number (remove any leading/trailing non-alphanumeric chars)
            room_number = re.sub(r'^[^A-Za-z0-9]+|[^A-Za-z0-9]+$', '', room_number)
            
            # Ensure room_number is not empty
            if not room_number:
                room_number = original_room_id
            
            # Set the extracted room number
            room.room_number = room_number
            
            # Generate the new room_id using the standardized format
            floor = room.floor
            library = floor.library
            
            # Generate floor code (F1, F2, B1 for basement, etc.)
            floor_code = f"B{abs(floor.number)}" if floor.number < 0 else f"F{floor.number}"
            
            # Construct the new room_id
            new_room_id = f"{library.code}-{floor_code}-{room_number}"
            
            # Update the room
            room.room_id = new_room_id
            room.save()
            
            print(f"Updated room: {original_room_id} → {new_room_id}")
            updated_rooms += 1
            
        except Exception as e:
            print(f"Error updating room {room.room_id}: {str(e)}")
            failed_rooms += 1
    
    print(f"Migration complete. Updated {updated_rooms} rooms. Failed: {failed_rooms}")


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0002_material'),  # Update this to your latest migration
    ]

    operations = [
        # 1. Add library code field
        migrations.AddField(
            model_name='library',
            name='code',
            field=models.CharField(
                blank=True,
                help_text="Unique code for the library used in room IDs (e.g., 'STROZ', 'DIRAC')",
                max_length=10,
                unique=True,
                null=True,  # Allow null temporarily for migration
            ),
        ),
        
        # 2. Add room_number field
        migrations.AddField(
            model_name='room',
            name='room_number',
            field=models.CharField(
                max_length=10,
                help_text="Room number as displayed on the door (e.g., '101', 'A5')",
                null=True,  # Allow null temporarily for migration
            ),
        ),
        
        # 3. Add temporary field to store old room_id for reference (useful for debugging)
        migrations.AddField(
            model_name='room',
            name='old_room_id',
            field=models.CharField(max_length=30, null=True, blank=True),
        ),
        
        # 4. Run data migration to populate library codes
        migrations.RunPython(populate_library_codes),
        
        # 5. Run data migration to extract room numbers and update room_ids
        migrations.RunPython(extract_room_numbers_and_update_ids),
        
        # 6. Make fields required after migration
        migrations.AlterField(
            model_name='library',
            name='code',
            field=models.CharField(
                blank=True,
                help_text="Unique code for the library used in room IDs (e.g., 'STROZ', 'DIRAC')",
                max_length=10,
                unique=True,
            ),
        ),
        
        migrations.AlterField(
            model_name='room',
            name='room_number',
            field=models.CharField(
                max_length=10,
                help_text="Room number as displayed on the door (e.g., '101', 'A5')",
            ),
        ),
        
        # 7. Add unique constraint for floor/room_number combination
        migrations.AlterUniqueTogether(
            name='room',
            unique_together={('floor', 'room_number')},
        ),
        
        # 8. Remove temporary field
        migrations.RemoveField(
            model_name='room',
            name='old_room_id',
        ),
    ]
