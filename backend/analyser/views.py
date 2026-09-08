import os
import tempfile
import numpy as np
import pandas as pd

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from src.data_loader import load_csv
from src.analysis_pipeline import AnalysisPipeline

# Create your views here.

def health_check(request):
  return JsonResponse({
    "status": "success",
    "message": "Backend is running"
  })


def make_json_serializable(data):
  if isinstance(data, pd.DataFrame):
    return {
      str(key): make_json_serializable(value)
      for key, value in data.to_dict().items()
    }

  if isinstance(data, pd.Series):
    return {
      str(key): make_json_serializable(value)
      for key, value in data.to_dict().items()
    }

  if isinstance(data, dict):
    return {
      str(key): make_json_serializable(value)
      for key, value in data.items()
    }

  if isinstance(data, (list, tuple)):
    return [
      make_json_serializable(value)
      for value in data
    ]

  if isinstance(data, np.integer):
    return int(data)

  if isinstance(data, np.floating):
    if np.isnan(data):
      return None
    return float(data)

  if isinstance(data, np.bool_):
    return bool(data)

  if pd.isna(data):
    return None
  
  return data





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
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as temp_file:
      for chunk in uploaded_file.chunks():
        temp_file.write(chunk)
      temp_file_path = temp_file.name

    df = load_csv(temp_file_path)
    pipeline = AnalysisPipeline(df)
    results = pipeline.run()
    results = make_json_serializable(results)

    return JsonResponse({
      "status": "success",
      "filename": uploaded_file.name,
      "analysis": results
    })

  except Exception as e:
    return JsonResponse({
      "status": "error",
      "message": str(e)
    }, status=500)

  finally:
    if "temp_file_path" in locals() and os.path.exists(temp_file_path):
      os.remove(temp_file_path)