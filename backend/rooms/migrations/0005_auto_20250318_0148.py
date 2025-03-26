from django.db import migrations

def create_graduate_students_group(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.get_or_create(name='Graduate Students')

class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0004_alter_room_options_room_is_graduate_only_and_more'),
        ('auth', '0012_alter_user_first_name_max_length'),  # Django's default auth migration dependency
    ]

    operations = [
        migrations.RunPython(create_graduate_students_group),
    ]