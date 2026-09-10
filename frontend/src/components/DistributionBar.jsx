export default function DistributionBar({ percentage = 0, status = 'default', height = 6 }) {
  const clamped = Math.max(0, Math.min(100, Number(percentage) || 0));

  const getBarColor = () => {
    if (status === 'danger' || clamped > 20) return 'var(--danger)';
    if (status === 'warning' || clamped > 5) return 'var(--warning)';
    if (status === 'success' || clamped === 0) return 'var(--success)';
    return 'var(--accent-primary)';
  };

  return (
    <div className="dist-bar-track" style={{ height: `${height}px` }}>
      <div
        className="dist-bar-fill"
        style={{
          width: `${clamped}%`,
          backgroundColor: getBarColor(),
        }}
      />
    </div>
  );
}
