import pandas as pd


class VisualizationAnalyzer:
  def __init__(self, df: pd.DataFrame):
    self.df = df

  def get_column_type(self, column: str) -> str:
    if column not in self.df.columns:
      raise ValueError(f"Column not found: {column}")

    series = self.df[column]

    if pd.api.types.is_numeric_dtype(series):
      return "numerical"

    if pd.api.types.is_datetime64_any_dtype(series):
      return "date"

    # For string / object / categorical columns:
    sample = series.dropna().head(100)
    if not sample.empty:
      # Check if dirty numeric
      num_parsed = pd.to_numeric(sample, errors="coerce")
      if num_parsed.notna().mean() >= 0.7:
        return "numerical"

      # Check if date strings
      try:
        date_parsed = pd.to_datetime(sample, errors="coerce", format="mixed")
        if date_parsed.notna().mean() >= 0.7:
          return "date"
      except Exception:
        pass

    return "categorical"

  def get_column_types(self, column_1: str, column_2: str) -> dict[str, str]:
    if column_1 not in self.df.columns:
      raise ValueError(f"Column not found: {column_1}")

    if column_2 not in self.df.columns:
      raise ValueError(f"Column not found: {column_2}")

    return {
      column_1: self.get_column_type(column_1),
      column_2: self.get_column_type(column_2),
    }

  def prepare_bar_data(
    self,
    category_column: str,
    numerical_column: str,
    max_categories: int = 50,
  ) -> list[dict]:
    if category_column not in self.df.columns:
      raise ValueError(f"Column not found: {category_column}")
    if numerical_column not in self.df.columns:
      raise ValueError(f"Column not found: {numerical_column}")

    df_copy = pd.DataFrame({
      "category": self.df[category_column].fillna("Missing").astype(str),
      "value": pd.to_numeric(self.df[numerical_column], errors="coerce"),
    }).dropna(subset=["value"])

    grouped = (
      df_copy.groupby("category", as_index=False)["value"]
      .sum()
      .sort_values(by="value", ascending=False)
      .head(max_categories)
    )

    return grouped.to_dict(orient="records")

  def prepare_scatter_data(
    self,
    x_column: str,
    y_column: str,
    sample_size: int = 1000,
  ) -> list[dict]:
    if x_column not in self.df.columns:
      raise ValueError(f"Column not found: {x_column}")
    if y_column not in self.df.columns:
      raise ValueError(f"Column not found: {y_column}")

    df_copy = pd.DataFrame({
      "x": pd.to_numeric(self.df[x_column], errors="coerce"),
      "y": pd.to_numeric(self.df[y_column], errors="coerce"),
    }).dropna()

    if len(df_copy) > sample_size:
      df_copy = df_copy.sample(n=sample_size, random_state=42)

    return df_copy.to_dict(orient="records")

  def prepare_line_data(
    self,
    date_column: str,
    numerical_column: str,
  ) -> list[dict]:
    if date_column not in self.df.columns:
      raise ValueError(f"Column not found: {date_column}")
    if numerical_column not in self.df.columns:
      raise ValueError(f"Column not found: {numerical_column}")

    df_copy = pd.DataFrame({
      "date_raw": self.df[date_column],
      "value": pd.to_numeric(self.df[numerical_column], errors="coerce"),
    }).dropna(subset=["value"])

    if df_copy.empty:
      return []

    df_copy["parsed_date"] = pd.to_datetime(
      df_copy["date_raw"], errors="coerce", format="mixed"
    )
    df_copy = df_copy.dropna(subset=["parsed_date"])

    if df_copy.empty:
      return []

    has_time = (df_copy["parsed_date"].dt.time != pd.Timestamp("00:00:00").time()).any()
    date_format = "%Y-%m-%d %H:%M" if has_time else "%Y-%m-%d"
    df_copy["date"] = df_copy["parsed_date"].dt.strftime(date_format)

    grouped = (
      df_copy.groupby("date", as_index=False)["value"]
      .sum()
      .sort_values("date")
    )
    return grouped.to_dict(orient="records")

  def prepare_grouped_bar_data(
    self,
    category_1: str,
    category_2: str,
    max_categories: int = 15,
  ) -> list[dict]:
    if category_1 not in self.df.columns:
      raise ValueError(f"Column not found: {category_1}")
    if category_2 not in self.df.columns:
      raise ValueError(f"Column not found: {category_2}")

    df_copy = pd.DataFrame({
      "category": self.df[category_1].fillna("Missing").astype(str),
      "group": self.df[category_2].fillna("Missing").astype(str),
    })

    top_cat1 = df_copy["category"].value_counts().head(max_categories).index
    top_cat2 = df_copy["group"].value_counts().head(max_categories).index
    df_copy = df_copy[
      df_copy["category"].isin(top_cat1) & df_copy["group"].isin(top_cat2)
    ]

    grouped = (
      df_copy.groupby(["category", "group"], dropna=False)
      .size()
      .reset_index(name="value")
    )
    return grouped.to_dict(orient="records")

  def generate_chart_data(
    self,
    column_1: str,
    column_2: str,
    chart_type: str,
  ) -> list[dict]:
    if column_1 == column_2:
      raise ValueError("column_1 and column_2 must be different columns.")

    types = self.get_column_types(column_1, column_2)
    c1_type = types[column_1]
    c2_type = types[column_2]

    normalized_chart_type = chart_type.strip().lower()

    supported_types = {"bar", "scatter", "line", "grouped_bar", "stacked_bar"}
    if normalized_chart_type not in supported_types:
      raise ValueError(
        f"Unsupported chart type: '{chart_type}'. "
        f"Supported types are: {', '.join(sorted(supported_types))}."
      )

    if normalized_chart_type == "bar":
      if c1_type == "categorical" and c2_type == "numerical":
        return self.prepare_bar_data(column_1, column_2)
      elif c1_type == "numerical" and c2_type == "categorical":
        return self.prepare_bar_data(column_2, column_1)
      elif c1_type == "categorical" and c2_type == "categorical":
        return self.prepare_grouped_bar_data(column_1, column_2)
      else:
        raise ValueError(
          f"Incompatible column types for 'bar' chart. Expected (categorical, numerical) "
          f"or (categorical, categorical), but received ({c1_type}, {c2_type})."
        )

    if normalized_chart_type in {"grouped_bar", "stacked_bar"}:
      if c1_type == "categorical" and c2_type == "categorical":
        return self.prepare_grouped_bar_data(column_1, column_2)
      else:
        raise ValueError(
          f"Incompatible column types for '{chart_type}'. Expected two categorical columns, "
          f"but received ({c1_type}, {c2_type})."
        )

    if normalized_chart_type == "scatter":
      if c1_type == "numerical" and c2_type == "numerical":
        return self.prepare_scatter_data(column_1, column_2)
      else:
        raise ValueError(
          f"Incompatible column types for 'scatter' chart. Expected two numerical columns, "
          f"but received ({c1_type}, {c2_type})."
        )

    if normalized_chart_type == "line":
      if c1_type == "date" and c2_type == "numerical":
        return self.prepare_line_data(column_1, column_2)
      elif c1_type == "numerical" and c2_type == "date":
        return self.prepare_line_data(column_2, column_1)
      else:
        raise ValueError(
          f"Incompatible column types for 'line' chart. Expected (date, numerical), "
          f"but received ({c1_type}, {c2_type})."
        )

    raise ValueError(f"Unsupported chart type: '{chart_type}'")