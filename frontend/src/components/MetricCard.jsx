export default function MetricCard({ title, value, subtitle, icon: Icon, badge, accent }) {
  return (
    <div className={`metric-card ${accent ? 'metric-card-accent' : ''}`}>
      <div className="metric-card-header">
        <span className="metric-card-title">{title}</span>
        {Icon && (
          <div className="metric-card-icon">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="metric-card-body">
        <div className="metric-card-value">{value}</div>
        {badge && <span className="metric-card-badge">{badge}</span>}
      </div>
      {subtitle && <div className="metric-card-subtitle">{subtitle}</div>}
    </div>
  );
}
