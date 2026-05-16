import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { salaryAPI } from "../../services/api";
import "./SalaryComparisonBadge.css";

const SalaryComparisonBadge = ({
  jobTitle,
  location,
  salaryMin,
  salaryMax,
}) => {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const midpoint = salaryMin && salaryMax ? (salaryMin + salaryMax) / 2 : 0;

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const response = await salaryAPI.getEstimate(jobTitle, location);
        setMarketData(response.data);
      } catch (err) {
        console.error("Failed to fetch salary market data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have both title and location
    if (jobTitle && location && salaryMin && salaryMax) {
      fetchMarketData();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [jobTitle, location, salaryMin, salaryMax]);

  if (!salaryMin || !salaryMax) return null;

  if (loading) {
    return (
      <span
        className="salary-badge loading"
        aria-label={t("salary.loadingMarketData", {
          defaultValue: "Loading market salary data",
        })}
      />
    );
  }

  if (error || !marketData || marketData.sampleCount < 5) {
    return null;
  }

  const { average, median, p25, p75, sampleCount } = marketData;
  const ratio = midpoint / average;

  let badgeClass = "";
  let label = "";

  if (ratio > 1.1) {
    badgeClass = "above-market";
    label = t("salary.aboveMarket", { defaultValue: "Above market" });
  } else if (ratio >= 0.9) {
    badgeClass = "market-average";
    label = t("salary.marketAverage", { defaultValue: "Market average" });
  } else {
    badgeClass = "below-market";
    label = t("salary.belowMarket", { defaultValue: "Below market" });
  }

  return (
    <div className="salary-badge-wrapper">
      <span className={`salary-badge ${badgeClass}`}>{label}</span>
      <div className="salary-tooltip">
        <div className="tooltip-title">
          {t("salary.marketDataFor", {
            defaultValue: "Market data for {{jobTitle}}",
            jobTitle,
          })}
        </div>
        <div className="tooltip-grid">
          <span className="tooltip-label">
            {t("salary.averageShort", { defaultValue: "Avg:" })}
          </span>
          <span className="tooltip-value">${average?.toLocaleString()}</span>
          <span className="tooltip-label">
            {t("salary.median", { defaultValue: "Median:" })}
          </span>
          <span className="tooltip-value">${median?.toLocaleString()}</span>
          <span className="tooltip-label">
            {t("salary.p25", { defaultValue: "25th %ile:" })}
          </span>
          <span className="tooltip-value">${p25?.toLocaleString()}</span>
          <span className="tooltip-label">
            {t("salary.p75", { defaultValue: "75th %ile:" })}
          </span>
          <span className="tooltip-value">${p75?.toLocaleString()}</span>
        </div>
        <div className="tooltip-footer">
          {t("salary.basedOnSalaries", {
            defaultValue: "Based on {{count}} salaries",
            count: sampleCount,
          })}
        </div>
      </div>
    </div>
  );
};

export default SalaryComparisonBadge;
