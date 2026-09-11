from django.urls import path
from .views import health_check, analyze_dataset, visualize_dataset

urlpatterns = [
  path("health/", health_check),
  path("analyze/", analyze_dataset),
  path("visualize/", visualize_dataset),
]