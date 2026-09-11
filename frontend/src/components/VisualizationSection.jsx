import { useState, useMemo } from 'react';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  ScatterChart as ScatterIcon,
  AlertCircle,
  Loader2,
  HelpCircle,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { fetchVisualization } from '../services/api';
import { buildChartData, buildChartOptions } from '../utils/chartHelpers';

export default function VisualizationSection({ analysis, filename }) {
  const profile = analysis?.profile || {};
  const columns = useMemo(() => profile.columns || [], [profile.columns]);
  const numericalCols = useMemo(() => profile.numerical_columns || [], [profile.numerical_columns]);
  const categoricalCols = useMemo(() => profile.categorical_columns || [], [profile.categorical_columns]);

  // Initial defaults
  const initialCol1 = categoricalCols[0] || columns[0] || '';
  const initialCol2 = numericalCols[0] || (columns[1] !== initialCol1 ? columns[1] : '') || '';

  const [col1, setCol1] = useState(initialCol1);
  const [col2, setCol2] = useState(initialCol2);
  const [chartType, setChartType] = useState('bar');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartResult, setChartResult] = useState(null);
  const [activeMeta, setActiveMeta] = useState(null);

  // Validation
  const validationError = useMemo(() => {
    if (!col1 || !col2) {
      return 'Please select both Column 1 and Column 2.';
    }
    if (col1 === col2) {
      return 'Column 1 and Column 2 must be different features.';
    }
    return null;
  }, [col1, col2]);

  // Chart options and data
  const chartConfig = useMemo(() => {
    if (!chartResult || !activeMeta) return null;
    return buildChartData(
      activeMeta.chartType,
      chartResult.data,
      activeMeta.col1,
      activeMeta.col2
    );
  }, [chartResult, activeMeta]);

  const chartOptions = useMemo(() => {
    if (!activeMeta) return {};
    return buildChartOptions(activeMeta.chartType, activeMeta.col1, activeMeta.col2);
  }, [activeMeta]);

  const handleGenerate = async () => {
    if (validationError) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchVisualization({
        filename: filename || 'dataset.csv',
        column_1: col1,
        column_2: col2,
        chart_type: chartType,
      });

      if (!res.data || res.data.length === 0) {
        setChartResult(null);
        setError('No visualization data is available for this column selection.');
      } else {
        setChartResult(res);
        setActiveMeta({ col1, col2, chartType });
      }
    } catch (err) {
      setChartResult(null);
      setError(err.message || 'Unable to generate visualization.');
    } finally {
      setIsLoading(false);
    }
  };

  const getColTypeBadge = (col) => {
    if (numericalCols.includes(col)) return 'num';
    if (categoricalCols.includes(col)) return 'cat';
    return 'other';
  };

  return (
    <div className="visualization-section">
      {/* Header Banner */}
      <div className="viz-header-card">
        <div className="viz-header-content">
          <div className="viz-badge">
            <Sparkles size={14} className="text-accent" />
            <span>INTERACTIVE VISUALIZATION ENGINE</span>
          </div>
          <h2 className="viz-title">Data Visualization</h2>
          <p className="viz-subtitle">
            Choose columns and explore relationships in your data. Render interactive Chart.js bar charts,
            time-series lines, and bivariate scatter plots directly from the backend DS engine.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="viz-controls-card">
        <div className="viz-controls-grid">
          {/* Column 1 Selector */}
          <div className="viz-field-group">
            <label className="viz-field-label" htmlFor="col1-select">
              Column 1 (X Axis / Category)
            </label>
            <div className="viz-select-wrap">
              <select
                id="col1-select"
                value={col1}
                onChange={(e) => {
                  setCol1(e.target.value);
                  setError(null);
                }}
                className="viz-select"
              >
                <option value="" disabled>
                  Select column...
                </option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c} ({getColTypeBadge(c).toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 2 Selector */}
          <div className="viz-field-group">
            <label className="viz-field-label" htmlFor="col2-select">
              Column 2 (Y Axis / Metric)
            </label>
            <div className="viz-select-wrap">
              <select
                id="col2-select"
                value={col2}
                onChange={(e) => {
                  setCol2(e.target.value);
                  setError(null);
                }}
                className="viz-select"
              >
                <option value="" disabled>
                  Select column...
                </option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c} ({getColTypeBadge(c).toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="viz-field-group">
            <label className="viz-field-label" htmlFor="chart-type-select">
              Chart Type
            </label>
            <div className="viz-select-wrap">
              <select
                id="chart-type-select"
                value={chartType}
                onChange={(e) => {
                  setChartType(e.target.value);
                  setError(null);
                }}
                className="viz-select"
              >
                <option value="bar">Bar Chart (Categorical + Numerical)</option>
                <option value="line">Line Chart (Date/Time + Numerical)</option>
                <option value="scatter">Scatter Plot (Numerical + Numerical)</option>
              </select>
            </div>
          </div>

          {/* CTA Button */}
          <div className="viz-action-group">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={Boolean(validationError) || isLoading}
              className={`viz-generate-btn ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="spin-icon" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Generate Visualization</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Warning */}
        {validationError && (
          <div className="viz-validation-notice">
            <AlertCircle size={14} />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Chart Canvas Card */}
      <div className="viz-canvas-card">
        {/* Error Alert */}
        {error && (
          <div className="viz-error-banner">
            <div className="viz-error-icon">
              <AlertCircle size={20} />
            </div>
            <div className="viz-error-content">
              <strong>Visualization Error</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              className="viz-error-retry-btn"
              disabled={Boolean(validationError) || isLoading}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* State 1: Active Loading */}
        {isLoading && (
          <div className="viz-loading-state">
            <div className="viz-loading-bubble">
              <Loader2 size={40} className="spin-icon text-accent" />
            </div>
            <h4 className="viz-loading-heading">Synthesizing Chart Visualization...</h4>
            <p className="viz-loading-subtext">
              Requesting aggregated data structures for <strong>{col1}</strong> and{' '}
              <strong>{col2}</strong>
            </p>
          </div>
        )}

        {/* State 2: Empty Placeholder */}
        {!isLoading && !chartConfig && !error && (
          <div className="viz-empty-state">
            <div className="viz-empty-icon-wrap">
              <BarChart3 size={44} className="viz-empty-icon" />
            </div>
            <h3 className="viz-empty-title">Select two columns and generate a visualization</h3>
            <p className="viz-empty-desc">
              Pick your primary feature and metric from the dropdowns above, choose between Bar, Line,
              or Scatter Plot, and reveal distribution patterns in seconds.
            </p>
            <div className="viz-guidance-pills">
              <div className="guidance-pill">
                <BarChart3 size={13} />
                <span>Bar: Categorical + Numerical</span>
              </div>
              <div className="guidance-pill">
                <TrendingUp size={13} />
                <span>Line: Date + Numerical</span>
              </div>
              <div className="guidance-pill">
                <ScatterIcon size={13} />
                <span>Scatter: Numerical + Numerical</span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Rendered Chart Canvas */}
        {!isLoading && chartConfig && (
          <div className="viz-rendered-container">
            <div className="viz-meta-header">
              <div className="viz-meta-left">
                <span className="viz-chart-type-tag">
                  {activeMeta?.chartType === 'bar' && <BarChart3 size={14} />}
                  {activeMeta?.chartType === 'line' && <TrendingUp size={14} />}
                  {activeMeta?.chartType === 'scatter' && <ScatterIcon size={14} />}
                  <span>{activeMeta?.chartType?.toUpperCase()} CHART</span>
                </span>
                <span className="viz-col-pair">
                  <strong>{activeMeta?.col1}</strong> <span className="text-muted">vs</span>{' '}
                  <strong>{activeMeta?.col2}</strong>
                </span>
              </div>
              <div className="viz-meta-right">
                <span className="viz-count-badge">
                  <Layers size={13} />
                  <span>
                    {chartResult?.data?.length || 0} Observation
                    {(chartResult?.data?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </span>
              </div>
            </div>

            <div className="viz-chart-viewport">
              {activeMeta?.chartType === 'bar' && (
                <Bar data={chartConfig} options={chartOptions} />
              )}
              {activeMeta?.chartType === 'line' && (
                <Line data={chartConfig} options={chartOptions} />
              )}
              {activeMeta?.chartType === 'scatter' && (
                <Scatter data={chartConfig} options={chartOptions} />
              )}
            </div>

            <div className="viz-footer-bar">
              <div className="viz-footer-tip">
                <HelpCircle size={13} />
                <span>
                  Hover over bars or points to inspect precise quantitative values and categories.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
