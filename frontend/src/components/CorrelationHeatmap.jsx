import { useState, useMemo } from 'react';
import { SlidersHorizontal, Info } from 'lucide-react';

export default function CorrelationHeatmap({ correlations = {} }) {
  const [minThreshold, setMinThreshold] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);

  const columns = useMemo(() => {
    return Object.keys(correlations || {});
  }, [correlations]);

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return columns;
    const query = searchQuery.toLowerCase();
    return columns.filter((col) => col.toLowerCase().includes(query));
  }, [columns, searchQuery]);

  if (columns.length === 0) {
    return (
      <div className="heatmap-empty-state">
        <Info size={28} className="text-secondary" />
        <h4>No Numerical Correlations</h4>
        <p>This dataset does not contain two or more numerical columns to compute correlations.</p>
      </div>
    );
  }

  const getCellColor = (val) => {
    if (val === null || val === undefined || isNaN(val)) {
      return 'rgba(255, 255, 255, 0.03)';
    }

    if (Math.abs(val) < minThreshold && Math.abs(val) < 0.999) {
      return 'rgba(255, 255, 255, 0.02)';
    }

    if (val >= 0) {
      const alpha = Math.min(1, Math.max(0.12, Math.pow(val, 1.2)));
      return `rgba(236, 72, 153, ${alpha})`;
    } else {
      const alpha = Math.min(1, Math.max(0.12, Math.pow(Math.abs(val), 1.2)));
      return `rgba(139, 92, 246, ${alpha})`;
    }
  };

  const getCellTextColor = (val) => {
    if (Math.abs(val) > 0.45) return '#ffffff';
    return '#94a3b8';
  };

  const getCorrelationStrength = (val) => {
    if (val === 1) return 'Perfect Positive (Diagonal)';
    if (val === -1) return 'Perfect Negative';
    const abs = Math.abs(val);
    const dir = val > 0 ? 'Positive' : 'Negative';
    if (abs >= 0.7) return `Strong ${dir}`;
    if (abs >= 0.4) return `Moderate ${dir}`;
    if (abs >= 0.2) return `Weak ${dir}`;
    return 'Negligible / Uncorrelated';
  };

  return (
    <div className="heatmap-container-card">
      <div className="heatmap-controls-bar">
        <div className="heatmap-filter-group">
          <span className="heatmap-filter-label">
            <SlidersHorizontal size={14} />
            <span>Filter |r| &ge; {minThreshold.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={minThreshold}
            onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
            className="heatmap-slider"
          />
          {minThreshold > 0 && (
            <button
              onClick={() => setMinThreshold(0)}
              className="heatmap-reset-btn"
            >
              Reset
            </button>
          )}
        </div>

        {columns.length > 6 && (
          <div className="heatmap-search-wrap">
            <input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="heatmap-search-input"
            />
          </div>
        )}

        <div className="heatmap-legend">
          <span className="legend-label">-1.0 (Inverse)</span>
          <div className="legend-gradient-bar" />
          <span className="legend-label">+1.0 (Direct)</span>
        </div>
      </div>

      <div className="heatmap-matrix-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-corner-cell">Features</th>
              {filteredColumns.map((col) => (
                <th key={col} className="heatmap-col-header" title={col}>
                  <div className="heatmap-col-header-text">{col}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredColumns.map((rowCol) => (
              <tr key={rowCol}>
                <td className="heatmap-row-header" title={rowCol}>
                  {rowCol}
                </td>
                {filteredColumns.map((colCol) => {
                  const val = correlations[rowCol]?.[colCol];
                  const isHovered =
                    hoveredCell?.row === rowCol && hoveredCell?.col === colCol;

                  return (
                    <td
                      key={colCol}
                      className={`heatmap-cell ${isHovered ? 'cell-hovered' : ''}`}
                      style={{
                        backgroundColor: getCellColor(val),
                        color: getCellTextColor(val),
                      }}
                      onMouseEnter={() =>
                        setHoveredCell({ row: rowCol, col: colCol, val })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {typeof val === 'number' ? val.toFixed(2) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && typeof hoveredCell.val === 'number' && (
        <div className="heatmap-floating-tooltip">
          <div className="tooltip-pair">
            <span>{hoveredCell.row}</span>
            <span className="tooltip-separator">&harr;</span>
            <span>{hoveredCell.col}</span>
          </div>
          <div className="tooltip-meta">
            <span className="tooltip-score">
              r = {hoveredCell.val > 0 ? `+${hoveredCell.val.toFixed(4)}` : hoveredCell.val.toFixed(4)}
            </span>
            <span className="tooltip-badge">
              {getCorrelationStrength(hoveredCell.val)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
