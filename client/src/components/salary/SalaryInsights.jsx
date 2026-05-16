import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { salaryAPI } from "../../services/api";
import "./SalaryInsights.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const SalaryInsights = ({ jobTitle, location }) => {
  const { t } = useTranslation();
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
        console.error("Failed to fetch salary trend:", err);
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
        label: "Average Salary ($)",
        data: trendData?.map((d) => d.avg) || [],
        borderColor: "#00c48c",
        backgroundColor: "rgba(0, 196, 140, 0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#00c48c",
        pointBorderColor: "#ffffff",
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
        grid: { color: "rgba(0,0,0,0.05)" },
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
        aria-label={isOpen ? "Hide salary insights" : "Show salary insights"}
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
        {t("auto.salary_insights", { defaultValue: "Salary Insights" })}
      </button>

      {isOpen && (
        <div className="insights-content">
          {loading && (
            <div className="insights-loading" role="status" aria-live="polite">
              <span className="spinner"></span>
              {t("auto.loading_salary_data", {
                defaultValue: "Loading salary data...",
              })}
            </div>
          )}

          {error && (
            <div className="insights-error" role="alert" aria-live="assertlive">
              <span className="material-symbols-outlined">error_outline</span>
              {t("auto.could_not_load_salary_insights", {
                defaultValue: "Could not load salary insights.",
              })}
            </div>
          )}

          {!loading && !error && trendData && percentiles && (
            <div className="insights-grid">
              {/* Chart section */}
              <div className="chart-container">
                <h3>
                  {t("auto.salary_trend_last_6_months", {
                    defaultValue: "Salary Trend (Last 6 Months)",
                  })}
                </h3>
                <div className="chart-wrapper">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Percentiles section */}
              <div className="percentiles-container">
                <h3>
                  {t("auto.percentile_distribution", {
                    defaultValue: "Percentile Distribution",
                  })}
                </h3>
                <div className="percentile-item">
                  <span className="percentile-label">
                    {t("salary.percentile25", { defaultValue: "25th" })}
                  </span>
                  <div className="percentile-bar-bg">
                    <div
                      className="percentile-bar"
                      style={{
                        width: `${getBarWidth(percentiles.p25, maxPercentile)}%`,
                      }}
                    />
                  </div>
                  <span className="percentile-value">
                    ${percentiles.p25?.toLocaleString() || "N/A"}
                  </span>
                </div>

                <div className="percentile-item">
                  <span className="percentile-label">
                    {t("salary.percentile50Median", {
                      defaultValue: "50th (Median)",
                    })}
                  </span>
                  <div className="percentile-bar-bg">
                    <div
                      className="percentile-bar median"
                      style={{
                        width: `${getBarWidth(percentiles.p50, maxPercentile)}%`,
                      }}
                    />
                  </div>
                  <span className="percentile-value">
                    ${percentiles.p50?.toLocaleString() || "N/A"}
                  </span>
                </div>

                <div className="percentile-item">
                  <span className="percentile-label">
                    {t("salary.percentile75", { defaultValue: "75th" })}
                  </span>
                  <div className="percentile-bar-bg">
                    <div
                      className="percentile-bar"
                      style={{
                        width: `${getBarWidth(percentiles.p75, maxPercentile)}%`,
                      }}
                    />
                  </div>
                  <span className="percentile-value">
                    ${percentiles.p75?.toLocaleString() || "N/A"}
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
