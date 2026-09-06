import pandas as pd


class DataQualityAnalyzer:
  def __init__(self, df):
    self.df = df

  def get_missing_values(self):
    missing_count = self.df.isnull().sum()

    missing_percentage = (missing_count/len(self.df))*100

    return {
      column:{
        "count": int(missing_count[column]),
        "percentage": round(float(missing_percentage[column]), 2)
      }
      for column in self.df.columns
    }


  def get_duplicate_rows(self):
    duplicate_count = self.df.duplicated().sum()

    duplicate_percentage = (duplicate_count/len(self.df))*100

    return {
      "count": int(duplicate_count),
      "percentage": float(duplicate_percentage)
    }

  def get_constant_columns(self):
    return [
      column
      for column in self.df.columns
      if self.df[column].nunique(dropna=False) <= 1
    ]

  # def get_high_cardinality_columns(self, threshold=0.5):
  #   high_cardinality_columns = []

  #   for column in self.df.select_dtypes(
  #     include = ["object", "category"]
  #   ).columns:
  #     unique_ratio = (
  #       self.df[column].nunique(dropna=True)/len(self.df)
  #     )

  #     if unique_ratio >= threshold:
  #       high_cardinality_columns.append(column)
      
  #   return high_cardinality_columns

  def get_unique_value_counts(self):
    return {
      column: int(self.df[column].nunique(dropna=True))
      for column in self.df.columns
    }

  def get_unique_value_ratios(self):
    total_rows = len(self.df)

    if total_rows==0:
      return {
        column: 0.0
        for column in self.df.columns
      }

    return {
      column: round(self.df[column].nunique(dropna=True)/total_rows, 4)
      for column in self.df.columns
    }

  def analyze(self):
    return {
      "missing_values": self.get_missing_values(),
      "duplicate_rows": self.get_duplicate_rows(),
      "constant_columns": self.get_constant_columns(),
      "unique_value_counts": self.get_unique_value_counts(),
      "unique_value_ratios": self.get_unique_value_ratios(),
      # "high_cardinality_columns": self.get_high_cardinality_columns()
    }