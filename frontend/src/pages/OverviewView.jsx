import { Database, Columns, Hash, Type, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import InsightsCard from '../components/InsightsCard';
import DistributionBar from '../components/DistributionBar';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function OverviewView({ analysis, insights = [] }) {
  const profile = analysis?.profile || {};
  const quality = analysis?.data_quality || {};
  const totalRows = profile.shape?.rows || 0;
  const totalCols = profile.shape?.columns || 0;
  const numericalCols = profile.numerical_columns || [];
  const categoricalCols = profile.categorical_columns || [];
  const dataTypes = profile.data_types || {};

  const missingObj = quality.missing_values || {};
  let totalMissingCells = 0;
  Object.values(missingObj).forEach((m) => {
    totalMissingCells += m.count || 0;
  });
  const totalPossibleCells = totalRows * totalCols;
  const completeness =
    totalPossibleCells > 0
      ? ((totalPossibleCells - totalMissingCells) / totalPossibleCells) * 100
      : 100;

  return (
    <div className="overview-view">
      <div className="overview-metrics-grid">
        <MetricCard
          title="Total Observations"
          value={formatNumber(totalRows)}
          subtitle="Dataset record rows"
          icon={Database}
          accent={true}
        />
        <MetricCard
          title="Total Features"
          value={formatNumber(totalCols)}
          subtitle="Variables measured"
          icon={Columns}
        />
        <MetricCard
          title="Numerical Features"
          value={formatNumber(numericalCols.length)}
          subtitle="Quantitative continuous/discrete"
          icon={Hash}
          badge={`${formatPercent((numericalCols.length / (totalCols || 1)) * 100)}`}
        />
        <MetricCard
          title="Categorical Features"
          value={formatNumber(categoricalCols.length)}
          subtitle="Qualitative / discrete types"
          icon={Type}
          badge={`${formatPercent((categoricalCols.length / (totalCols || 1)) * 100)}`}
        />
      </div>

      <div className="overview-hero-split">
        <div className="overview-insights-column">
          <InsightsCard insights={insights} />
        </div>

        <div className="overview-health-column">
          <div className="health-card">
            <div className="health-card-header">
              <div className="health-title-wrap">
                <Sparkles size={16} className="text-accent" />
                <h4>Data Health Score</h4>
              </div>
              <span className="health-score-badge">
                {completeness >= 95 ? (
                  <span className="badge-pill badge-pill-green">
                    <CheckCircle2 size={12} /> High Quality
                  </span>
                ) : (
                  <span className="badge-pill badge-pill-amber">
                    <AlertTriangle size={12} /> Notice Required
                  </span>
                )}
              </span>
            </div>

            <div className="health-score-big">
              <span className="health-score-number">{completeness.toFixed(1)}%</span>
              <span className="health-score-label">Cell Completeness</span>
            </div>

            <div className="health-progress-wrap">
              <DistributionBar percentage={completeness} status="success" height={8} />
            </div>

            <div className="health-breakdown-list">
              <div className="health-breakdown-row">
                <span className="breakdown-label">Missing Cells</span>
                <span className="breakdown-val">
                  {formatNumber(totalMissingCells)} (
                  {formatPercent((totalMissingCells / (totalPossibleCells || 1)) * 100)})
                </span>
              </div>
              <div className="health-breakdown-row">
                <span className="breakdown-label">Duplicate Observations</span>
                <span className="breakdown-val">
                  {formatNumber(quality.duplicate_rows?.count || 0)} (
                  {formatPercent(quality.duplicate_rows?.percentage || 0)})
                </span>
              </div>
              <div className="health-breakdown-row">
                <span className="breakdown-label">Constant Columns</span>
                <span className="breakdown-val">
                  {quality.constant_columns?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="overview-dtypes-card">
            <div className="dtypes-card-header">
              <h4>Schema & Data Types</h4>
              <span className="dtypes-count-pill">{totalCols} Fields</span>
            </div>
            <div className="dtypes-scrollable-list">
              {Object.entries(dataTypes).map(([col, dtype]) => {
                const isNum = numericalCols.includes(col);
                return (
                  <div key={col} className="dtype-row">
                    <span className="dtype-col-name">{col}</span>
                    <span
                      className={`dtype-tag ${
                        isNum ? 'dtype-tag-num' : 'dtype-tag-cat'
                      }`}
                    >
                      {dtype}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
