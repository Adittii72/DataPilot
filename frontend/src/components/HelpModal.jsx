import { X, HelpCircle, Layers, ShieldCheck, BarChart2, Sparkles } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-container-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <HelpCircle size={18} className="text-accent" />
            <h3>PRISM Knowledge & Reference</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body help-grid">
          <div className="help-section-card">
            <div className="help-section-header">
              <Layers size={16} className="text-accent" />
              <h4>Overview & Profiling</h4>
            </div>
            <p>
              Provides global dataset geometry: total observation rows, feature count,
              and classification into numerical and categorical variables.
            </p>
          </div>

          <div className="help-section-card">
            <div className="help-section-header">
              <ShieldCheck size={16} className="text-accent" />
              <h4>Data Quality Metrics</h4>
            </div>
            <p>
              Scans for missing values (count and ratio), duplicate observations, constant
              columns with zero variance, and cardinality metrics to highlight potential IDs or noisy variables.
            </p>
          </div>

          <div className="help-section-card">
            <div className="help-section-header">
              <BarChart2 size={16} className="text-accent" />
              <h4>Statistical Distributions</h4>
            </div>
            <p>
              Calculates parametric and non-parametric properties including mean, median, mode,
              variance, standard deviation, min, max, range, and Pearson/Fisher skewness.
            </p>
          </div>

          <div className="help-section-card">
            <div className="help-section-header">
              <Sparkles size={16} className="text-accent" />
              <h4>Exploratory Data Analysis (EDA)</h4>
            </div>
            <p>
              Performs IQR-based outlier thresholding (Q1 - 1.5*IQR, Q3 + 1.5*IQR), Pearson
              correlation matrices, rare-category detection, and grouped numerical-categorical relationships.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-modal-primary">
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
}
