import { useState, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Copy, AlertOctagon, Layers, Search } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import DistributionBar from '../components/DistributionBar';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function DataQualityView({ analysis }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const quality = analysis?.data_quality || {};
  const duplicateRows = quality.duplicate_rows || { count: 0, percentage: 0 };
  const constantColumns = quality.constant_columns || [];

  const { missingStats, tableData } = useMemo(() => {
    const q = analysis?.data_quality || {};
    const p = analysis?.profile || {};
    const missingValues = q.missing_values || {};
    const categoricalCols = p.categorical_columns || [];
    const constCols = q.constant_columns || [];
    const uniqueCounts = q.unique_value_counts || {};
    const uniqueRatios = q.unique_value_ratios || {};

    let totalMissing = 0;
    let affectedCols = 0;

    const dataRows = Object.entries(missingValues).map(([column, data]) => {
      const count = data?.count || 0;
      const percentage = data?.percentage || 0;
      if (count > 0) {
        totalMissing += count;
        affectedCols += 1;
      }
      const uniqueCount = uniqueCounts[column] ?? '—';
      const uniqueRatio = uniqueRatios[column] ?? 0;
      const isConstant = constCols.includes(column);
      const isCategorical = categoricalCols.includes(column);
      const isHighCardinality =
        isCategorical &&
        (uniqueRatio > 0.4 ||
          (typeof uniqueCount === 'number' && uniqueCount > 50));

      let status = 'clean';
      if (percentage > 20) status = 'critical';
      else if (percentage > 5) status = 'moderate';
      else if (percentage > 0) status = 'minor';

      return {
        column,
        count,
        percentage,
        uniqueCount,
        uniqueRatio,
        isConstant,
        isHighCardinality,
        status,
      };
    });

    return {
      missingStats: { totalMissing, affectedCols },
      tableData: dataRows,
    };
  }, [analysis]);

  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      const matchesSearch = row.column.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === 'missing') return row.count > 0;
      if (filterMode === 'clean') return row.count === 0;
      if (filterMode === 'cardinality') return row.isHighCardinality;
      return true;
    });
  }, [tableData, searchQuery, filterMode]);

  return (
    <div className="data-quality-view">
      <div className="quality-kpi-grid">
        <MetricCard
          title="Missing Values"
          value={formatNumber(missingStats.totalMissing)}
          subtitle={`${missingStats.affectedCols} columns affected`}
          icon={AlertTriangle}
          badge={missingStats.totalMissing === 0 ? 'Optimal' : `${missingStats.affectedCols} cols`}
          accent={missingStats.totalMissing === 0}
        />
        <MetricCard
          title="Duplicate Observations"
          value={formatNumber(duplicateRows.count)}
          subtitle={`${formatPercent(duplicateRows.percentage)} of dataset`}
          icon={Copy}
          badge={duplicateRows.count === 0 ? 'Zero Duplicates' : 'Action Required'}
        />
        <MetricCard
          title="Constant Columns"
          value={constantColumns.length}
          subtitle="Zero informational variance"
          icon={AlertOctagon}
          badge={constantColumns.length === 0 ? 'None Detected' : 'Prune'}
        />
        <MetricCard
          title="Total Features Audited"
          value={tableData.length}
          subtitle="Schema coverage"
          icon={ShieldCheck}
        />
      </div>

      <div className="quality-sections-container">
        <div className="quality-card">
          <div className="quality-card-header">
            <div className="quality-header-title">
              <ShieldCheck size={18} className="text-accent" />
              <h3>Feature Quality & Missingness Matrix</h3>
            </div>

            <div className="quality-header-actions">
              <div className="quality-search-box">
                <Search size={14} className="text-secondary" />
                <input
                  type="text"
                  placeholder="Filter feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="quality-search-input"
                />
              </div>

              <div className="quality-pill-filters">
                <button
                  className={`pill-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterMode('all')}
                >
                  All ({tableData.length})
                </button>
                <button
                  className={`pill-filter-btn ${filterMode === 'missing' ? 'active' : ''}`}
                  onClick={() => setFilterMode('missing')}
                >
                  Has Missing ({missingStats.affectedCols})
                </button>
                <button
                  className={`pill-filter-btn ${filterMode === 'clean' ? 'active' : ''}`}
                  onClick={() => setFilterMode('clean')}
                >
                  Clean ({tableData.length - missingStats.affectedCols})
                </button>
                <button
                  className={`pill-filter-btn ${filterMode === 'cardinality' ? 'active' : ''}`}
                  onClick={() => setFilterMode('cardinality')}
                >
                  High Cardinality
                </button>
              </div>
            </div>
          </div>

          <div className="quality-table-container">
            <table className="quality-data-table">
              <thead>
                <tr>
                  <th>Feature Column</th>
                  <th>Missing Count</th>
                  <th>Missing %</th>
                  <th style={{ minWidth: '140px' }}>Missing Ratio Indicator</th>
                  <th>Unique Values</th>
                  <th>Unique Ratio</th>
                  <th>Quality Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty-row">
                      No features matching the specified filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.column}>
                      <td className="col-name-cell">
                        <span className="font-semibold">{row.column}</span>
                        {row.isConstant && (
                          <span className="badge-tag-red">Constant</span>
                        )}
                      </td>
                      <td className="tabular-num">
                        {formatNumber(row.count)}
                      </td>
                      <td className="tabular-num">
                        {formatPercent(row.percentage)}
                      </td>
                      <td>
                        <DistributionBar
                          percentage={row.percentage}
                          status={row.status}
                          height={6}
                        />
                      </td>
                      <td className="tabular-num">
                        {typeof row.uniqueCount === 'number'
                          ? formatNumber(row.uniqueCount)
                          : row.uniqueCount}
                      </td>
                      <td className="tabular-num">
                        {typeof row.uniqueRatio === 'number'
                          ? formatPercent(row.uniqueRatio * 100)
                          : '—'}
                      </td>
                      <td>
                        {row.isHighCardinality ? (
                          <span className="badge-tag-purple">High Cardinality</span>
                        ) : row.count === 0 ? (
                          <span className="badge-tag-green">Clean</span>
                        ) : row.status === 'critical' ? (
                          <span className="badge-tag-red">Critical Loss</span>
                        ) : row.status === 'moderate' ? (
                          <span className="badge-tag-amber">Moderate</span>
                        ) : (
                          <span className="badge-tag-blue">Minor</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="quality-detail-grid">
          <div className="quality-subcard">
            <div className="subcard-header">
              <AlertOctagon size={16} className="text-accent" />
              <h4>Constant Column Audit</h4>
            </div>
            {constantColumns.length === 0 ? (
              <div className="subcard-empty">
                <CheckCircle2 size={24} className="text-success" />
                <p>No constant columns found. All features present variation.</p>
              </div>
            ) : (
              <div className="constant-cols-list">
                <p className="subcard-intro">
                  The following columns have 1 or fewer distinct values and provide zero predictive utility:
                </p>
                <div className="tag-cluster">
                  {constantColumns.map((col) => (
                    <span key={col} className="badge-tag-red">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="quality-subcard">
            <div className="subcard-header">
              <Layers size={16} className="text-accent" />
              <h4>High-Cardinality Safeguards</h4>
            </div>
            <div className="cardinality-summary">
              <p className="subcard-intro">
                High-cardinality categorical features (such as user IDs or freeform text) are automatically
                capped and summarized to prevent rendering bottlenecks.
              </p>
              <div className="high-card-stats-list">
                {tableData
                  .filter((r) => r.isHighCardinality)
                  .map((r) => (
                    <div key={r.column} className="high-card-item">
                      <span className="high-card-name">{r.column}</span>
                      <div className="high-card-meta">
                        <span>{formatNumber(r.uniqueCount)} uniques</span>
                        <span className="high-card-ratio">
                          {formatPercent(r.uniqueRatio * 100)} ratio
                        </span>
                      </div>
                    </div>
                  ))}
                {tableData.filter((r) => r.isHighCardinality).length === 0 && (
                  <div className="subcard-empty">
                    <CheckCircle2 size={20} className="text-success" />
                    <span>No unmanageable high-cardinality features detected.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
