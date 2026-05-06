import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { salaryAPI } from '../../services/api';
import './SalaryInsights.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalaryInsights = ({ jobTitle, location }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [trendData, setTrendData] = useState(null);
  const [percentiles, setPercentiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen || !jobTitle || !location) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await salaryAPI.getTrend(jobTitle, location);
        setTrendData(response.data.trend);
        setPercentiles(response.data.percentiles);
      } catch (err) {
        console.error('Failed to fetch salary trend:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, jobTitle, location]);

  // Chart configuration
  const chartData = {
    labels: trendData?.map((d) => d.month) || [],
    datasets: [
      {
        label: 'Average Salary ($)',
        data: trendData?.map((d) => d.avg) || [],
        borderColor: '#00c48c',
        backgroundColor: 'rgba(0, 196, 140, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#00c48c',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Helper to calculate bar width (max = highest percentile)
  const getBarWidth = (value, max) => {
    if (!max || max === 0) return 0;
    return (value / max) * 100;
  };

  const maxPercentile = percentiles
    ? Math.max(percentiles.p25 || 0, percentiles.p50 || 0, percentiles.p75 || 0)
    : 0;

  return (
    <div className="salary-insights">
      <button
        className="insights-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="material-symbols-outlined">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
        Salary Insights
      </button>

      {isOpen && (
        <div className="insights-content">
          {loading && (
            <div className="insights-loading">
              <span className="spinner"></span> Loading salary data...
            </div>
          )}

          {error && (
            <div className="insights-error">
              <span className="material-symbols-outlined">error_outline</span>
              Could not load salary insights.
            </div>
          )}

          {!loading && !error && trendData && percentiles && (
            <div className="insights-grid">
              {/* Chart section */}
              <div className="chart-container">
                <h4>Salary Trend (Last 6 Months)</h4>
                <div className="chart-wrapper">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Percentiles section */}
              <div className="percentiles-container">
                <h4>Percentile Distribution</h4>
                <div className="percentile-item">
                  <span className="percentile-label">25th</span>
                  <div className="percentile-bar-bg">
                    <div
                      className="percentile-bar"
                      style={{ width: `${getBarWidth(percentiles.p25, maxPercentile)}%` }}
                    />
                  </div>
                  <span className="percentile-value">
                    ${percentiles.p25?.toLocaleString() || 'N/A'}
                  </span>
                </div>

                <div className="percentile-item">
                  <span className="percentile-label">50th (Median)</span>
                  <div className="percentile-bar-bg">
                    <div
                      className="percentile-bar median"
                      style={{ width: `${getBarWidth(percentiles.p50, maxPercentile)}%` }}
                    />
                  </div>
                  <span className="percentile-value">
                    ${percentiles.p50?.toLocaleString() || 'N/A'}
                  </span>
                </div>

                <div className="percentile-item">
                  <span className="percentile-label">75th</span>
                  <div className="percentile-bar-bg">
                    <div
                      className="percentile-bar"
                      style={{ width: `${getBarWidth(percentiles.p75, maxPercentile)}%` }}
                    />
                  </div>
                  <span className="percentile-value">
                    ${percentiles.p75?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryInsights;