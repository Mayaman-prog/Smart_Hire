import React from "react";
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

export const getJobTypeLabel = (jobType) => {
  switch (jobType) {
    case "full-time":
      return "Full Time";
    case "part-time":
      return "Part Time";
    case "remote":
      return "Remote";
    case "contract":
      return "Contract";
    case "internship":
      return "Internship";
    default:
      return jobType || "Other";
  }
};

const JobCard = ({ job }) => {
  const companyName = job.company_name || job.company || "Company";
  const companyInitial =
    job.company_initials || companyName?.charAt(0)?.toUpperCase() || "C";

  const formatSalary = (min, max) => {
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;

    if (!hasMin && !hasMax) return "Negotiable";
    if (hasMin && !hasMax) return `$${Number(min).toLocaleString()}`;
    if (!hasMin && hasMax) return `$${Number(max).toLocaleString()}`;

    return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  };

  return (
    <Link to={`/jobs/${job.id}`} className="job-card-link">
      <div className="job-card">
        <div className="job-card-header">
          <div className="company-logo">{companyInitial}</div>

          <button
            className="save-job-btn"
            onClick={(e) => e.preventDefault()}
            type="button"
            aria-label="Save job"
            title="Save job"
          >
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>

        <div className="job-card-content">
          <h3 className="job-title">{job.title || "Untitled Job"}</h3>
          <p className="company-name">{companyName}</p>

          <div className="job-details">
            <div className="job-location">
              <span className="material-symbols-outlined">location_on</span>
              <span>{job.location || "Remote"}</span>
            </div>

            <div className="job-salary">
              <span className="material-symbols-outlined">attach_money</span>
              <span>{formatSalary(job.salary_min, job.salary_max)}</span>
            </div>
          </div>

          <div className="job-tags">
            <span className={`job-type-tag ${getJobTypeColor(job.job_type)}`}>
              {getJobTypeLabel(job.job_type)}
            </span>

            {job.is_featured ? (
              <span className="featured-badge">
                <span className="material-symbols-outlined">star</span>
                Featured
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
