import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const PRISM_PALETTE = [
  '#a855f7', // Purple primary
  '#ec4899', // Pink secondary
  '#06b6d4', // Cyan
  '#10b981', // Emerald green
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export function buildChartData(chartType, data, col1, col2) {
  if (!Array.isArray(data) || data.length === 0) {
    return { labels: [], datasets: [] };
  }

  const normalizedType = (chartType || 'bar').toLowerCase();

  // 1. SCATTER PLOT
  if (normalizedType === 'scatter') {
    const points = data
      .filter((d) => d && d.x !== null && d.x !== undefined && d.y !== null && d.y !== undefined)
      .map((d) => ({ x: Number(d.x), y: Number(d.y) }));

    return {
      datasets: [
        {
          label: `${col1} vs ${col2}`,
          data: points,
          backgroundColor: 'rgba(168, 85, 247, 0.75)',
          borderColor: '#d8b4fe',
          borderWidth: 1,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#ec4899',
          pointHoverBorderColor: '#ffffff',
        },
      ],
    };
  }

  // 2. LINE CHART
  if (normalizedType === 'line') {
    const labels = data.map((d) => String(d.date || d.category || ''));
    const values = data.map((d) => Number(d.value || 0));

    return {
      labels,
      datasets: [
        {
          label: col2 || 'Value',
          data: values,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.12)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: values.length > 50 ? 2 : 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }

  // 3. BAR / GROUPED BAR
  const hasGroup = data.some((d) => d && d.group !== undefined);

  if (hasGroup) {
    // Grouped Bar chart
    const uniqueCategories = [...new Set(data.map((d) => String(d.category ?? '')))];
    const uniqueGroups = [...new Set(data.map((d) => String(d.group ?? '')))];

    const datasets = uniqueGroups.map((groupName, idx) => {
      const color = PRISM_PALETTE[idx % PRISM_PALETTE.length];
      const groupData = uniqueCategories.map((cat) => {
        const item = data.find(
          (d) => String(d.category) === cat && String(d.group) === groupName
        );
        return item ? Number(item.value || 0) : 0;
      });

      return {
        label: groupName,
        data: groupData,
        backgroundColor: color,
        borderRadius: 4,
        borderSkipped: false,
      };
    });

    return {
      labels: uniqueCategories,
      datasets,
    };
  }

  // Standard Bar chart
  const labels = data.map((d) => String(d.category ?? ''));
  const values = data.map((d) => Number(d.value ?? 0));

  // Generate subtle varied purple-to-pink gradient tones
  const backgroundColors = values.map((_, i) => {
    return PRISM_PALETTE[i % PRISM_PALETTE.length];
  });

  return {
    labels,
    datasets: [
      {
        label: col2 || 'Value',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#ec4899',
      },
    ],
  };
}

export function buildChartOptions(chartType, col1, col2) {
  const normalizedType = (chartType || 'bar').toLowerCase();
  const isScatter = normalizedType === 'scatter';

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: isScatter || normalizedType === 'grouped_bar',
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: {
            family: 'Plus Jakarta Sans',
            size: 12,
            weight: '500',
          },
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#171821',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.14)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: 'Outfit',
          size: 13,
          weight: '600',
        },
        bodyFont: {
          family: 'Plus Jakarta Sans',
          size: 12,
        },
        callbacks: isScatter
          ? {
              label: (context) => {
                const p = context.raw || {};
                return ` ${col1}: ${p.x}, ${col2}: ${p.y}`;
              },
            }
          : undefined,
      },
    },
    scales: {
      x: {
        type: isScatter ? 'linear' : 'category',
        position: 'bottom',
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          tickColor: 'transparent',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Plus Jakarta Sans',
            size: 11,
          },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 20,
        },
        title: {
          display: true,
          text: col1 || 'X Axis',
          color: '#64748b',
          font: {
            family: 'Plus Jakarta Sans',
            size: 12,
            weight: '600',
          },
          padding: { top: 8 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          tickColor: 'transparent',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Plus Jakarta Sans',
            size: 11,
          },
        },
        title: {
          display: true,
          text: col2 || 'Y Axis',
          color: '#64748b',
          font: {
            family: 'Plus Jakarta Sans',
            size: 12,
            weight: '600',
          },
          padding: { bottom: 8 },
        },
      },
    },
  };
}
