#dataset_profiler.py

import pandas as pd

class DatasetProfiler:
  def __init__(self, df):
    self.df = df

  def get_shape(self):
    rows, columns = self.df.shape

    return {
      "rows": rows,
      "columns": columns
    }

  def get_column_names(self):
    return self.df.columns.tolist()

  def get_data_types(self):
    return self.df.dtypes.astype(str).to_dict()

  def get_numerical_columns(self):
    return self.df.select_dtypes(
      include=["number"]
    ).columns.tolist()

  def get_categorical_columns(self):
    return self.df.select_dtypes(
      include=["object", "category"]
    ).columns.tolist()

  def profile(self):
    return {
      "shape": self.get_shape(),
      "columns": self.get_column_names(),
      "data_types": self.get_data_types(),
      "numerical_columns": self.get_numerical_columns(),
      "categorical_columns": self.get_categorical_columns()
}