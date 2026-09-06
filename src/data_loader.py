#data_loader.py
import pandas as pd

def load_csv(file_path):
  try:
    df = pd.read_csv(file_path)
    print("CSV file loaded successfully.")
    return df
  except FileNotFoundError:
    raise FileNotFoundError(f"File not Found: {file_path}")

  except pd.errors.EmptyDataError:
    raise ValueError("The CSV is empty.")

  except pd.errors.ParserError:
    raise ValueError("Unable to parse the CSV file")