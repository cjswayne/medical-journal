import { useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics';
import { EFFECT_KEYS, EFFECT_LABELS, STRAIN_TYPES } from '../utils/constants';
import { capitalize } from '../utils/formatters';
import styles from '../styles/Analytics.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
);

const TEXT_PRIMARY = '#E8F5E9';
const TEXT_SECONDARY = '#A5D6A7';
const GRID_GREEN = '#1B5E20';
const TOOLTIP_BG = '#0D1B0E';
const TOOLTIP_BORDER = '#2E4830';

ChartJS.defaults.color = TEXT_PRIMARY;
ChartJS.defaults.borderColor = GRID_GREEN;
ChartJS.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
ChartJS.defaults.plugins.legend.labels.color = TEXT_PRIMARY;
ChartJS.defaults.scale.grid.color = GRID_GREEN;
ChartJS.defaults.plugins.tooltip.backgroundColor = TOOLTIP_BG;
ChartJS.defaults.plugins.tooltip.titleColor = TEXT_PRIMARY;
ChartJS.defaults.plugins.tooltip.bodyColor = TEXT_SECONDARY;
ChartJS.defaults.plugins.tooltip.borderColor = TOOLTIP_BORDER;

const DOUGHNUT_COLORS = [
  '#4CAF50',
  '#7B1FA2',
  '#FFD600',
  '#D32F2F',
  '#1B5E20',
  '#66BB6A',
  '#A5D6A7',
  '#2E4830',
];

const METHOD_COLORS = [
  '#7B1FA2',
  '#4CAF50',
  '#FFD600',
  '#D32F2F',
  '#1B5E20',
  '#66BB6A',
  '#A5D6A7',
];

