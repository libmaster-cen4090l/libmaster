# Author(s): Dylan Connolly
# Purpose: Viewing data in JSON format for testing purposes
# Modified: 2/25/2025 @ 10:19:44 EST

# rooms/urls.py
from django.urls import path
from . import api_views

urlpatterns = [
    path('demo/', api_views.demo_view, name='demo'),
]
