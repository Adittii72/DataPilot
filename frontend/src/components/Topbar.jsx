import { FileSpreadsheet, PlusCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function Topbar({ filename, shape, onNewDataset, onRefreshAnalysis, isAnalyzing }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-file-pill">
          <FileSpreadsheet size={16} className="topbar-file-icon" />
          <span className="topbar-file-name">{filename || 'Dataset Analysis'}</span>
          <span className="topbar-file-status">
            <CheckCircle size={12} />
            <span>Ready</span>
          </span>
        </div>

        {shape && (
          <div className="topbar-meta">
            <span className="topbar-meta-item">
              <strong>{formatNumber(shape.rows)}</strong> rows
            </span>
            <span className="topbar-meta-dot">•</span>
            <span className="topbar-meta-item">
              <strong>{formatNumber(shape.columns)}</strong> columns
            </span>
          </div>
        )}
      </div>

      <div className="topbar-right">
        {onRefreshAnalysis && (
          <button
            onClick={onRefreshAnalysis}
            disabled={isAnalyzing}
            className="topbar-btn topbar-btn-secondary"
            title="Re-run analysis"
          >
            <RefreshCw size={15} className={isAnalyzing ? 'spin-icon' : ''} />
            <span>Re-analyze</span>
          </button>
        )}

        <button onClick={onNewDataset} className="topbar-btn topbar-btn-primary">
          <PlusCircle size={15} />
          <span>New Dataset</span>
        </button>
      </div>
    </header>
  );
}
