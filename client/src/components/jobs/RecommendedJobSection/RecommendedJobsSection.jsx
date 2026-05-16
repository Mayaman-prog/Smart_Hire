import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { jobAPI } from "../../../services/api";
import JobCard from "../JobCard/JobCard";
import "./RecommendedJobsSection.css";

const getMatchScore = (item) => {
  const score =
    item?.match_score ??
    item?.matchScore ??
    item?.score ??
    item?.job?.match_score ??
    item?.job?.matchScore ??
    item?.job?.score ??
    0;

  return Number(score) || 0;
};

const normalizeRecommendedJob = (item) => {
  const job = item?.job || item;

  return {
    ...job,
    match_score: getMatchScore(item),
  };
};

const extractRecommendedJobs = (responseData) => {
  const rawJobs =
    responseData?.data?.recommendations ||
    responseData?.data?.jobs ||
    responseData?.data ||
    responseData?.recommendations ||
    responseData?.jobs ||
    [];

  if (!Array.isArray(rawJobs)) {
    return [];
  }

  return rawJobs
    .map(normalizeRecommendedJob)
    .filter((job) => job?.id)
    .sort((a, b) => getMatchScore(b) - getMatchScore(a))
    .slice(0, 10);
};

const RecommendedJobsSection = ({ className = "" }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !user || user.role !== "job_seeker") {
      setRecommendedJobs([]);
      setLoading(false);
      setError(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchRecommendedJobs = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await jobAPI.getRecommendedJobs();

        if (isMounted) {
          setRecommendedJobs(extractRecommendedJobs(response.data));
        }
      } catch (err) {
        console.error("Recommended jobs error:", err);

        if (isMounted) {
          if (err.response?.status === 403) {
            setRecommendedJobs([]);
            setError(false);
          } else {
            setError(true);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendedJobs();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.role !== "job_seeker") {
    return null;
  }

  return (
    <section
      className={`recommended-jobs-section ${className}`.trim()}
      aria-labelledby="recommended-jobs-heading"
    >
      <div className="section-header recommended-jobs-header">
        <div>
          <h2 id="recommended-jobs-heading" className="section-title">
            {t("recommendedJobs.title", {
              defaultValue: "Recommended for You",
            })}
          </h2>

          <p className="recommended-jobs-subtitle">
            {t("recommendedJobs.subtitle", {
              defaultValue: "Jobs are sorted by your highest match score.",
            })}
          </p>
        </div>
      </div>

      {loading ? (
        <div
          className="recommended-jobs-status"
          role="status"
          aria-live="polite"
        >
          {t("recommendedJobs.loading", {
            defaultValue: "Loading recommended jobs...",
          })}
        </div>
      ) : error ? (
        <div className="recommended-jobs-status" role="alert">
          {t("recommendedJobs.error", {
            defaultValue: "Could not load recommended jobs right now.",
          })}
        </div>
      ) : recommendedJobs.length > 0 ? (
        <div
          className="recommended-jobs-grid"
          aria-label={t("recommendedJobs.listLabel", {
            defaultValue: "Recommended jobs sorted by match score",
          })}
        >
          {recommendedJobs.map((job) => (
            <article key={job.id} className="recommended-job-item">
              {job.match_score > 0 && (
                <span className="match-score-badge">
                  {t("recommendedJobs.matchScore", {
                    defaultValue: "{{score}}% match",
                    score: Math.round(job.match_score),
                  })}
                </span>
              )}

              <JobCard job={job} />
            </article>
          ))}
        </div>
      ) : (
        <div className="recommended-jobs-status recommended-jobs-empty">
          {t("recommendedJobs.empty", {
            defaultValue: "Complete your profile to get recommendations.",
          })}
        </div>
      )}
    </section>
  );
};

export default RecommendedJobsSection;
