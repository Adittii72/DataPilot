import { Sparkles, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export default function InsightsCard({ insights = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 size={16} className="insight-icon-positive" />;
      case 'warning':
        return <AlertTriangle size={16} className="insight-icon-warning" />;
      case 'negative':
        return <AlertOctagon size={16} className="insight-icon-negative" />;
      default:
        return <Info size={16} className="insight-icon-info" />;
    }
  };

  return (
    <div className="insights-card">
      <div className="insights-card-glow" />
      <div className="insights-card-header">
        <div className="insights-title-group">
          <div className="insights-badge">
            <Sparkles size={14} />
            <span>Automated Intelligence</span>
          </div>
          <h3>Decisions Powered by Data</h3>
          <p>Key observations synthesized automatically from dataset distributions</p>
        </div>
      </div>

      <div className="insights-list">
        {insights.length === 0 ? (
          <div className="insights-empty">No automated anomalies detected.</div>
        ) : (
          insights.map((item, index) => (
            <div key={index} className={`insight-item insight-${item.type}`}>
              <div className="insight-item-icon">{getIcon(item.type)}</div>
              <div className="insight-item-content">
                <div className="insight-item-header">
                  <span className="insight-item-title">{item.title}</span>
                  {item.tag && <span className="insight-item-tag">{item.tag}</span>}
                </div>
                <p className="insight-item-description">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
