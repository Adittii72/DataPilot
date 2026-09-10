import { formatNumber, formatPercent } from './formatters';

export function generateInsights(analysis) {
  const insights = [];
  if (!analysis) return insights;

  const profile = analysis.profile || {};
  const quality = analysis.data_quality || {};
  const eda = analysis.eda || {};

  const totalCols = profile.shape?.columns || 0;

  const missingObj = quality.missing_values || {};
  const missingCols = Object.entries(missingObj).filter(
    ([, data]) => (data?.count || 0) > 0
  );

  if (missingCols.length === 0) {
    insights.push({
      type: 'positive',
      title: 'Complete Data Integrity',
      description: 'Zero missing values detected across all ' + totalCols + ' columns.',
      tag: 'Completeness',
    });
  } else {
    const highestMissing = missingCols.reduce((max, curr) =>
      curr[1].count > max[1].count ? curr : max
    );
    insights.push({
      type: 'warning',
      title: missingCols.length + ' Column' + (missingCols.length > 1 ? 's' : '') + ' Contain Missing Values',
      description:
        highestMissing[0] +
        ' has the highest missing rate (' +
        formatNumber(highestMissing[1].count) +
        ' rows, ' +
        formatPercent(highestMissing[1].percentage) +
        ').',
      tag: 'Missing Data',
    });
  }

  const duplicates = quality.duplicate_rows || {};
  if (!duplicates.count || duplicates.count === 0) {
    insights.push({
      type: 'positive',
      title: 'No Duplicate Rows Detected',
      description: 'Every record in this dataset is unique across all observations.',
      tag: 'Duplicates',
    });
  } else {
    insights.push({
      type: 'warning',
      title: formatNumber(duplicates.count) + ' Duplicate Rows Found',
      description:
        'Approximately ' +
        formatPercent(duplicates.percentage) +
        ' of the dataset consists of duplicate observations.',
      tag: 'Duplicates',
    });
  }

  const constantCols = quality.constant_columns || [];
  if (constantCols.length > 0) {
    insights.push({
      type: 'negative',
      title: constantCols.length + ' Constant Column' + (constantCols.length > 1 ? 's' : '') + ' Detected',
      description:
        'Columns [' +
        constantCols.join(', ') +
        '] contain no variation and can be safely pruned for modeling.',
      tag: 'Zero Variance',
    });
  } else {
    insights.push({
      type: 'neutral',
      title: 'No Constant Columns Detected',
      description: 'All features exhibit variation, providing informational value for analysis.',
      tag: 'Variance',
    });
  }

  const skewness = eda.skewness || {};
  const highSkewCols = Object.entries(skewness).filter(
    ([, val]) => typeof val === 'number' && Math.abs(val) >= 1.0
  );

  if (highSkewCols.length > 0) {
    const topSkew = highSkewCols[0];
    insights.push({
      type: 'warning',
      title: highSkewCols.length + ' Feature' + (highSkewCols.length > 1 ? 's' : '') + ' Exhibit High Skewness',
      description:
        topSkew[0] +
        ' has notable skewness (' +
        topSkew[1] +
        '), suggesting a non-normal long-tail distribution.',
      tag: 'Distribution',
    });
  }

  const outliers = eda.outliers || {};
  const outlierEntries = Object.entries(outliers).filter(
    ([, data]) => (data?.count || 0) > 0
  );

  if (outlierEntries.length > 0) {
    const topOutlier = outlierEntries.reduce((max, curr) =>
      (curr[1].percentage || 0) > (max[1].percentage || 0) ? curr : max
    );
    insights.push({
      type: 'info',
      title: 'Outliers Detected in ' + outlierEntries.length + ' Numerical Features',
      description:
        topOutlier[0] +
        ' shows highest anomaly concentration with ' +
        formatNumber(topOutlier[1].count) +
        ' outliers (' +
        formatPercent(topOutlier[1].percentage) +
        ').',
      tag: 'Anomalies',
    });
  }

  const uniqueRatios = quality.unique_value_ratios || {};
  const highCardCols = Object.entries(uniqueRatios).filter(
    ([col, ratio]) =>
      (profile.categorical_columns || []).includes(col) && ratio > 0.4
  );

  if (highCardCols.length > 0) {
    insights.push({
      type: 'info',
      title: highCardCols.length + ' High-Cardinality Categorical Feature' + (highCardCols.length > 1 ? 's' : ''),
      description:
        'Columns like ' +
        highCardCols[0][0] +
        ' have high uniqueness ratios (' +
        formatPercent(highCardCols[0][1] * 100) +
        ').',
      tag: 'Cardinality',
    });
  }

  const correlations = eda.correlations || {};
  let strongestPair = null;
  let highestCorr = 0;

  const corrCols = Object.keys(correlations);
  for (let i = 0; i < corrCols.length; i++) {
    for (let j = i + 1; j < corrCols.length; j++) {
      const colA = corrCols[i];
      const colB = corrCols[j];
      const val = correlations[colA]?.[colB];
      if (typeof val === 'number' && Math.abs(val) < 1.0) {
        if (Math.abs(val) > highestCorr) {
          highestCorr = Math.abs(val);
          strongestPair = { colA, colB, val };
        }
      }
    }
  }

  if (strongestPair && highestCorr >= 0.5) {
    insights.push({
      type: 'positive',
      title: 'Strong Linear Correlation Found',
      description:
        strongestPair.colA +
        ' and ' +
        strongestPair.colB +
        ' share an r=' +
        strongestPair.val.toFixed(3) +
        ' correlation.',
      tag: 'Correlation',
    });
  }

  return insights;
}
