export function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return new Intl.NumberFormat('en-US').format(val);
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(val);
  }
  return String(val);
}

export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return `${Number(val).toFixed(2)}%`;
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function cleanName(str) {
  if (!str) return '';
  return String(str)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSkewnessDescriptor(skew) {
  if (skew === null || skew === undefined || isNaN(skew)) {
    return { label: 'Unknown', status: 'neutral', text: 'No skew data' };
  }
  const val = Number(skew);
  if (Math.abs(val) <= 0.5) {
    return {
      label: 'Approx. Symmetric',
      status: 'success',
      text: 'Balanced normal-like distribution',
      val,
    };
  }
  if (val > 0.5) {
    return {
      label: val > 1 ? 'Highly Positive Skew' : 'Moderate Positive Skew',
      status: 'warning',
      text: 'Right-tailed distribution',
      val,
    };
  }
  return {
    label: val < -1 ? 'Highly Negative Skew' : 'Moderate Negative Skew',
    status: 'warning',
    text: 'Left-tailed distribution',
    val,
  };
}
