import os
import tempfile
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi_service.schemas import (
  AnaLysisResponse,
  AnalysisResponse,
  VisualizationRequest,
  VisualizationResponse,
)
from src.analysis_pipeline import AnalysisPipeline
from src.data_loader import load_csv
from src.serialization import make_json_serializable
from src.visualization_analyzer import VisualizationAnalyzer

app = FastAPI(title="PRISM Data Science Service")


def resolve_dataset_path(filename: str) -> str:
  clean_name = filename.strip()
  if not clean_name:
    raise ValueError("Filename must not be empty.")

  # Check if exact path or relative path exists directly
  if os.path.exists(clean_name):
    return clean_name

  safe_basename = os.path.basename(clean_name)

  # Check workspace data/ directory
  data_candidate = os.path.join("data", safe_basename)
  if os.path.exists(data_candidate):
    return data_candidate

  # Check root workspace directory
  if os.path.exists(safe_basename):
    return safe_basename

  # Check system temp directory
  temp_candidate = os.path.join(tempfile.gettempdir(), safe_basename)
  if os.path.exists(temp_candidate):
    return temp_candidate

  raise FileNotFoundError(f"Dataset file '{clean_name}' not found.")


@app.get("/health")
@app.get("/health/")
def health_check():
  return {
    "status": "success",
    "message": "FastAPI service is running",
  }


@app.post("/analyze/", response_model=AnaLysisResponse)
@app.post("/analyze", response_model=AnaLysisResponse)
async def analyze_dataset(file: UploadFile = File(...)):
  if not file.filename.lower().endswith(".csv"):
    raise HTTPException(
      status_code=400,
      detail="Only csv files are allowed.",
    )

  temp_file_path = None

  try:
    with tempfile.NamedTemporaryFile(
      delete=False,
      suffix=".csv",
    ) as temp_file:
      while chunk := await file.read(1024 * 1024):
        temp_file.write(chunk)

      temp_file_path = temp_file.name

    df = load_csv(temp_file_path)
    pipeline = AnalysisPipeline(df)
    results = pipeline.run()
    json_results = make_json_serializable(results)
    return {
      "status": "success",
      "filename": file.filename,
      "analysis": json_results,
    }
  except (FileNotFoundError, ValueError) as e:
    raise HTTPException(
      status_code=400,
      detail=str(e),
    )
  except Exception:
    raise HTTPException(
      status_code=500,
      detail="Unable to process the uploaded CSV file.",
    )
  finally:
    if temp_file_path and os.path.exists(temp_file_path):
      os.remove(temp_file_path)


@app.post("/visualize/", response_model=VisualizationResponse)
@app.post("/visualize", response_model=VisualizationResponse)
async def generate_visualization(request: VisualizationRequest):
  # 1. Validate non-empty fields
  if not request.filename or not request.filename.strip():
    raise HTTPException(
      status_code=400,
      detail="Filename must not be empty.",
    )

  col_1 = request.column_1.strip() if request.column_1 else ""
  col_2 = request.column_2.strip() if request.column_2 else ""

  if not col_1 or not col_2:
    raise HTTPException(
      status_code=400,
      detail="Both column_1 and column_2 must be specified.",
    )

  # 2. Validate distinct columns
  if col_1 == col_2:
    raise HTTPException(
      status_code=400,
      detail="column_1 and column_2 must be different columns.",
    )

  # 3. Validate supported chart types
  chart_type = request.chart_type.strip().lower() if request.chart_type else ""
  supported_types = {"bar", "scatter", "line", "grouped_bar", "stacked_bar"}
  if chart_type not in supported_types:
    raise HTTPException(
      status_code=400,
      detail=(
        f"Unsupported chart type: '{request.chart_type}'. "
        f"Supported types are: {', '.join(sorted(supported_types))}."
      ),
    )

  # 4. Resolve file path and load dataset
  try:
    file_path = resolve_dataset_path(request.filename)
    df = load_csv(file_path)
  except FileNotFoundError as e:
    raise HTTPException(
      status_code=404,
      detail=str(e),
    )
  except ValueError as e:
    raise HTTPException(
      status_code=400,
      detail=str(e),
    )
  except Exception:
    raise HTTPException(
      status_code=500,
      detail="Unable to load dataset file.",
    )

  # 5. Validate dataset not empty
  if df.empty:
    raise HTTPException(
      status_code=400,
      detail="The dataset is empty.",
    )

  # 6. Validate column existence
  if col_1 not in df.columns:
    raise HTTPException(
      status_code=400,
      detail=f"Column '{col_1}' not found in dataset.",
    )

  if col_2 not in df.columns:
    raise HTTPException(
      status_code=400,
      detail=f"Column '{col_2}' not found in dataset.",
    )

  # 7. Generate chart data via VisualizationAnalyzer
  try:
    analyzer = VisualizationAnalyzer(df)
    chart_data = analyzer.generate_chart_data(col_1, col_2, chart_type)
    serializable_data = make_json_serializable(chart_data)

    return {
      "status": "success",
      "filename": request.filename,
      "column_1": col_1,
      "column_2": col_2,
      "chart_type": chart_type,
      "data": serializable_data,
    }
  except ValueError as e:
    raise HTTPException(
      status_code=400,
      detail=str(e),
    )
  except Exception:
    raise HTTPException(
      status_code=500,
      detail="Unable to generate visualization.",
    )