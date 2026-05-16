import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./JobCard.css";

export const getJobTypeColor = (jobType) => {
  switch (jobType) {
    case "full-time":
      return "job-type-full-time";
    case "part-time":
      return "job-type-part-time";
    case "remote":
      return "job-type-remote";
    case "contract":
      return "job-type-contract";
    case "internship":
      return "job-type-internship";
    default:
      return "job-type-default";
  }
};

export const getJobTypeLabel = (jobType, t) => {
  const labels = {
    "full-time": t("jobs.fullTime", { defaultValue: "Full Time" }),
    "part-time": t("jobs.partTime", { defaultValue: "Part Time" }),
    remote: t("jobs.remote", { defaultValue: "Remote" }),
    contract: t("jobs.contract", { defaultValue: "Contract" }),
    internship: t("jobs.internship", { defaultValue: "Internship" }),
  };

  return (
    labels[jobType] || jobType || t("common.other", { defaultValue: "Other" })
  );
};

const JobCard = ({ job }) => {
  const { t } = useTranslation();
  const companyName =
    job.company_name ||
    job.company ||
    t("jobCard.companyFallback", { defaultValue: "Company" });
  const companyInitial =
    job.company_initials || companyName?.charAt(0)?.toUpperCase() || "C";

  const formatSalary = (min, max) => {
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;

    if (!hasMin && !hasMax)
      return t("jobCard.salaryNotProvided", {
        defaultValue: "Salary not provided",
      });
    if (hasMin && !hasMax) return `$${Number(min).toLocaleString()}`;
    if (!hasMin && hasMax) return `$${Number(max).toLocaleString()}`;

    return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  };

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="job-card-link"
      aria-label={t("jobCard.viewJobDetailsFor", {
        defaultValue: "View details for {{title}}",
        title:
          job.title ||
          t("jobCard.untitledJob", { defaultValue: "Untitled Job" }),
      })}
    >
      <div className="job-card">
        <div className="job-card-header">
          <div className="company-logo" aria-hidden="true">
            {companyInitial}
          </div>

          <button
            className="save-job-btn"
            onClick={(e) => e.preventDefault()}
            type="button"
            aria-label={t("jobCard.saveThisJob", {
              defaultValue: "Save this job",
            })}
            title={t("jobCard.saveThisJob", { defaultValue: "Save this job" })}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              favorite
            </span>
          </button>
        </div>

        <div className="job-card-content">
          <h3 className="job-title">
            {job.title ||
              t("jobCard.untitledJob", { defaultValue: "Untitled Job" })}
          </h3>
          <p className="company-name">{companyName}</p>

          <div className="job-details">
            <div className="job-location">
              <span className="material-symbols-outlined" aria-hidden="true">
                location_on
              </span>
              <span>
                {job.location || t("jobs.remote", { defaultValue: "Remote" })}
              </span>
            </div>

            <div className="job-salary">
              <span className="material-symbols-outlined" aria-hidden="true">
                attach_money
              </span>
              <span>{formatSalary(job.salary_min, job.salary_max)}</span>
            </div>
          </div>

          <div className="job-tags">
            <span className={`job-type-tag ${getJobTypeColor(job.job_type)}`}>
              {getJobTypeLabel(job.job_type, t)}
            </span>

            {job.is_featured ? (
              <span className="featured-badge">
                <span className="material-symbols-outlined" aria-hidden="true">
                  star
                </span>
                {t("jobCard.featured", { defaultValue: "Featured" })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
