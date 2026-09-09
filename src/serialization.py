import numpy as np
import pandas as pd


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