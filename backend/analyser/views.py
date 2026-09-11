import httpx

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt



def health_check(request):
  return JsonResponse({
    "status": "success",
    "message": "Backend is running"
  })


@csrf_exempt
def analyze_dataset(request):
  if request.method != 'POST':
    return JsonResponse({
      "status": "error",
      "message": "Only POSTS requests are allowed"
    }, status = 405)

  if "file" not in request.FILES:
    return JsonResponse({
      "status": "error",
      "message": "no file was uploaded"
    }, status = 400)

  uploaded_file = request.FILES["file"]

  if not uploaded_file.name.lower().endswith(".csv"):
    return JsonResponse({
      "status": "error",
      "message": "Only csv files are allowed"
    }, status = 400)

  try:
    response = httpx.post(
      "http://127.0.0.1:8001/analyze/",
      files = {
        "file": (
          uploaded_file.name,
          uploaded_file.file,
          uploaded_file.content_type
        )
      },
      timeout=120.0
    )

    return JsonResponse(
      response.json(),
      status=response.status_code
    )

  except httpx.RequestError:
    return JsonResponse({
      "status": "error",
      "message": "Analysis service is unavailable."
    }, status=503)


@csrf_exempt
def visualize_dataset(request):
  if request.method != 'POST':
    return JsonResponse({
      "status": "error",
      "message": "Only POST requests are allowed"
    }, status=405)

  try:
    import json
    data = json.loads(request.body)
  except Exception:
    return JsonResponse({
      "status": "error",
      "message": "Invalid JSON payload."
    }, status=400)

  try:
    response = httpx.post(
      "http://127.0.0.1:8001/visualize/",
      json=data,
      timeout=60.0
    )

    return JsonResponse(
      response.json(),
      status=response.status_code
    )

  except httpx.RequestError:
    return JsonResponse({
      "status": "error",
      "message": "Visualization service is unavailable."
    }, status=503)

