import React, { useEffect, useMemo, useState } from "react";
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

const parseMatchingKeywords = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const normalizeRecommendedJob = (item) => {
  const job = item?.job || item;

  return {
    ...job,
    id: job.id || job.job_id,
    match_score: getMatchScore(item),
    matching_keywords: parseMatchingKeywords(
      item?.matching_keywords ?? job?.matching_keywords,
    ),
    reason_summary: item?.reason_summary ?? job?.reason_summary ?? "",
    keyword_score: Number(item?.keyword_score ?? job?.keyword_score ?? 0),
    location_score: Number(item?.location_score ?? job?.location_score ?? 0),
    job_type_score: Number(item?.job_type_score ?? job?.job_type_score ?? 0),
    salary_score: Number(item?.salary_score ?? job?.salary_score ?? 0),
    history_score: Number(item?.history_score ?? job?.history_score ?? 0),
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
    .filter((job) => job?.id || job?.job_id)
    .sort((a, b) => getMatchScore(b) - getMatchScore(a))
    .slice(0, 10);
};

const formatKeyword = (keyword) => {
  return String(keyword)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStoredFeedback = (storageKey) => {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

const saveStoredFeedback = (storageKey, feedback) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(feedback));
  } catch {
    // Local storage can fail in private browsing or restricted browser modes.
  }
};

const getRecommendationReasons = (job, t) => {
  const reasons = [];

  job.matching_keywords.slice(0, 4).forEach((keyword) => {
    reasons.push(
      t("recommendedJobs.matchesSkill", {
        defaultValue: "Matches your {{skill}} skill",
        skill: formatKeyword(keyword),
      }),
    );
  });

  if (job.keyword_score >= 60 && !reasons.length) {
    reasons.push(
      t("recommendedJobs.keywordMatch", {
        defaultValue: "Strong keyword and skills overlap",
      }),
    );
  }

  if (job.location_score >= 80) {
    reasons.push(
      t("recommendedJobs.matchesLocation", {
        defaultValue: "Matches your preferred location",
      }),
    );
  }

  if (job.job_type_score >= 80) {
    reasons.push(
      t("recommendedJobs.matchesJobType", {
        defaultValue: "Matches your preferred job type",
      }),
    );
  }

  if (job.salary_score >= 80) {
    reasons.push(
      t("recommendedJobs.matchesSalary", {
        defaultValue: "Salary range matches your expectation",
      }),
    );
  }

  if (job.history_score >= 60) {
    reasons.push(
      t("recommendedJobs.matchesHistory", {
        defaultValue: "Similar to jobs you saved or applied for",
      }),
    );
  }

  if (!reasons.length && job.reason_summary) {
    job.reason_summary
      .split(";")
      .map((reason) => reason.trim())
      .filter(Boolean)
      .slice(0, 5)
      .forEach((reason) => reasons.push(reason));
  }

  return reasons.length
    ? reasons.slice(0, 5)
    : [
        t("recommendedJobs.generalReason", {
          defaultValue: "Recommended from your available profile information",
        }),
      ];
};

const RecommendedJobsSection = ({ className = "" }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [feedbackByJobId, setFeedbackByJobId] = useState({});
  const [activeReasonJobId, setActiveReasonJobId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const feedbackStorageKey = useMemo(() => {
    return user?.id ? `smarthire_recommendation_feedback_${user.id}` : null;
  }, [user?.id]);

  useEffect(() => {
    if (feedbackStorageKey) {
      setFeedbackByJobId(getStoredFeedback(feedbackStorageKey));
    }
  }, [feedbackStorageKey]);

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

  const handleReasonToggle = (jobId) => {
    setActiveReasonJobId((currentJobId) =>
      currentJobId === jobId ? null : jobId,
    );
  };

  const handleReasonKeyDown = (event) => {
    if (event.key === "Escape") {
      setActiveReasonJobId(null);
    }
  };

  const handleFeedback = (jobId, feedback) => {
    const currentFeedback = feedbackByJobId[jobId];
    const nextFeedback = currentFeedback === feedback ? null : feedback;

    const updatedFeedback = {
      ...feedbackByJobId,
      [jobId]: nextFeedback,
    };

    if (!nextFeedback) {
      delete updatedFeedback[jobId];
    }

    setFeedbackByJobId(updatedFeedback);

    if (feedbackStorageKey) {
      saveStoredFeedback(feedbackStorageKey, updatedFeedback);
    }

    setFeedbackMessage(
      nextFeedback === "up"
        ? t("recommendedJobs.feedbackUseful", {
            defaultValue: "Feedback saved: this recommendation is useful.",
          })
        : nextFeedback === "down"
          ? t("recommendedJobs.feedbackNotUseful", {
              defaultValue:
                "Feedback saved: this recommendation is not useful.",
            })
          : t("recommendedJobs.feedbackRemoved", {
              defaultValue: "Recommendation feedback removed.",
            }),
    );
  };

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

      <div className="sr-only" role="status" aria-live="polite">
        {feedbackMessage}
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
          {recommendedJobs.map((job) => {
            const reasons = getRecommendationReasons(job, t);
            const tooltipId = `why-job-${job.id}`;
            const selectedFeedback = feedbackByJobId[job.id];

            return (
              <article key={job.id} className="recommended-job-item">
                <div className="recommended-job-toolbar">
                  {job.match_score > 0 ? (
                    <span className="match-score-badge">
                      {t("recommendedJobs.matchScore", {
                        defaultValue: "{{score}}% match",
                        score: Math.round(job.match_score),
                      })}
                    </span>
                  ) : null}

                  <div className="recommended-job-actions">
                    <div className="why-job-wrapper">
                      <button
                        type="button"
                        className="why-job-button"
                        aria-expanded={activeReasonJobId === job.id}
                        aria-describedby={
                          activeReasonJobId === job.id ? tooltipId : undefined
                        }
                        onClick={() => handleReasonToggle(job.id)}
                        onKeyDown={handleReasonKeyDown}
                      >
                        {t("recommendedJobs.whyButton", {
                          defaultValue: "Why?",
                        })}
                      </button>

                      {activeReasonJobId === job.id ? (
                        <div
                          id={tooltipId}
                          className="why-job-tooltip"
                          role="tooltip"
                        >
                          <p className="why-job-title">
                            {t("recommendedJobs.whyTitle", {
                              defaultValue: "Why this job?",
                            })}
                          </p>

                          <ul>
                            {reasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div
                      className="recommendation-feedback"
                      aria-label={t("recommendedJobs.feedbackLabel", {
                        defaultValue: "Recommendation feedback",
                      })}
                    >
                      <button
                        type="button"
                        className={`recommendation-feedback-btn ${
                          selectedFeedback === "up" ? "is-active" : ""
                        }`}
                        aria-pressed={selectedFeedback === "up"}
                        aria-label={t("recommendedJobs.thumbsUp", {
                          defaultValue: "This recommendation is useful",
                        })}
                        onClick={() => handleFeedback(job.id, "up")}
                      >
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          thumb_up
                        </span>
                      </button>

                      <button
                        type="button"
                        className={`recommendation-feedback-btn ${
                          selectedFeedback === "down" ? "is-active" : ""
                        }`}
                        aria-pressed={selectedFeedback === "down"}
                        aria-label={t("recommendedJobs.thumbsDown", {
                          defaultValue: "This recommendation is not useful",
                        })}
                        onClick={() => handleFeedback(job.id, "down")}
                      >
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          thumb_down
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <JobCard job={job} />
              </article>
            );
          })}
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
