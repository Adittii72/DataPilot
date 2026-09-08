from src.dataset_profiler import DatasetProfiler
from src.dataset_quality import DataQualityAnalyzer
from src.statistical_analyzer import StatisticalAnalyzer
from src.eda_analyzer import EDAAnalyzer

class AnalysisPipeline:
  def __init__(self, df):
    self.df = df

  def run(self):
    profiler = DatasetProfiler(self.df)
    quality_analyzer = DataQualityAnalyzer(self.df)
    statistical_analyzer = StatisticalAnalyzer(self.df)
    eda_analyzer = EDAAnalyzer(self.df)

    return {
      "profile": profiler.profile(),
      "data_quality": quality_analyzer.analyze(),
      "statistics": statistical_analyzer.analyze(),
      "eda": {
        "outliers": eda_analyzer.get_outliers(),
        "skewness": eda_analyzer.get_skewness(),
        "correlations": eda_analyzer.get_correlations(),
        "value_frequencies": eda_analyzer.get_value_frequencies(),
        "rare_categories": eda_analyzer.get_rare_categories(),
        "numerical_categorical_relationships": eda_analyzer.get_numerical_categorical_relationships(),
        "categorical_relationships": eda_analyzer.get_categorical_relationships()
      }
    }
