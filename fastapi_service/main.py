from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi_service.schemas import AnaLysisResponse


import os
import tempfile

import numpy as np
import pandas as pd

from src.data_loader import load_csv
from src.analysis_pipeline import AnalysisPipeline
from src.serialization import make_json_serializable

app = FastAPI()

@app.get("/health")
def health_check():
  return {
    "status": "success",
    "message": "FastAPI service is running"
  }


@app.post("/analyze/", response_model=AnaLysisResponse)
async def analyze_dataset(file: UploadFile = File(...)):
  if not file.filename.lower().endswith(".csv"):
    raise HTTPException(
      status_code=400,
      detail="Only csv files are allowed."
    )

  temp_file_path = None

  try:
    with tempfile.NamedTemporaryFile(
      delete=False,
      suffix=".csv"
    ) as temp_file:
      while chunk := await file.read(1024 * 1024):
        temp_file.write(chunk)

      temp_file_path = temp_file.name

    df = load_csv(temp_file_path)
    pipeline = AnalysisPipeline(df)
    results = pipeline.run()
    json_results = make_json_serializable(results)
    return{
      "status": "success",
      "filename": file.filename,
      "analysis": json_results  
    }
  except (FileNotFoundError, ValueError) as e:
    raise HTTPException(
      status_code=400,
      detail=str(e)
    )

  except Exception:
    raise HTTPException(
      status_code=500,
      detail="Unable to process the uploaded CSV file."
    )

  finally:
    if temp_file_path and os.path.exists(temp_file_path):
      os.remove(temp_file_path)