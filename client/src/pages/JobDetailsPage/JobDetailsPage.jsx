import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api, { jobAPI, applicationAPI, savedJobsAPI } from "../../services/api";
import JobCard from "../../components/jobs/JobCard/JobCard";
import toast from "react-hot-toast";
import "./JobDetailsPage.css";

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [error, setError] = useState(null);

  const getRelativeDate = (date) => {
    if (!date) return "Recently";
    const posted = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((today - posted) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const formatSalary = (min, max) => {
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;

    if (!hasMin && !hasMax) return "Salary not disclosed";
    if (hasMin && !hasMax) return `$${Number(min).toLocaleString()}`;
    if (!hasMin && hasMax) return `$${Number(max).toLocaleString()}`;

    return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  };

  const getJobTypeLabel = (type) => {
    const map = {
      "full-time": "Full-time",
      "part-time": "Part-time",
      remote: "Remote",
      contract: "Contract",
      internship: "Internship",
    };
    return map[type] || type || "Other";
  };

  const getJobTypeClass = (type) => {
    const map = {
      "full-time": "badge-full-time",
      "part-time": "badge-part-time",
      remote: "badge-remote",
      contract: "badge-contract",
      internship: "badge-internship",
    };
    return map[type] || "";
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setHasApplied(false);
      setIsSaved(false);

      try {
        const jobRes = await jobAPI.getJobById(id);
        const jobData = jobRes.data?.data;
        setJob(jobData);

        const similarRes = await jobAPI.getJobs({ similar: true, jobId: Number(id) });
        setSimilarJobs((similarRes.data?.data || []).slice(0, 3));

        if (isAuthenticated && user?.role === "job_seeker") {
          const [savedRes, applicationsRes] = await Promise.all([
            savedJobsAPI.getSavedJobs(),
            applicationAPI.getMyApplications(),
          ]);

          const savedJobs = savedRes.data?.data || [];
          const applications = applicationsRes.data?.data || [];

          setIsSaved(savedJobs.some((s) => Number(s.id) === Number(id)));
          setHasApplied(
            applications.some((a) => Number(a.job_id) === Number(id)),
          );
        }
      } catch (err) {
        const message =
          err.response?.status === 404
            ? "Job not found"
            : err.response?.data?.message || "Failed to load job details";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, user]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", `/jobs/${id}`);
      toast.error("Please login to apply for this job");
      navigate("/login");
      return;
    }

    if (user?.role !== "job_seeker") {
      toast.error("Only job seekers can apply for jobs");
      return;
    }

    if (!job?.id) {
      toast.error("Job details are not available");
      return;
    }

    setApplying(true);

    try {
      await applicationAPI.applyForJob(job.id, { cover_letter: "" });
      setHasApplied(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      if (err.response?.status === 409) {
        setHasApplied(true);
        toast.error("You have already applied to this job");
      } else {
        toast.error(err.response?.data?.message || "Failed to apply");
      }
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", `/jobs/${id}`);
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }

    if (user?.role !== "job_seeker") {
      toast.error("Only job seekers can save jobs");
      return;
    }

    if (!job?.id || saving) return;

    setSaving(true);

    try {
      if (isSaved) {
        await savedJobsAPI.removeSavedJob(job.id);
        setIsSaved(false);
        toast.success("Job removed from saved");
      } else {
        await savedJobsAPI.saveJob(job.id);
        setIsSaved(true);
        toast.success("Job saved");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsSaved(true);
        toast.error("Job already saved");
      } else {
        toast.error(err.response?.data?.message || "Failed to save job");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReporting(true);
    try {
      await api.post("/reports", {
        jobId: Number(id),
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      });
      toast.success("Report submitted. Thank you for helping us improve.");
      setAlreadyReported(true);
      setShowReportModal(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to submit report.";
      toast.error(msg);
    } finally {
      setReporting(false);
    }
  };

  const isOwnEmployerJob =
    isAuthenticated &&
    user?.role === "employer" &&
    job?.company_name &&
    user?.company_name &&
    job.company_name === user.company_name;

  if (loading) {
    return <div className="loading-skeleton">Loading...</div>;
  }

  if (error || !job) {
    return (
      <div className="error-state">
        <h2>{error || "Job Not Found"}</h2>
        <button onClick={() => navigate("/jobs")}>Browse Jobs</button>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <div className="container">
        {isAuthenticated && user?.role === "job_seeker" && (
          <div className="match-insights">
            <div className="match-icon">⭐</div>
            <div className="match-content">
              <h4>SmartHire Match Insights</h4>
              <p>
                Based on your profile, you are a strong match for this role.
              </p>
            </div>
          </div>
        )}

        <div className="job-header">
          <div className="company-logo-large">
            {job.company_name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          <div className="job-title-section">
            <h1>{job.title}</h1>

            <Link
              to={job.company_id ? `/companies/${job.company_id}` : "#"}
              className="company-link"
            >
              {job.company_name || "Company"}
              {job.company_verified ? (
                <span className="verified-badge">✓ Verified</span>
              ) : null}
            </Link>

            <div className="posted-date">
              Posted {getRelativeDate(job.created_at)}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className={`save-btn ${isSaved ? "saved" : ""}`}
              onClick={handleSaveJob}
              disabled={saving}
              type="button"
            >
              <span className="material-symbols-outlined">
                {isSaved ? "favorite" : "favorite_border"}
              </span>
              {saving ? " Saving..." : " Save"}
            </button>

            <button className="share-btn" onClick={handleShare} type="button">
              <span className="material-symbols-outlined">share</span>
              Share
            </button>
            {isAuthenticated ? (
              <button
                className={`report-btn ${alreadyReported ? "reported" : ""}`}
                onClick={() => setShowReportModal(true)}
                disabled={alreadyReported}
                type="button"
                title={
                  alreadyReported
                    ? "You have already reported this job"
                    : "Report this job"
                }
              >
                <span className="material-symbols-outlined">flag</span>
                {alreadyReported ? " Reported" : " Report"}
              </button>
            ) : (
              <button
                className="report-btn"
                onClick={() => {
                  sessionStorage.setItem("redirectAfterLogin", `/jobs/${id}`);
                  toast.error("Please login to report jobs");
                  navigate("/login");
                }}
                type="button"
              >
                <span className="material-symbols-outlined">flag</span>
                Report
              </button>
            )}
          </div>
        </div>

        <div className="apply-section">
          {isOwnEmployerJob ? (
            <div className="employer-note">
              <span className="material-symbols-outlined">info</span>
              You are viewing your own job posting
            </div>
          ) : (
            <button
              className={`apply-btn ${hasApplied ? "applied" : ""}`}
              onClick={handleApply}
              disabled={hasApplied || applying}
              type="button"
            >
              {applying ? (
                <>
                  <span className="spinner"></span> Applying...
                </>
              ) : hasApplied ? (
                <>
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  Already Applied
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Apply Now
                </>
              )}
            </button>
          )}
        </div>

        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="material-symbols-outlined">location_on</span>
            <div>
              <label>Location</label>
              <p>{job.location || "Remote"}</p>
            </div>
          </div>

          <div className="metadata-item">
            <span className="material-symbols-outlined">work</span>
            <div>
              <label>Job Type</label>
              <p className={`job-type-badge ${getJobTypeClass(job.job_type)}`}>
                {getJobTypeLabel(job.job_type)}
              </p>
            </div>
          </div>

          <div className="metadata-item">
            <span className="material-symbols-outlined">attach_money</span>
            <div>
              <label>Salary Range</label>
              <p>{formatSalary(job.salary_min, job.salary_max)}</p>
            </div>
          </div>
        </div>

        <div className="job-content-grid">
          <section className="job-main-content">
            <div className="content-card">
              <h2>Job Description</h2>
              <p className="description-text">
                {job.description || "No description provided."}
              </p>
            </div>

            <div className="content-card">
              <h2>Requirements</h2>
              <div className="requirements-text">
                {job.requirements ? (
                  <pre className="plain-text-block">{job.requirements}</pre>
                ) : (
                  <p>No requirements listed.</p>
                )}
              </div>
            </div>
          </section>

          <aside className="job-sidebar">
            <div className="sidebar-card">
              <h3>Company Overview</h3>
              <p>
                <strong>Name:</strong> {job.company_name || "Company"}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {job.company_location || "Not specified"}
              </p>
              {job.company_website ? (
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href={job.company_website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {job.company_website}
                  </a>
                </p>
              ) : null}
            </div>
          </aside>
        </div>

        {similarJobs.length > 0 && (
          <section className="similar-jobs-section">
            <div className="section-header">
              <h2>Similar Jobs</h2>
            </div>

            <div className="similar-jobs-grid">
              {similarJobs.map((similarJob) => (
                <JobCard key={similarJob.id} job={similarJob} />
              ))}
            </div>
          </section>
        )}
      </div>
      {/* Report Job Modal */}
      {showReportModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowReportModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Report Job</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label htmlFor="report-reason">Reason *</label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="spam">Spam</option>
                  <option value="fraud">Fraud</option>
                  <option value="inappropriate">Inappropriate</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="report-description">
                  Additional details (optional)
                </label>
                <textarea
                  id="report-description"
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide more context..."
                  maxLength={500}
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={reporting}
                >
                  {reporting ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
