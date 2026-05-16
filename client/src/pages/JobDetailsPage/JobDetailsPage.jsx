import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api, {
  userAPI,
  jobAPI,
  applicationAPI,
  savedJobsAPI,
  getCoverLetters,
  setDefaultCoverLetter,
} from "../../services/api";
import JobCard from "../../components/jobs/JobCard/JobCard";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import SalaryComparisonBadge from "../../components/salary/SalaryComparisonBadge";
import SalaryInsights from "../../components/salary/SalaryInsights";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "./JobDetailsPage.css";

const JobDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [error, setError] = useState(null);

  // State for one-click application
  const [hasResume, setHasResume] = useState(false);
  const [showOneClickConfirmModal, setShowOneClickConfirmModal] =
    useState(false);

  // Cover letter states
  const [coverLetters, setCoverLetters] = useState([]);
  const [selectedCoverId, setSelectedCoverId] = useState(null);
  const [coverContent, setCoverContent] = useState("");
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const reportModalRef = useFocusTrap(showReportModal, () =>
    setShowReportModal(false),
  );

  const applyModalRef = useFocusTrap(showApplyModal, () =>
    setShowApplyModal(false),
  );

  const oneClickModalRef = useFocusTrap(showOneClickConfirmModal, () =>
    setShowOneClickConfirmModal(false),
  );

  const getRelativeDate = (date) => {
    if (!date) {
      return t("date.recently", { defaultValue: "Recently" });
    }

    const posted = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((today - posted) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return t("date.today", { defaultValue: "Today" });
    }

    if (diffDays === 1) {
      return t("date.yesterday", { defaultValue: "Yesterday" });
    }

    return t("date.daysAgo", {
      count: diffDays,
      defaultValue: "{{count}} days ago",
    });
  };

  const formatSalary = (min, max) => {
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;

    if (!hasMin && !hasMax) {
      return t("jobDetails.salaryNotDisclosed", {
        defaultValue: "Salary not disclosed",
      });
    }

    if (hasMin && !hasMax) return `$${Number(min).toLocaleString()}`;
    if (!hasMin && hasMax) return `$${Number(max).toLocaleString()}`;

    return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  };

  const getJobTypeLabel = (type) => {
    const map = {
      "full-time": t("jobTypes.fullTime", { defaultValue: "Full-time" }),
      "part-time": t("jobTypes.partTime", { defaultValue: "Part-time" }),
      remote: t("jobTypes.remote", { defaultValue: "Remote" }),
      contract: t("jobTypes.contract", { defaultValue: "Contract" }),
      internship: t("jobTypes.internship", { defaultValue: "Internship" }),
    };

    return map[type] || type || t("jobTypes.other", { defaultValue: "Other" });
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
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setHasApplied(false);
      setIsSaved(false);

      try {
        const jobRes = await jobAPI.getJobById(id);
        const jobData = jobRes.data?.data;
        setJob(jobData);

        const similarRes = await jobAPI.getJobs({
          similar: true,
          jobId: Number(id),
        });
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
            ? t("jobDetails.jobNotFound", { defaultValue: "Job not found" })
            : err.response?.data?.message ||
              t("jobDetails.loadError", {
                defaultValue: "Failed to load job details",
              });

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, user?.id]);

  // Check if user has a primary resume
  useEffect(() => {
    if (isAuthenticated && user?.role === "job_seeker") {
      const checkResume = async () => {
        try {
          const res = await userAPI.getPrimaryResume();
          if (res.data.data) {
            setHasResume(true);
          }
        } catch (err) {
          console.error("Resume fetch failed:", err.response?.data || err);
        }
      };
      checkResume();
    }
  }, [isAuthenticated, user?.id]);

  // Fetch cover letters for the apply modal
  const fetchCoverLetters = async () => {
    try {
      const res = await getCoverLetters();
      const letters = res.data?.data || res.data || [];
      setCoverLetters(letters);
      // Pre-select the default cover letter
      const defaultLetter = letters.find((l) => l.is_default);
      if (defaultLetter) {
        setSelectedCoverId(defaultLetter.id);
        setCoverContent(defaultLetter.content);
      } else if (letters.length > 0) {
        setSelectedCoverId(letters[0].id);
        setCoverContent(letters[0].content);
      } else {
        setCoverContent("");
      }
    } catch (err) {
      console.error("Failed to load cover letters:", err);
      toast.error(
        t("auto.could_not_load_cover_letters", {
          defaultValue: "Could not load cover letters",
        }),
      );
    }
  };

  // Open apply modal and load cover letters
  const handleApplyOpen = () => {
    setShowApplyModal(true);
    fetchCoverLetters();
    setIsEditingCover(false);
  };

  // Handle cover letter selection change
  const handleCoverChange = (e) => {
    const id = Number(e.target.value);
    setSelectedCoverId(id);
    const letter = coverLetters.find((l) => l.id === id);
    setCoverContent(letter ? letter.content : "");
    setIsEditingCover(false);
  };

  // Toggle between preview and edit mode for cover letter
  const toggleEdit = () => {
    setIsEditingCover(!isEditingCover);
  };

  // Submit application with selected cover letter
  const handleApplySubmit = async () => {
    setApplying(true);
    try {
      await applicationAPI.applyForJob(job.id, {
        cover_letter: coverContent,
      });
      setHasApplied(true);
      toast.success(
        t("auto.application_submitted_successfully", {
          defaultValue: "Application submitted successfully!",
        }),
      );
      setShowApplyModal(false);
    } catch (err) {
      if (err.response?.status === 409) {
        setHasApplied(true);
        toast.error(
          t("auto.you_have_already_applied_to_this_job", {
            defaultValue: "You have already applied to this job",
          }),
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            t("jobDetails.applyError", { defaultValue: "Failed to apply" }),
        );
      }
    } finally {
      setApplying(false);
    }
  };

  // Handle one-click application with resume
  const handleOneClickApply = async () => {
    setApplying(true);
    try {
      // The backend must support `useResume: true` to use stored profile & default cover letter
      await applicationAPI.applyForJob(job.id, { useResume: true });
      setHasApplied(true);
      toast.success(
        t("auto.application_submitted_successfully_using_your_resume", {
          defaultValue: "Application submitted successfully using your resume!",
        }),
      );
      setShowOneClickConfirmModal(false);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message === "Profile incomplete") {
        toast.error(
          t("auto.your_profile_is_incomplete_please_complete_it_first", {
            defaultValue:
              "Your profile is incomplete. Please complete it first.",
          }),
        );
        navigate("/dashboard/seeker?tab=profile");
      } else {
        toast.error(
          err.response?.data?.message ||
            t("jobDetails.applyError", { defaultValue: "Failed to apply" }),
        );
      }
    } finally {
      setApplying(false);
    }
  };

  // Handle apply button click
  const handleApply = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", `/jobs/${id}`);
      toast.error(
        t("auto.please_login_to_apply_for_this_job", {
          defaultValue: "Please login to apply for this job",
        }),
      );
      navigate("/login");
      return;
    }

    if (user?.role !== "job_seeker") {
      toast.error(
        t("auto.only_job_seekers_can_apply_for_jobs", {
          defaultValue: "Only job seekers can apply for jobs",
        }),
      );
      return;
    }

    if (!job?.id) {
      toast.error(
        t("auto.job_details_are_not_available", {
          defaultValue: "Job details are not available",
        }),
      );
      return;
    }

    // Open modal instead of submitting immediately
    handleApplyOpen();
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", `/jobs/${id}`);
      toast.error(
        t("auto.please_login_to_save_jobs", {
          defaultValue: "Please login to save jobs",
        }),
      );
      navigate("/login");
      return;
    }

    if (user?.role !== "job_seeker") {
      toast.error(
        t("auto.only_job_seekers_can_save_jobs", {
          defaultValue: "Only job seekers can save jobs",
        }),
      );
      return;
    }

    if (!job?.id || saving) return;

    setSaving(true);

    try {
      if (isSaved) {
        await savedJobsAPI.removeSavedJob(job.id);
        setIsSaved(false);
        toast.success(
          t("auto.job_removed_from_saved", {
            defaultValue: "Job removed from saved",
          }),
        );
      } else {
        await savedJobsAPI.saveJob(job.id);
        setIsSaved(true);
        toast.success(t("auto.job_saved", { defaultValue: "Job saved" }));
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsSaved(true);
        toast.error(
          t("auto.job_already_saved", { defaultValue: "Job already saved" }),
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            t("jobDetails.saveError", { defaultValue: "Failed to save job" }),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(
        t("auto.link_copied_to_clipboard", {
          defaultValue: "Link copied to clipboard!",
        }),
      );
    } catch {
      toast.error(
        t("auto.failed_to_copy_link", { defaultValue: "Failed to copy link" }),
      );
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
      toast.success(
        t("auto.report_submitted_thank_you_for_helping_us_improve", {
          defaultValue: "Report submitted. Thank you for helping us improve.",
        }),
      );
      setAlreadyReported(true);
      setShowReportModal(false);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        t("jobDetails.reportSubmitError", {
          defaultValue: "Failed to submit report.",
        });
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
    return (
      <div className="loading-skeleton">
        {t("auto.loading", { defaultValue: "Loading..." })}
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="error-state">
        <h2>
          {error ||
            t("jobDetails.jobNotFoundTitle", { defaultValue: "Job Not Found" })}
        </h2>
        <button onClick={() => navigate("/jobs")}>
          {t("auto.browse_jobs", { defaultValue: "Browse Jobs" })}
        </button>
      </div>
    );
  }

  // Render job details
  return (
    <div className="job-details-page">
      <div className="container">
        {isAuthenticated && user?.role === "job_seeker" && (
          <div className="match-insights">
            <div className="match-icon">⭐</div>
            <div className="match-content">
              <h2>
                {t("auto.smarthire_match_insights", {
                  defaultValue: "SmartHire Match Insights",
                })}
              </h2>
              <p>
                {t(
                  "auto.based_on_your_profile_you_are_a_strong_match_for_this_r",
                  {
                    defaultValue:
                      "Based on your profile, you are a strong match for this role.",
                  },
                )}
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
              {job.company_name ||
                t("common.company", { defaultValue: "Company" })}
              {job.company_verified ? (
                <span className="verified-badge">
                  {t("common.verified", { defaultValue: "✓ Verified" })}
                </span>
              ) : null}
            </Link>

            <div className="posted-date">
              {t("jobDetails.postedDate", {
                date: getRelativeDate(job.created_at),
                defaultValue: "Posted {{date}}",
              })}
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
              {saving
                ? t("jobDetails.saving", { defaultValue: " Saving..." })
                : t("jobDetails.save", { defaultValue: " Save" })}
            </button>

            <button className="share-btn" onClick={handleShare} type="button">
              <span className="material-symbols-outlined">share</span>
              {t("auto.share", { defaultValue: "Share" })}
            </button>
            {isAuthenticated ? (
              <button
                className={`report-btn ${alreadyReported ? "reported" : ""}`}
                onClick={() => setShowReportModal(true)}
                disabled={alreadyReported}
                type="button"
                title={
                  alreadyReported
                    ? t("jobDetails.alreadyReportedTitle", {
                        defaultValue: "You have already reported this job",
                      })
                    : t("jobDetails.reportThisJobTitle", {
                        defaultValue: "Report this job",
                      })
                }
              >
                <span className="material-symbols-outlined">flag</span>
                {alreadyReported
                  ? t("jobDetails.reported", { defaultValue: " Reported" })
                  : t("jobDetails.report", { defaultValue: " Report" })}
              </button>
            ) : (
              <button
                className="report-btn"
                onClick={() => {
                  sessionStorage.setItem("redirectAfterLogin", `/jobs/${id}`);
                  toast.error(
                    t("auto.please_login_to_report_jobs", {
                      defaultValue: "Please login to report jobs",
                    }),
                  );
                  navigate("/login");
                }}
                type="button"
              >
                <span className="material-symbols-outlined">flag</span>
                {t("auto.report", { defaultValue: "Report" })}
              </button>
            )}
          </div>
        </div>

        <div className="apply-section">
          {isOwnEmployerJob ? (
            <div className="employer-note">
              <span className="material-symbols-outlined">info</span>
              {t("auto.you_are_viewing_your_own_job_posting", {
                defaultValue: "You are viewing your own job posting",
              })}
            </div>
          ) : (
            <>
              {/* One‑click Apply with Resume button */}
              {isAuthenticated && user?.role === "job_seeker" && hasResume && (
                <button
                  className="apply-with-resume-btn"
                  onClick={() => setShowOneClickConfirmModal(true)}
                  disabled={hasApplied || applying}
                  type="button"
                >
                  {applying
                    ? t("auto.applying", { defaultValue: "Applying..." })
                    : t("jobDetails.applyWithResume", {
                        defaultValue: "⚡ Apply with Resume",
                      })}
                </button>
              )}

              <button
                className={`apply-btn ${hasApplied ? "applied" : ""}`}
                onClick={handleApply}
                disabled={hasApplied || applying}
                type="button"
              >
                {applying ? (
                  <>
                    <span className="spinner"></span>
                    {t("auto.applying", { defaultValue: "Applying..." })}
                  </>
                ) : hasApplied ? (
                  <>
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                    {t("auto.already_applied", {
                      defaultValue: "Already Applied",
                    })}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    {t("auto.apply_now", { defaultValue: "Apply Now" })}
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="material-symbols-outlined">location_on</span>
            <div>
              <label>{t("auto.location", { defaultValue: "Location" })}</label>
              <p>
                {job.location ||
                  t("jobTypes.remote", { defaultValue: "Remote" })}
              </p>
            </div>
          </div>

          <div className="metadata-item">
            <span className="material-symbols-outlined">work</span>
            <div>
              <label>{t("auto.job_type", { defaultValue: "Job Type" })}</label>
              <p className={`job-type-badge ${getJobTypeClass(job.job_type)}`}>
                {getJobTypeLabel(job.job_type)}
              </p>
            </div>
          </div>

          <div className="metadata-item">
            <span className="material-symbols-outlined">attach_money</span>
            <div>
              <label>
                {t("auto.salary_range", { defaultValue: "Salary Range" })}
              </label>
              <div className="salary-display">
                {formatSalary(job.salary_min, job.salary_max)}
                <SalaryComparisonBadge
                  jobTitle={job.title}
                  location={job.location}
                  salaryMin={job.salary_min}
                  salaryMax={job.salary_max}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="job-content-grid">
          <section className="job-main-content">
            <div className="content-card">
              <h2>
                {t("auto.job_description_3a4954", {
                  defaultValue: "Job Description",
                })}
              </h2>
              <p className="description-text">
                {job.description ||
                  t("jobDetails.noDescription", {
                    defaultValue: "No description provided.",
                  })}
              </p>
            </div>

            <div className="content-card">
              <h2>
                {t("auto.requirements_5a2ebf", {
                  defaultValue: "Requirements",
                })}
              </h2>
              <div className="requirements-text">
                {job.requirements ? (
                  <pre className="plain-text-block">{job.requirements}</pre>
                ) : (
                  <p>
                    {t("auto.no_requirements_listed", {
                      defaultValue: "No requirements listed.",
                    })}
                  </p>
                )}
              </div>
            </div>
          </section>

          <aside className="job-sidebar">
            <div className="sidebar-card">
              <h3>
                {t("auto.company_overview", {
                  defaultValue: "Company Overview",
                })}
              </h3>
              <p>
                <strong>
                  {t("auto.name_4e140b", { defaultValue: "Name:" })}
                </strong>{" "}
                {job.company_name ||
                  t("common.company", { defaultValue: "Company" })}
              </p>
              <p>
                <strong>
                  {t("auto.location_be9469", { defaultValue: "Location:" })}
                </strong>{" "}
                {job.company_location ||
                  t("common.notSpecified", { defaultValue: "Not specified" })}
              </p>
              {job.company_website ? (
                <p>
                  <strong>
                    {t("auto.website_e5cb84", { defaultValue: "Website:" })}
                  </strong>{" "}
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

        {/* Salary Insights */}
        <SalaryInsights jobTitle={job.title} location={job.location} />

        {similarJobs.length > 0 && (
          <section className="similar-jobs-section">
            <div className="section-header">
              <h2>
                {t("auto.similar_jobs", { defaultValue: "Similar Jobs" })}
              </h2>
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
          <div
            className="modal-content"
            ref={reportModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-job-modal-title"
            tabIndex="-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="report-job-modal-title">
              {t("auto.report_job", { defaultValue: "Report Job" })}
            </h2>
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label htmlFor="report-reason">
                  {t("auto.reason_d09f95", { defaultValue: "Reason *" })}
                </label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  data-autofocus
                >
                  <option value="spam">
                    {t("auto.spam", { defaultValue: "Spam" })}
                  </option>
                  <option value="fraud">
                    {t("auto.fraud", { defaultValue: "Fraud" })}
                  </option>
                  <option value="inappropriate">
                    {t("auto.inappropriate", { defaultValue: "Inappropriate" })}
                  </option>
                  <option value="duplicate">
                    {t("auto.duplicate", { defaultValue: "Duplicate" })}
                  </option>
                  <option value="other">
                    {t("auto.other", { defaultValue: "Other" })}
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="report-description">
                  {t("auto.additional_details_optional", {
                    defaultValue: "Additional details (optional)",
                  })}
                </label>
                <textarea
                  id="report-description"
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder={t("auto.provide_more_context", {
                    defaultValue: "Provide more context...",
                  })}
                  maxLength={500}
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={reporting}
                >
                  {reporting
                    ? t("jobDetails.submitting", {
                        defaultValue: "Submitting...",
                      })
                    : t("jobDetails.submitReport", {
                        defaultValue: "Submit Report",
                      })}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  {t("auto.cancel", { defaultValue: "Cancel" })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div
            className="modal-content apply-modal"
            ref={applyModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-job-modal-title"
            tabIndex="-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="apply-job-modal-title">
              {t("jobDetails.applyForJob", {
                title: job?.title,
                defaultValue: "Apply for {{title}}",
              })}
            </h2>

            {coverLetters.length === 0 ? (
              <p>
                {t(
                  "auto.you_have_no_cover_letters_create_one_in_your_dashboard",
                  {
                    defaultValue:
                      "You have no cover letters. Create one in your dashboard first.",
                  },
                )}
              </p>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="cover-letter-template">
                    {t("auto.cover_letter_template", {
                      defaultValue: "Cover Letter Template",
                    })}
                  </label>
                  <select
                    id="cover-letter-template"
                    value={selectedCoverId || ""}
                    onChange={handleCoverChange}
                    data-autofocus
                  >
                    {coverLetters.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name}{" "}
                        {cl.is_default
                          ? t("jobDetails.defaultCoverLetter", {
                              defaultValue: "⭐ (Default)",
                            })
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cover-letter-preview">
                  <div className="preview-header">
                    <h3>{t("auto.preview", { defaultValue: "Preview" })}</h3>
                    <button
                      type="button"
                      className="btn-edit-toggle"
                      onClick={toggleEdit}
                    >
                      {isEditingCover
                        ? t("jobDetails.cancelEdit", {
                            defaultValue: "Cancel Edit",
                          })
                        : t("auto.edit", { defaultValue: "Edit" })}
                    </button>
                  </div>

                  {isEditingCover ? (
                    <ReactQuill
                      value={coverContent}
                      onChange={setCoverContent}
                      theme="snow"
                      modules={{
                        toolbar: [
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["link", "clean"],
                        ],
                      }}
                    />
                  ) : (
                    <div
                      className="preview-content"
                      dangerouslySetInnerHTML={{ __html: coverContent }}
                    />
                  )}
                </div>
              </>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplySubmit}
                disabled={applying || coverLetters.length === 0}
              >
                {applying
                  ? t("jobDetails.submitting", {
                      defaultValue: "Submitting...",
                    })
                  : t("jobDetails.submitApplication", {
                      defaultValue: "Submit Application",
                    })}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowApplyModal(false)}
              >
                {t("auto.cancel", { defaultValue: "Cancel" })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One‑Click Confirmation Modal */}
      {showOneClickConfirmModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowOneClickConfirmModal(false)}
        >
          <div
            className="modal-content"
            ref={oneClickModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-apply-modal-title"
            tabIndex="-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="quick-apply-modal-title">
              {t("auto.quick_apply_with_resume", {
                defaultValue: "Quick Apply with Resume",
              })}
            </h2>
            <p>
              {t("jobDetails.quickApplyDescription", {
                title: job?.title,
                company: job?.company_name,
                defaultValue:
                  "You are about to apply for {{title}} at {{company}} using your stored resume data and default cover letter.",
              })}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleOneClickApply}
                disabled={applying}
              >
                {applying
                  ? t("jobDetails.submitting", {
                      defaultValue: "Submitting...",
                    })
                  : t("jobDetails.confirmApply", {
                      defaultValue: "Confirm & Apply",
                    })}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowOneClickConfirmModal(false)}
              >
                {t("auto.cancel", { defaultValue: "Cancel" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
