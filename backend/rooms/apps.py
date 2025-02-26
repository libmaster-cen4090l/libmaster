# Author(s): Dylan Connolly
# Purpose: Basic (default) app configuration file
# Modified: 2/25/2025 @ 9:34:58 EST

from django.apps import AppConfig

class RoomsConfig( AppConfig ):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rooms'
