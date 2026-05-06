import { useState, useEffect } from "react";
import { salaryAPI } from "../../services/api";
import "./SalaryComparisonBadge.css";

const SalaryComparisonBadge = ({
  jobTitle,
  location,
  salaryMin,
  salaryMax,
}) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // If no salary data, don't render
  if (!salaryMin || !salaryMax) return null;

  const midpoint = (salaryMin + salaryMax) / 2;

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
    if (jobTitle && location) {
      fetchMarketData();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [jobTitle, location]);

  if (loading) {
    return <span className="salary-badge loading" />;
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
    label = "Above market";
  } else if (ratio >= 0.9) {
    badgeClass = "market-average";
    label = "Market average";
  } else {
    badgeClass = "below-market";
    label = "Below market";
  }

  return (
    <div className="salary-badge-wrapper">
      <span className={`salary-badge ${badgeClass}`}>{label}</span>
      <div className="salary-tooltip">
        <div className="tooltip-title">Market data for {jobTitle}</div>
        <div className="tooltip-grid">
          <span className="tooltip-label">Avg:</span>
          <span className="tooltip-value">${average?.toLocaleString()}</span>
          <span className="tooltip-label">Median:</span>
          <span className="tooltip-value">${median?.toLocaleString()}</span>
          <span className="tooltip-label">25th %ile:</span>
          <span className="tooltip-value">${p25?.toLocaleString()}</span>
          <span className="tooltip-label">75th %ile:</span>
          <span className="tooltip-value">${p75?.toLocaleString()}</span>
        </div>
        <div className="tooltip-footer">Based on {sampleCount} salaries</div>
      </div>
    </div>
  );
};

export default SalaryComparisonBadge;