const formatMonthLabel = (ym) => {
  if (!ym || typeof ym !== 'string') return '';
  const parts = ym.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (!y || !m || m < 1 || m > 12) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const chartOptionsBase = {
  responsive: true,
  maintainAspectRatio: true,
};

const hasNumericEffects = (effectsAvg) =>
  effectsAvg &&
  Object.values(effectsAvg).some((v) => v !== null && v !== undefined && !Number.isNaN(Number(v)));

const hasAnyAnalyticsData = (d) => {
  if (!d) return false;
  const spend =
    Array.isArray(d.spendingOverTime) &&
    d.spendingOverTime.some((row) => Number(row?.total) > 0);
  return (
    (Array.isArray(d.strainFrequency) && d.strainFrequency.length > 0) ||
    (Array.isArray(d.avgRatings) && d.avgRatings.length > 0) ||
    hasNumericEffects(d.effectsAvg) ||
    spend ||
    (Array.isArray(d.formBreakdown) && d.formBreakdown.length > 0) ||
    (Array.isArray(d.methodBreakdown) && d.methodBreakdown.length > 0) ||
    (Array.isArray(d.topTerpenes) && d.topTerpenes.length > 0)
  );
};

const AnalyticsPage = () => {
  const { data, loading, error, fetchAnalytics } = useAnalytics();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const ratingsByType = useMemo(() => {
    const map = {};
    (data?.avgRatings || []).forEach((row) => {
      const key = String(row.strainType || '').toLowerCase();
      map[key] = row;
    });
    return map;
  }, [data?.avgRatings]);

  const strainBarData = useMemo(() => {
    const rows = data?.strainFrequency || [];
    const labels = rows.map((r) => r.strain || 'Unknown');
    return {
      labels,
      datasets: [
        {
          label: 'Entries',
          data: rows.map((r) => Number(r.count) || 0),
          backgroundColor: '#4CAF50',
          borderColor: '#1B5E20',
          borderWidth: 1,
        },
      ],
    };
  }, [data?.strainFrequency]);

  const groupedRatingsData = useMemo(() => {
    const medical = STRAIN_TYPES.map((t) => {
      const row = ratingsByType[t];
      return row?.medicalRating != null ? Number(row.medicalRating) : 0;
    });
    const recreational = STRAIN_TYPES.map((t) => {
      const row = ratingsByType[t];
      return row?.recreationalRating != null ? Number(row.recreationalRating) : 0;
    });
    return {
      labels: STRAIN_TYPES.map((t) => capitalize(t)),
      datasets: [
        {
          label: 'Medical',
          data: medical,
          backgroundColor: '#4CAF50',
          borderColor: '#1B5E20',
          borderWidth: 1,
        },
        {
          label: 'Recreational',
          data: recreational,
          backgroundColor: '#7B1FA2',
          borderColor: '#4E0F6B',
          borderWidth: 1,
        },
      ],
    };
  }, [ratingsByType]);

  const radarData = useMemo(() => {
    const values = EFFECT_KEYS.map((key) => {
      const raw = data?.effectsAvg?.[key];
      return raw != null && !Number.isNaN(Number(raw)) ? Number(raw) : 0;
    });
    return {
      labels: EFFECT_KEYS.map((k) => EFFECT_LABELS[k] || k),
      datasets: [
        {
          label: 'Avg rating',
          data: values,
          backgroundColor: 'rgba(76, 175, 80, 0.25)',
          borderColor: '#4CAF50',
          borderWidth: 2,
          pointBackgroundColor: '#4CAF50',
          pointBorderColor: TEXT_PRIMARY,
        },
      ],
    };
  }, [data?.effectsAvg]);

  const spendingLineData = useMemo(() => {
    const rows = data?.spendingOverTime || [];
    return {
      labels: rows.map((r) => formatMonthLabel(r.month)),
      datasets: [
        {
          label: 'Spent (USD)',
          data: rows.map((r) => Number(r.total) || 0),
          borderColor: '#FFD600',
          backgroundColor: 'rgba(255, 214, 0, 0.12)',
          fill: true,
          tension: 0.25,
          pointBackgroundColor: '#FFD600',
          pointBorderColor: '#0D1B0E',
        },
      ],
    };
  }, [data?.spendingOverTime]);

  const formDoughnutData = useMemo(() => {
    const rows = data?.formBreakdown || [];
    return {
      labels: rows.map((r) => capitalize(r.cannabisForm || 'Other')),
      datasets: [
        {
          data: rows.map((r) => Number(r.count) || 0),
          backgroundColor: rows.map((_, i) => DOUGHNUT_COLORS[i % DOUGHNUT_COLORS.length]),
          borderColor: TOOLTIP_BG,
          borderWidth: 1,
        },
      ],
    };
  }, [data?.formBreakdown]);

  const methodDoughnutData = useMemo(() => {
    const rows = data?.methodBreakdown || [];
    return {
      labels: rows.map((r) => capitalize(r.consumptionMethod || 'Other')),
      datasets: [
        {
          data: rows.map((r) => Number(r.count) || 0),
          backgroundColor: rows.map((_, i) => METHOD_COLORS[i % METHOD_COLORS.length]),
          borderColor: TOOLTIP_BG,
          borderWidth: 1,
        },
      ],
    };
  }, [data?.methodBreakdown]);

  const terpeneBarData = useMemo(() => {
    const rows = data?.topTerpenes || [];
    const labels = rows.map((r) => r.terpene || 'Unknown');
    return {
      labels,
      datasets: [
        {
          label: 'Count',
          data: rows.map((r) => Number(r.count) || 0),
          backgroundColor: labels.map((_, i) => (i % 2 === 0 ? '#7B1FA2' : '#4CAF50')),
          borderColor: labels.map((_, i) => (i % 2 === 0 ? '#4E0F6B' : '#1B5E20')),
          borderWidth: 1,
        },
      ],
    };
  }, [data?.topTerpenes]);

  const horizontalBarOptions = {
    ...chartOptionsBase,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: TEXT_SECONDARY },
        grid: { color: GRID_GREEN },
      },
      y: {
        ticks: { color: TEXT_SECONDARY },
        grid: { display: false },
      },
    },
  };

  const groupedBarOptions = {
    ...chartOptionsBase,
    scales: {
      x: {
        ticks: { color: TEXT_SECONDARY },
        grid: { color: GRID_GREEN },
      },
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { color: TEXT_SECONDARY },
        grid: { color: GRID_GREEN },
      },
    },
  };

  const lineOptions = {
    ...chartOptionsBase,
    scales: {
      x: {
        ticks: { color: TEXT_SECONDARY },
        grid: { color: GRID_GREEN },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: TEXT_SECONDARY,
          callback: (value) => `$${value}`,
        },
        grid: { color: GRID_GREEN },
      },
    },
  };

  const doughnutOptions = {
    ...chartOptionsBase,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: TEXT_PRIMARY, padding: 12 },
      },
    },
  };

  const radarOptions = {
    ...chartOptionsBase,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        angleLines: { color: GRID_GREEN },
        grid: { color: GRID_GREEN },
        pointLabels: { color: TEXT_SECONDARY, font: { size: 10 } },
        ticks: {
          color: TEXT_SECONDARY,
          backdropColor: 'transparent',
          showLabelBackdrop: false,
        },
      },
    },
  };

  const showEmpty = !loading && !error && data && !hasAnyAnalyticsData(data);
  const hasStrainFreq = (data?.strainFrequency || []).length > 0;
  const hasAvgRatings = (data?.avgRatings || []).length > 0;
  const hasSpending = (data?.spendingOverTime || []).length > 0;
  const hasForm = (data?.formBreakdown || []).length > 0;
  const hasMethod = (data?.methodBreakdown || []).length > 0;
  const hasTerpenes = (data?.topTerpenes || []).length > 0;
  const showRadar = hasNumericEffects(data?.effectsAvg);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Analytics</h1>

        {loading ? <p className={styles.loading}>Loading analytics...</p> : null}

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        {showEmpty ? (
          <p className={styles.empty}>No data yet. Add some entries first.</p>
        ) : null}

        {!loading && !error && data && hasAnyAnalyticsData(data) ? (
          <div className={styles.chartGrid}>
            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Top Strains by Frequency</h2>
              {hasStrainFreq ? (
                <div className={styles.chartWrap}>
                  <Bar data={strainBarData} options={horizontalBarOptions} />
                </div>
              ) : (
                <p className={styles.cardMuted}>No strain frequency data yet.</p>
              )}
            </article>

            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Avg Medical vs Recreational by Strain Type</h2>
              {hasAvgRatings ? (
                <div className={styles.chartWrap}>
                  <Bar data={groupedRatingsData} options={groupedBarOptions} />
                </div>
              ) : (
                <p className={styles.cardMuted}>No rating data by strain type yet.</p>
              )}
            </article>

            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Cannabinoid Ratio Distribution</h2>
              <p className={styles.placeholder}>Cannabinoid distribution coming soon</p>
            </article>

            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Most Common Effects</h2>
              {showRadar ? (
                <div className={styles.chartWrap}>
                  <Radar data={radarData} options={radarOptions} />
                </div>
              ) : (
                <p className={styles.cardMuted}>No effects averages yet.</p>
              )}
            </article>

            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Spending Over Time</h2>
              {hasSpending ? (
                <div className={styles.chartWrap}>
                  <Line data={spendingLineData} options={lineOptions} />
                </div>
              ) : (
                <p className={styles.cardMuted}>No spending history yet.</p>
              )}
            </article>

            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Cannabis Form Breakdown</h2>
              {hasForm ? (
                <div className={styles.chartWrap}>
                  <Doughnut data={formDoughnutData} options={doughnutOptions} />
                </div>
              ) : (
                <p className={styles.cardMuted}>No form data yet.</p>
              )}
            </article>

            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Consumption Method Breakdown</h2>
              {hasMethod ? (
                <div className={styles.chartWrap}>
                  <Doughnut data={methodDoughnutData} options={doughnutOptions} />
                </div>
              ) : (
                <p className={styles.cardMuted}>No method data yet.</p>
              )}
            </article>

            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Top Dominant Terpenes</h2>
              {hasTerpenes ? (
                <div className={styles.chartWrap}>
                  <Bar data={terpeneBarData} options={horizontalBarOptions} />
                </div>
              ) : (
                <p className={styles.cardMuted}>No terpene data yet.</p>
              )}
            </article>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AnalyticsPage;
