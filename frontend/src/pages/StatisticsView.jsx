import { useState, useMemo } from 'react';
import { Search, Hash, Type, ArrowUpDown } from 'lucide-react';
import { formatNumber, getSkewnessDescriptor } from '../utils/formatters';

export default function StatisticsView({ analysis }) {
  const [activeTab, setActiveTab] = useState('numerical');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const numericalRows = useMemo(() => {
    const stats = analysis?.statistics?.numerical_statistics || {};
    return Object.entries(stats).map(([column, data]) => {
      const minVal = data.min ?? data.mid;
      return {
        column,
        count: data.count,
        mean: data.mean,
        median: data.median,
        mode: data.mode,
        variance: data.variance,
        std: data.standard_deviation,
        min: minVal,
        max: data.max,
        range: data.range,
        skewness: data.skewness,
      };
    });
  }, [analysis]);

  const categoricalRows = useMemo(() => {
    const stats = analysis?.statistics?.categorical_statistics || {};
    return Object.entries(stats).map(([column, data]) => {
      return {
        column,
        count: data.count,
        unique: data.unique,
        mode: data.mode,
        mode_frequency: data.mode_frequency,
      };
    });
  }, [analysis]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredNumericalRows = useMemo(() => {
    let rows = numericalRows.filter((r) =>
      r.column.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        if (valA === null || valA === undefined) valA = -Infinity;
        if (valB === null || valB === undefined) valB = -Infinity;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }
    return rows;
  }, [numericalRows, searchQuery, sortField, sortDirection]);

  const filteredCategoricalRows = useMemo(() => {
    let rows = categoricalRows.filter((r) =>
      r.column.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        if (valA === null || valA === undefined) valA = -Infinity;
        if (valB === null || valB === undefined) valB = -Infinity;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }
    return rows;
  }, [categoricalRows, searchQuery, sortField, sortDirection]);

  return (
    <div className="statistics-view">
      <div className="stats-header-bar">
        <div className="stats-tabs-switch">
          <button
            className={`stats-tab-btn ${activeTab === 'numerical' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('numerical');
              setSortField(null);
            }}
          >
            <Hash size={16} />
            <span>Numerical Features ({numericalRows.length})</span>
          </button>
          <button
            className={`stats-tab-btn ${activeTab === 'categorical' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('categorical');
              setSortField(null);
            }}
          >
            <Type size={16} />
            <span>Categorical Features ({categoricalRows.length})</span>
          </button>
        </div>

        <div className="stats-search-wrap">
          <Search size={14} className="text-secondary" />
          <input
            type="text"
            placeholder="Search feature names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="stats-search-input"
          />
        </div>
      </div>

      <div className="stats-card">
        {activeTab === 'numerical' ? (
          numericalRows.length === 0 ? (
            <div className="stats-empty">
              No numerical columns present in this dataset.
            </div>
          ) : (
            <div className="stats-table-wrapper">
              <table className="stats-data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('column')} className="sortable-th">
                      <div className="th-content">
                        <span>Feature</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('count')} className="sortable-th">
                      <div className="th-content">
                        <span>Count</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('mean')} className="sortable-th">
                      <div className="th-content">
                        <span>Mean</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('median')} className="sortable-th">
                      <div className="th-content">
                        <span>Median</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('mode')} className="sortable-th">
                      <div className="th-content">
                        <span>Mode</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('variance')} className="sortable-th">
                      <div className="th-content">
                        <span>Variance</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('std')} className="sortable-th">
                      <div className="th-content">
                        <span>Std Dev</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('min')} className="sortable-th">
                      <div className="th-content">
                        <span>Min</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('max')} className="sortable-th">
                      <div className="th-content">
                        <span>Max</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('range')} className="sortable-th">
                      <div className="th-content">
                        <span>Range</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('skewness')} className="sortable-th">
                      <div className="th-content">
                        <span>Skewness</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNumericalRows.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="table-empty-row">
                        No numerical features match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredNumericalRows.map((r) => {
                      const skewDesc = getSkewnessDescriptor(r.skewness);
                      return (
                        <tr key={r.column}>
                          <td className="font-semibold col-name-cell">{r.column}</td>
                          <td className="tabular-num">{formatNumber(r.count)}</td>
                          <td className="tabular-num">{formatNumber(r.mean)}</td>
                          <td className="tabular-num">{formatNumber(r.median)}</td>
                          <td className="tabular-num">{formatNumber(r.mode)}</td>
                          <td className="tabular-num">{formatNumber(r.variance)}</td>
                          <td className="tabular-num">{formatNumber(r.std)}</td>
                          <td className="tabular-num">{formatNumber(r.min)}</td>
                          <td className="tabular-num">{formatNumber(r.max)}</td>
                          <td className="tabular-num">{formatNumber(r.range)}</td>
                          <td className="tabular-num">
                            <span
                              className={`skew-tag skew-tag-${skewDesc.status}`}
                              title={skewDesc.text}
                            >
                              {formatNumber(r.skewness)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : categoricalRows.length === 0 ? (
          <div className="stats-empty">
            No categorical columns present in this dataset.
          </div>
        ) : (
          <div className="stats-table-wrapper">
            <table className="stats-data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('column')} className="sortable-th">
                    <div className="th-content">
                      <span>Feature</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('count')} className="sortable-th">
                    <div className="th-content">
                      <span>Count</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('unique')} className="sortable-th">
                    <div className="th-content">
                      <span>Unique Values</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('mode')} className="sortable-th">
                    <div className="th-content">
                      <span>Mode (Top Value)</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('mode_frequency')} className="sortable-th">
                    <div className="th-content">
                      <span>Mode Frequency</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategoricalRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty-row">
                      No categorical features match your search.
                    </td>
                  </tr>
                ) : (
                  filteredCategoricalRows.map((r) => (
                    <tr key={r.column}>
                      <td className="font-semibold col-name-cell">{r.column}</td>
                      <td className="tabular-num">{formatNumber(r.count)}</td>
                      <td className="tabular-num">{formatNumber(r.unique)}</td>
                      <td>
                        <span className="mode-val-tag">
                          {r.mode !== null && r.mode !== undefined ? String(r.mode) : '—'}
                        </span>
                      </td>
                      <td className="tabular-num">{formatNumber(r.mode_frequency)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
