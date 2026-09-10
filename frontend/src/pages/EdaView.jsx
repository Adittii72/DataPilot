import { useState, useMemo } from 'react';
import {
  Flame,
  AlertTriangle,
  Activity,
  BarChart3,
  Sparkles,
  GitFork,
  Grid,
  Search,
} from 'lucide-react';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import DistributionBar from '../components/DistributionBar';
import {
  formatNumber,
  formatPercent,
  getSkewnessDescriptor,
} from '../utils/formatters';

export default function EdaView({ analysis }) {
  const [activeSubTab, setActiveSubTab] = useState('correlations');
  const [outlierSearch, setOutlierSearch] = useState('');
  const [selectedNumCatPair, setSelectedNumCatPair] = useState({
    cat: '',
    num: '',
  });
  const [selectedCrossTabKey, setSelectedCrossTabKey] = useState('');

  const eda = analysis?.eda || {};
  const correlations = eda.correlations || {};
  const frequencies = eda.value_frequencies || {};
  const rareCategories = eda.rare_categories || {};
  const numCatRels = eda.numerical_categorical_relationships || {};
  const catRels = eda.categorical_relationships || {};

  const outlierEntries = useMemo(() => {
    const out = analysis?.eda?.outliers || {};
    return Object.entries(out).map(([col, data]) => ({
      column: col,
      count: data.count,
      percentage: data.percentage,
      lower_bound: data.lower_bound,
      upper_bound: data.upper_bound,
    }));
  }, [analysis]);

  const filteredOutliers = useMemo(() => {
    return outlierEntries.filter((o) =>
      o.column.toLowerCase().includes(outlierSearch.toLowerCase())
    );
  }, [outlierEntries, outlierSearch]);

  const skewnessEntries = useMemo(() => {
    const sk = analysis?.eda?.skewness || {};
    return Object.entries(sk).map(([col, val]) => ({
      column: col,
      value: val,
      desc: getSkewnessDescriptor(val),
    }));
  }, [analysis]);

  const numCatCategories = Object.keys(numCatRels);
  const currentCat = selectedNumCatPair.cat || numCatCategories[0] || '';
  const currentCatNumCols = currentCat ? Object.keys(numCatRels[currentCat] || {}) : [];
  const currentNum = selectedNumCatPair.num || currentCatNumCols[0] || '';

  const activeNumCatData = useMemo(() => {
    const rels = analysis?.eda?.numerical_categorical_relationships || {};
    if (!currentCat || !currentNum || !rels[currentCat]?.[currentNum]) {
      return null;
    }
    const raw = rels[currentCat][currentNum];
    const means = raw.mean || {};
    const medians = raw.median || {};
    const counts = raw.count || {};
    const categories = Object.keys(counts);

    return categories.map((catVal) => ({
      category: catVal,
      count: counts[catVal],
      mean: means[catVal],
      median: medians[catVal],
    }));
  }, [analysis, currentCat, currentNum]);

  const crossTabKeys = Object.keys(catRels);
  const activeCrossTabKey = selectedCrossTabKey || crossTabKeys[0] || '';
  const activeCrossTabData = useMemo(() => {
    const r = analysis?.eda?.categorical_relationships || {};
    if (!activeCrossTabKey || !r[activeCrossTabKey]) return null;
    const raw = r[activeCrossTabKey];
    const col2Keys = Object.keys(raw);
    if (col2Keys.length === 0) return null;
    const col1Keys = Object.keys(raw[col2Keys[0]] || {});

    return {
      col2Keys,
      col1Keys,
      matrix: raw,
    };
  }, [analysis, activeCrossTabKey]);

  const subTabs = [
    { id: 'correlations', label: 'Correlations', icon: Flame },
    { id: 'outliers', label: 'Outlier Analysis', icon: AlertTriangle },
    { id: 'skewness', label: 'Skewness Spectrum', icon: Activity },
    { id: 'frequencies', label: 'Value Frequencies', icon: BarChart3 },
    { id: 'rare', label: 'Rare Categories', icon: Sparkles },
    { id: 'numcat', label: 'Feature Relationships', icon: GitFork },
    { id: 'crosstabs', label: 'Categorical Crosstabs', icon: Grid },
  ];

  return (
    <div className="eda-view">
      <div className="eda-subnav-bar">
        <div className="eda-subnav-pills">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`eda-subnav-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="eda-content-container">
        {activeSubTab === 'correlations' && (
          <div className="eda-section">
            <div className="section-intro">
              <div className="section-intro-text">
                <h3>Linear Correlation Matrix</h3>
                <p>
                  Interactive Pearson pairwise correlation heatmap with hover tooltips and dynamic intensity filters.
                </p>
              </div>
            </div>
            <CorrelationHeatmap correlations={correlations} />
          </div>
        )}

        {activeSubTab === 'outliers' && (
          <div className="eda-section">
            <div className="section-intro">
              <div className="section-intro-text">
                <h3>Tukey&apos;s IQR Outlier Detection</h3>
                <p>
                  Outliers computed using interquartile range thresholds [Q1 - 1.5&times;IQR, Q3 + 1.5&times;IQR].
                </p>
              </div>
              <div className="section-search-box">
                <Search size={14} className="text-secondary" />
                <input
                  type="text"
                  placeholder="Filter numerical feature..."
                  value={outlierSearch}
                  onChange={(e) => setOutlierSearch(e.target.value)}
                  className="section-search-input"
                />
              </div>
            </div>

            {filteredOutliers.length === 0 ? (
              <div className="eda-empty-box">No numerical features found.</div>
            ) : (
              <div className="outliers-grid">
                {filteredOutliers.map((item) => (
                  <div key={item.column} className="outlier-card">
                    <div className="outlier-card-top">
                      <span className="outlier-card-title">{item.column}</span>
                      <span
                        className={`outlier-badge ${
                          item.count > 0 ? 'badge-tag-amber' : 'badge-tag-green'
                        }`}
                      >
                        {item.count > 0 ? `${formatNumber(item.count)} Outliers` : 'Clean'}
                      </span>
                    </div>

                    <div className="outlier-metric-row">
                      <div className="outlier-stat">
                        <span className="outlier-stat-label">Percentage</span>
                        <span className="outlier-stat-val">
                          {formatPercent(item.percentage)}
                        </span>
                      </div>
                      <div className="outlier-stat">
                        <span className="outlier-stat-label">IQR Bounds</span>
                        <span className="outlier-stat-val">
                          [{formatNumber(item.lower_bound)} , {formatNumber(item.upper_bound)}]
                        </span>
                      </div>
                    </div>

                    <div className="outlier-progress-wrap">
                      <DistributionBar
                        percentage={item.percentage}
                        status={item.percentage > 5 ? 'warning' : 'default'}
                        height={6}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'skewness' && (
          <div className="eda-section">
            <div className="section-intro">
              <div className="section-intro-text">
                <h3>Distribution Skewness Spectrum</h3>
                <p>
                  Quantifies feature asymmetry: Approx. Symmetric (&plusmn;0.5), Moderate Skew (0.5 to 1.0), and Highly Skewed (&gt;1.0).
                </p>
              </div>
            </div>

            <div className="skewness-grid">
              {skewnessEntries.map((item) => (
                <div key={item.column} className="skewness-card">
                  <div className="skewness-card-header">
                    <span className="skewness-card-title">{item.column}</span>
                    <span className={`skew-tag skew-tag-${item.desc.status}`}>
                      {item.desc.label}
                    </span>
                  </div>

                  <div className="skewness-val-display">
                    <span className="skewness-large-number">
                      {typeof item.value === 'number' ? item.value.toFixed(4) : '—'}
                    </span>
                    <span className="skewness-sub">{item.desc.text}</span>
                  </div>

                  <div className="skewness-visual-gauge">
                    <div className="gauge-axis">
                      <span className="axis-label">-3</span>
                      <span className="axis-center">0 (Normal)</span>
                      <span className="axis-label">+3</span>
                    </div>
                    <div className="gauge-track">
                      <div
                        className="gauge-pointer"
                        style={{
                          left: `${Math.max(0, Math.min(100, ((Number(item.value) + 3) / 6) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'frequencies' && (
          <div className="eda-section">
            <div className="section-intro">
              <div className="section-intro-text">
                <h3>Categorical Value Frequencies</h3>
                <p>
                  Top value frequencies for low-cardinality categorical variables, with high-cardinality columns summarized safely.
                </p>
              </div>
            </div>

            {Object.keys(frequencies).length === 0 ? (
              <div className="eda-empty-box">No categorical features present.</div>
            ) : (
              <div className="frequencies-grid">
                {Object.entries(frequencies).map(([col, freqData]) => {
                  if (freqData.high_cardinality) {
                    return (
                      <div key={col} className="freq-card freq-card-high-card">
                        <div className="freq-card-header">
                          <span className="freq-card-title">{col}</span>
                          <span className="badge-tag-purple">High Cardinality</span>
                        </div>
                        <div className="freq-high-card-body">
                          <p>
                            Contains <strong>{formatNumber(freqData.unique_count)}</strong> distinct
                            values ({formatPercent(freqData.unique_ratio * 100)} uniqueness ratio).
                          </p>
                          <span className="freq-safe-note">
                            Safeguarded: Displaying summary to prevent UI bloat.
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const entries = Object.entries(freqData || {});
                  const maxCount = entries.reduce((max, curr) => Math.max(max, curr[1]), 1);

                  return (
                    <div key={col} className="freq-card">
                      <div className="freq-card-header">
                        <span className="freq-card-title">{col}</span>
                        <span className="freq-distinct-tag">
                          {entries.length} Top Categories
                        </span>
                      </div>

                      <div className="freq-bars-list">
                        {entries.map(([catVal, count]) => {
                          const barWidth = (count / maxCount) * 100;
                          return (
                            <div key={catVal} className="freq-bar-item">
                              <div className="freq-bar-info">
                                <span className="freq-bar-name" title={catVal}>
                                  {String(catVal)}
                                </span>
                                <span className="freq-bar-count">
                                  {formatNumber(count)}
                                </span>
                              </div>
                              <div className="freq-bar-track">
                                <div
                                  className="freq-bar-fill"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'rare' && (
          <div className="eda-section">
            <div className="section-intro">
              <div className="section-intro-text">
                <h3>Rare Categories (&lt; 1% Frequency)</h3>
                <p>
                  Identifies uncommon categories with less than 1% observation frequency across categorical columns.
                </p>
              </div>
            </div>

            {Object.keys(rareCategories).length === 0 ? (
              <div className="eda-empty-box">No categorical features analyzed for rare values.</div>
            ) : (
              <div className="rare-grid">
                {Object.entries(rareCategories).map(([col, data]) => {
                  if (data?.high_cardinality) {
                    return (
                      <div key={col} className="rare-card">
                        <div className="rare-card-header">
                          <span className="rare-col-title">{col}</span>
                          <span className="badge-tag-purple">High Cardinality</span>
                        </div>
                        <p className="rare-empty-note">
                          Skipped rare calculation due to high uniqueness count ({formatNumber(data.unique_count)}).
                        </p>
                      </div>
                    );
                  }

                  const rareItems = Object.entries(data || {});

                  return (
                    <div key={col} className="rare-card">
                      <div className="rare-card-header">
                        <span className="rare-col-title">{col}</span>
                        <span className="badge-tag-blue">
                          {rareItems.length} Rare Categories
                        </span>
                      </div>

                      {rareItems.length === 0 ? (
                        <div className="rare-clean-note">
                          No rare categories under 1% threshold in this feature.
                        </div>
                      ) : (
                        <div className="rare-items-scroll">
                          <table className="rare-table">
                            <thead>
                              <tr>
                                <th>Category Value</th>
                                <th>Observations</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rareItems.map(([val, count]) => (
                                <tr key={val}>
                                  <td className="rare-val-name">{String(val)}</td>
                                  <td className="tabular-num">{formatNumber(count)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'numcat' && (
          <div className="eda-section">
            <div className="section-intro">
              <div className="section-intro-text">
                <h3>Numerical &times; Categorical Relationships</h3>
                <p>
                  Grouped statistical properties (mean, median, observation count) of numerical variables stratified by categorical levels.
                </p>
              </div>

              {numCatCategories.length > 0 && (
                <div className="numcat-selectors">
                  <div className="numcat-select-wrap">
                    <label>Categorical Feature:</label>
                    <select
                      value={currentCat}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const subCols = Object.keys(numCatRels[newCat] || {});
                        setSelectedNumCatPair({
                          cat: newCat,
                          num: subCols[0] || '',
                        });
                      }}
                      className="numcat-select"
                    >
                      {numCatCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="numcat-select-wrap">
                    <label>Numerical Feature:</label>
                    <select
                      value={currentNum}
                      onChange={(e) =>
                        setSelectedNumCatPair((prev) => ({
                          ...prev,
                          num: e.target.value,
                        }))
                      }
                      className="numcat-select"
                    >
                      {currentCatNumCols.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {!activeNumCatData || activeNumCatData.length === 0 ? (
              <div className="eda-empty-box">
                No numerical-categorical pairs available to compute stratified relationships.
              </div>
            ) : (
              <div className="numcat-table-card">
                <div className="numcat-card-header">
                  <h4>
                    <span>{currentNum}</span>
                    <span className="text-secondary">&nbsp;stratified by&nbsp;</span>
                    <span className="text-accent">{currentCat}</span>
                  </h4>
                </div>

                <table className="stats-data-table">
                  <thead>
                    <tr>
                      <th>{currentCat} (Category)</th>
                      <th>Observations Count</th>
                      <th>Mean {currentNum}</th>
                      <th>Median {currentNum}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeNumCatData.map((row) => (
                      <tr key={row.category}>
                        <td className="font-semibold col-name-cell">{String(row.category)}</td>
                        <td className="tabular-num">{formatNumber(row.count)}</td>
                        <td className="tabular-num">{formatNumber(row.mean)}</td>
                        <td className="tabular-num">{formatNumber(row.median)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'crosstabs' && (
          <div className="eda-section">
            <div className="section-intro">
              <div className="section-intro-text">
                <h3>Categorical Cross-Tabulations</h3>
                <p>
                  Contingency matrices showing observation distributions across categorical feature pairings.
                </p>
              </div>

              {crossTabKeys.length > 0 && (
                <div className="crosstab-selector-wrap">
                  <label>Select Pair:</label>
                  <select
                    value={activeCrossTabKey}
                    onChange={(e) => setSelectedCrossTabKey(e.target.value)}
                    className="numcat-select"
                  >
                    {crossTabKeys.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!activeCrossTabData ? (
              <div className="eda-empty-box">
                At least two categorical features are required to compute two-way crosstabs.
              </div>
            ) : (
              <div className="crosstab-table-card">
                <div className="crosstab-card-header">
                  <h4>{activeCrossTabKey} Contingency Matrix</h4>
                </div>

                <div className="crosstab-table-scroll">
                  <table className="stats-data-table crosstab-table">
                    <thead>
                      <tr>
                        <th>Levels</th>
                        {activeCrossTabData.col2Keys.map((col2Val) => (
                          <th key={col2Val} className="tabular-num">
                            {String(col2Val)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeCrossTabData.col1Keys.map((col1Val) => (
                        <tr key={col1Val}>
                          <td className="font-semibold col-name-cell">{String(col1Val)}</td>
                          {activeCrossTabData.col2Keys.map((col2Val) => {
                            const count =
                              activeCrossTabData.matrix[col2Val]?.[col1Val] ?? 0;
                            return (
                              <td key={col2Val} className="tabular-num">
                                {formatNumber(count)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
