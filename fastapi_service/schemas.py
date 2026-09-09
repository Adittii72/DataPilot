from typing import Any
from pydantic import BaseModel

class AnaLysisResponse(BaseModel):
  status: str
  filename: str
  analysis: dict[str, Any]