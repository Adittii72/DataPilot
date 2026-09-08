import pandas as pd

class EDAAnalyzer:
  def __init__(self, df):
    self.df = df

  #NUMERICAL EDA

  def get_outliers(self):
    numerical_df = self.df.select_dtypes(include=["number"])

    if numerical_df.empty:
      return {}

    outlier_results = {}

    for column in numerical_df.columns:
      series = numerical_df[column].dropna()
      if series.empty:
        continue

      q1 = series.quantile(0.25)
      q3 = series.quantile(0.75)

      iqr = q3-q1

      lower_bound = q1 - (1.5*iqr)
      upper_bound = q3 + (1.5*iqr)

      outlier_mask = (
        (series < lower_bound) | (series > upper_bound)
      )

      outlier_count = int(outlier_mask.sum())

      outlier_results[column] = {
        "count": outlier_count,
        "percentage": round(outlier_count / len(series)*100, 4),
        "lower_bound": round(float(lower_bound), 4),
        "upper_bound": round(float(upper_bound), 4)
      }

      return outlier_results


  def get_skewness(self):
    numerical_df = self.df.select_dtypes(include=["number"])

    if numerical_df.empty:
      return {}

    skewness_results = {}

    for column in numerical_df.columns:
      series = numerical_df[column].dropna()

      if series.empty:
        continue
      #skew = 3(mean-median)/std
      skewness_results[column] = round(float(series.skew()), 4)

    return skewness_results

  def get_correlations(self):
    numerical_df = self.df.select_dtypes(include=["number"])

    if numerical_df.empty:
      return pd.DataFrame()

    return numerical_df.corr().round(4)

  #CATEGORICAL EDA

  def get_value_frequencies(self):
    categorical_df = self.df.select_dtypes(
      include=["object", "category"]
    )

    if categorical_df.empty:
      return {}

    frequency_results = {}

    for column in categorical_df.columns:
      frequency_results[column] = (categorical_df[column].value_counts(dropna=False).to_dict())

    return frequency_results

  def get_rare_categories(self, threshold = 0.01):
    categorical_df = self.df.select_dtypes(
      include=["object", "category"]
    )

    if categorical_df.empty:
      return {}

    rare_results = {}

    for column in categorical_df.columns:
      value_counts = categorical_df[column].value_counts(dropna=False)
      total_count = len(categorical_df[column])
      rare_values = value_counts[(value_counts/total_count) < threshold]

      rare_results[column] = {
        value: int(count)
        for value, count in rare_values.items()
      }

    return rare_results

  def get_numerical_categorical_relationships(self):

    numerical_columns = self.df.select_dtypes(
      include=["number"]
    ).columns

    categorical_columns = self.df.select_dtypes(
      include=["object", "category"]
    ).columns

    if len(numerical_columns) == 0 or len(categorical_columns) == 0:
      return {}

    relationship_results = {}

    for categorical_column in categorical_columns:
      relationship_results[categorical_column] = {}
      for numerical_column in numerical_columns:
        grouped = (
          self.df
          .groupby(categorical_column, dropna=False)[numerical_column]
          .agg(["mean", "median", "count"])
          .round(4)
        )
        relationship_results[categorical_column][numerical_column] = grouped
    return relationship_results


  def get_categorical_relationships(self, max_categories=50):
    categorical_columns = self.df.select_dtypes(
      include=["object", "category"]
    ).columns

    if len(categorical_columns) < 2:
      return {}

    usable_columns = [
      column
      for column in categorical_columns
      if self.df[column].nunique(dropna=True) <= max_categories
  ]

    if len(usable_columns) < 2:
      return {}

    relationship_results = {}

    for i in range(len(usable_columns)):
      for j in range(i + 1, len(usable_columns)):
        column_1 = usable_columns[i]
        column_2 = usable_columns[j]

        cross_tab = pd.crosstab(
          self.df[column_1],
          self.df[column_2],
          dropna=False
        )

        relationship_results[
          f"{column_1} vs {column_2}"
        ] = cross_tab

    return relationship_results