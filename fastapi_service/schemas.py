from typing import Any
from pydantic import BaseModel


class AnaLysisResponse(BaseModel):
  status: str
  filename: str
  analysis: dict[str, Any]


class AnalysisResponse(BaseModel):
  status: str
  filename: str
  analysis: dict[str, Any]


class VisualizationRequest(BaseModel):
  filename: str
  column_1: str
  column_2: str
  chart_type: str


class VisualizationResponse(BaseModel):
  status: str
  filename: str
  column_1: str
  column_2: str
  chart_type: str
  data: Any