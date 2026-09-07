import pandas as pd

class StatisticalAnalyzer:
  def __init__(self, df):
    self.df = df

  def get_numerical_statistics(self):
    numerical_df = self.df.select_dtypes(include=["number"])
    if numerical_df.empty:
      return {}
    statistics = {}

    for column in numerical_df.columns:
      series = numerical_df[column].dropna()
      mode = series.mode()

      statistics[column] = {
        "count": int(series.count()),
        "mean": round(float(series.mean()), 4),
        "median": round(float(series.median()), 4),
        "mode": round(float(mode.iloc[0]), 4)
        if not mode.empty else None,
        "variance": round(float(series.var()), 4),
        "standard_deviation": round(float(series.std()), 4),
        "mid": round(float(series.min()), 4),
        "max": round(float(series.max()), 4),
        "range": round(float(series.max()-series.min()), 4),
        "skewness": round(float(series.skew()), 4)
      }

    return statistics


  def get_categorical_statistics(self):
    categorical_df = self.df.select_dtypes(
      include=["object", "category"]
    )

    if categorical_df.empty:
      return {}

    statistics = {}

    for column in categorical_df.columns:
      series = categorical_df[column].dropna()
      mode = series.mode()

      statistics[column] = {
        "count": int(series.count()),
        "unique": int(series.nunique()),
        "mode": mode.iloc[0]
        if not mode.empty else None,
        "mode_frequency": int(series.value_counts().iloc[0])
        if not series.empty else 0
      }

    return statistics


  def analyze(self):
    return {
      "numerical_statistics": self.get_numerical_statistics(),
      "categorical_statistics": self.get_categorical_statistics()
    }
  