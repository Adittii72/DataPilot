import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, ArrowRight, Loader2, X, Sparkles, ShieldCheck, BarChart3, Network } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function UploadSection({ onFileSelect, onAnalyze, selectedFile, onClearFile, isAnalyzing, error }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.csv')) {
        onFileSelect(droppedFile);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosenFile = e.target.files[0];
      if (chosenFile.name.toLowerCase().endsWith('.csv')) {
        onFileSelect(chosenFile);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="upload-page-container">
      <div className="upload-ambient-glow" />

      <div className="upload-hero">
        <div className="upload-brand-badge">
          <img src="/prism-logo.png" alt="PRISM" className="upload-brand-icon" />
          <span>PRISM INTELLIGENCE PLATFORM</span>
        </div>

        <h1 className="upload-title">
          Reveal what&apos;s inside <span className="upload-title-gradient">your data</span>
        </h1>

        <p className="upload-subtitle">
          Transform raw CSV files into actionable data science profiles, quality audits,
          statistical distributions, and exploratory intelligence in seconds.
        </p>
      </div>

      <div className="upload-card-wrapper">
        <div
          className={`upload-dropzone ${isDragOver ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!selectedFile ? triggerFileInput : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {!selectedFile ? (
            <div className="dropzone-idle">
              <div className="dropzone-icon-bubble">
                <UploadCloud size={34} />
              </div>
              <h3 className="dropzone-heading">Drop your CSV dataset here</h3>
              <p className="dropzone-subheading">or click to browse from your computer</p>
              <div className="dropzone-format-tag">
                <span>CSV files only</span>
                <span className="dropzone-dot">•</span>
                <span>Max 100MB</span>
              </div>
            </div>
          ) : (
            <div className="dropzone-selected">
              <div className="selected-file-card">
                <div className="selected-file-icon">
                  <FileSpreadsheet size={28} />
                </div>
                <div className="selected-file-info">
                  <span className="selected-file-name">{selectedFile.name}</span>
                  <span className="selected-file-size">{formatBytes(selectedFile.size)}</span>
                </div>
                {!isAnalyzing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearFile();
                    }}
                    className="selected-file-remove"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {!isAnalyzing ? (
                <div className="dropzone-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyze();
                    }}
                    className="analyze-cta-btn"
                  >
                    <span>Run Full Analysis</span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                    className="change-file-btn"
                  >
                    Choose Different File
                  </button>
                </div>
              ) : (
                <div className="analyzing-state-box">
                  <div className="analyzing-spinner-wrap">
                    <Loader2 size={36} className="spin-icon text-accent" />
                  </div>
                  <h4>Synthesizing Dataset Pipeline...</h4>
                  <p>Running profiling, statistical models, anomaly detection & correlation matrix</p>
                  <div className="analyzing-progress-track">
                    <div className="analyzing-progress-bar" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="upload-error-banner">
            <AlertCircle size={18} />
            <div className="upload-error-text">
              <strong>Analysis Error:</strong> {error}
            </div>
          </div>
        )}
      </div>

      <div className="upload-features-grid">
        <div className="feature-item">
          <div className="feature-icon feature-icon-purple">
            <Sparkles size={20} />
          </div>
          <h4>Dataset Profiling</h4>
          <p>Instant breakdown of column dtypes, records, numerical & categorical distribution.</p>
        </div>

        <div className="feature-item">
          <div className="feature-icon feature-icon-pink">
            <ShieldCheck size={20} />
          </div>
          <h4>Data Quality Audit</h4>
          <p>Pinpoint missing values, duplicate observations, constant columns & cardinality.</p>
        </div>

        <div className="feature-item">
          <div className="feature-icon feature-icon-blue">
            <BarChart3 size={20} />
          </div>
          <h4>Statistical Depth</h4>
          <p>Parametric moments, median, variance, std dev, range, mode, and skewness.</p>
        </div>

        <div className="feature-item">
          <div className="feature-icon feature-icon-violet">
            <Network size={20} />
          </div>
          <h4>Exploratory EDA</h4>
          <p>Visual correlation heatmaps, outlier bounds, frequency distributions, and crosstabs.</p>
        </div>
      </div>
    </div>
  );
}