import { X, Sliders, Moon, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Sliders size={18} className="text-accent" />
            <h3>PRISM Settings</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Interface Theme</span>
              <span className="setting-desc">Obsidian dark mode tailored for data science</span>
            </div>
            <div className="setting-pill-active">
              <Moon size={14} />
              <span>Dark Aurora (Default)</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">High-Precision Decimal Formatting</span>
              <span className="setting-desc">Display up to 4 decimals for variances and skewness</span>
            </div>
            <div className="setting-toggle-active">
              <Check size={14} />
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">API Gateway Target</span>
              <span className="setting-desc">http://127.0.0.1:8000 (Django) &rarr; :8001 (FastAPI)</span>
            </div>
            <span className="setting-badge-green">Connected</span>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-modal-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
