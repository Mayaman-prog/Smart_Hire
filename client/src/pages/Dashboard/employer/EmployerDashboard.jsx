import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { employerAPI, jobAPI, applicationAPI } from "../../../services/api";
import toast from "react-hot-toast";
import "./EmployerDashboard.css";

// @desc Get applications for logged in job seeker
// @route GET /api/applications/my
// @access Private (job seeker)
const EmployerDashboard = () => {
  const { t } = useTranslation();
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editJobData, setEditJobData] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);

  const [postStep, setPostStep] = useState(1);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    salary_min: "",
    salary_max: "",
    location: "",
    job_type: "full-time",
    experience_level: "mid",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Sync the tab with the URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/post-job")) {
      setActiveTab("post-job");
    } else if (path.includes("/candidates")) {
      setActiveTab("candidates");
    } else if (path.includes("/my-jobs")) {
      setActiveTab("my-jobs");
    } else {
      setActiveTab("overview");
    }
  }, [location]);

  // Fetch dashboard summary, jobs, and applicants
  const fetchData = async () => {
    setLoading(true);

    try {
      const [summaryRes, jobsRes, appsRes] = await Promise.all([
        employerAPI.getDashboardSummary(),
        jobAPI.getMyJobs(),
        applicationAPI.getEmployerApplications(),
      ]);

      setDashboardSummary(summaryRes.data.data || {});
      setJobs(jobsRes.data.data || []);
      setApplicants(appsRes.data.data || []);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      console.error("Response:", error?.response?.data);

      toast.error(
        error?.response?.data?.message || "Failed to load dashboard data",
        { id: "employer-dashboard-error" },
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard summary, jobs, and applicants on component mount and when authentication state changes (especially important for employers to see their data)
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "employer") return;
    fetchData();
  }, [authLoading, isAuthenticated, user]);

  const stats = {
    totalApplicants: dashboardSummary?.totalApplicants || 0,
    activeJobs: dashboardSummary?.activeJobs || 0,
    reviewedApplicants: dashboardSummary?.reviewedApplicants || 0,
    shortlistedApplicants: dashboardSummary?.shortlistedApplicants || 0,
    hiredApplicants: dashboardSummary?.hiredApplicants || 0,
  };

  // Apply filters to the applicants list based on selected job and status
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesJob = selectedJobId
      ? applicant.job_id === selectedJobId
      : true;
    const matchesStatus = selectedStatus
      ? applicant.status === selectedStatus
      : true;
    return matchesJob && matchesStatus;
  });

  // Calculate applicant stats for the filter bar
  const applicantStats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === "pending").length,
    reviewed: applicants.filter((a) => a.status === "reviewed").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
    hired: applicants.filter((a) => a.status === "hired").length,
  };

  // Reset the post job form to its initial state
  const resetPostForm = () => {
    setPostStep(1);
    setNewJob({
      title: "",
      description: "",
      requirements: "",
      responsibilities: "",
      salary_min: "",
      salary_max: "",
      location: "",
      job_type: "full-time",
      experience_level: "mid",
    });
  };

  // Handle changes in the post job form, updating the newJob state
  const handlePostJobChange = (field, value) => {
    setNewJob((prev) => ({ ...prev, [field]: value }));
  };

  // Handle next step in multi-step form, with validation for required fields
  const handlePostJobNext = async () => {
    if (postStep === 1 && (!newJob.title || !newJob.location)) {
      toast.error(
        t("auto.please_fill_in_title_and_location", {
          defaultValue: "Please fill in title and location",
        }),
      );
      return;
    }

    if (postStep === 2 && (!newJob.description || !newJob.requirements)) {
      toast.error(
        t("auto.please_fill_in_description_and_requirements", {
          defaultValue: "Please fill in description and requirements",
        }),
      );
      return;
    }

    if (postStep === 3) {
      try {
        const { responsibilities, ...jobData } = newJob;
        await jobAPI.createJob(jobData);

        await fetchData();
        toast.success(
          t("auto.job_posted_successfully", {
            defaultValue: "Job posted successfully",
          }),
        );

        resetPostForm();
        setActiveTab("my-jobs");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to post job");
      }
    } else {
      setPostStep((prev) => prev + 1);
    }
  };

  // Go back to previous step in multi-step form
  const handlePostJobPrev = () => {
    setPostStep((prev) => prev - 1);
  };

  // When clicking "Edit" on a job, we set that job as the one being edited and pre-fill the edit form with its data
  const handleEditJob = (job) => {
    setIsEditing(true);

    setEditJobData({
      id: job.id,
      title: job.title || "",
      location: job.location || "",
      description: job.description || "",
      requirements: job.requirements || "",
      salary_min: job.salary_min ?? "",
      salary_max: job.salary_max ?? "",
    });
  };

  // Handle changes in the edit form
  const handleUpdateJob = async () => {
    try {
      // Safety check
      if (!editJobData) {
        toast.error(
          t("auto.no_job_data_to_update", {
            defaultValue: "No job data to update",
          }),
        );
        return;
      }

      // Get the job ID from any possible field
      const jobId = editJobData.id || editJobData._id || editJobData.job_id;
      if (!jobId) {
        toast.error(
          t("auto.missing_job_id_cannot_update", {
            defaultValue: "Missing job ID \u2014 cannot update",
          }),
        );
        return;
      }

      const payload = {};

      if (editJobData.title !== undefined) payload.title = editJobData.title;
      if (editJobData.location !== undefined)
        payload.location = editJobData.location;
      if (editJobData.description !== undefined)
        payload.description = editJobData.description;
      if (editJobData.requirements !== undefined)
        payload.requirements = editJobData.requirements;
      if (editJobData.salary_min !== undefined)
        payload.salary_min = editJobData.salary_min;
      if (editJobData.salary_max !== undefined)
        payload.salary_max = editJobData.salary_max;
      await jobAPI.updateJob(jobId, payload);

      toast.success(
        t("auto.job_updated_successfully", {
          defaultValue: "Job updated successfully",
        }),
      );
      setIsEditing(false);
      setEditJobData(null);
      await fetchData();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  // Delete job with confirmation
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    setDeletingId(jobId);

    try {
      await jobAPI.deleteJob(jobId);
      toast.success(t("auto.job_deleted", { defaultValue: "Job deleted" }));
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle job active/inactive status
  const handleToggleJob = async (jobId, currentStatus) => {
    setUpdatingStatus(jobId);

    try {
      await jobAPI.updateJob(jobId, {
        is_active: currentStatus ? 0 : 1,
      });

      toast.success(currentStatus ? "Job deactivated" : "Job activated");
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to update job status",
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle status updates for applicants (e.g. from pending to reviewed)
  const handleUpdateStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);

    try {
      await applicationAPI.updateApplicationStatus(applicationId, newStatus);
      await fetchData();
      toast.success(
        t("employer.statusUpdated", {
          defaultValue: "Status updated to {{status}}",
          status: newStatus,
        }),
      );
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Extra loading state while we verify authentication and fetch data
  if (authLoading || loading) {
    return (
      <div
        className="employer-dashboard-loading"
        role="status"
        aria-live="polite"
      >
        {t("auto.loading", { defaultValue: "Loading..." })}
      </div>
    );
  }

  // Extra protection in case user role is not correct
  return (
    <div className="employer-dashboard">
      <div className="dashboard-container">
        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="welcome-header">
                <h1>
                  Welcome back, {user?.name?.split(" ")[0] || "Employer"}!
                </h1>
                <p>
                  {t(
                    "auto.here_apos_s_what_apos_s_happening_with_your_hiring_pipe",
                    {
                      defaultValue:
                        "Here&apos;s what&apos;s happening with your hiring pipeline today.",
                    },
                  )}
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.totalApplicants}</span>
                  <span className="stat-label">
                    {t("auto.total_applicants", {
                      defaultValue: "Total Applicants",
                    })}
                  </span>
                  <span className="stat-change neutral">
                    {t("auto.across_all_jobs", {
                      defaultValue: "Across all jobs",
                    })}
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">{stats.activeJobs}</span>
                  <span className="stat-label">
                    {t("auto.active_jobs", { defaultValue: "Active Jobs" })}
                  </span>
                  <span className="stat-change neutral">
                    {t("auto.currently_open", {
                      defaultValue: "Currently open",
                    })}
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">{stats.reviewedApplicants}</span>
                  <span className="stat-label">
                    {t("auto.reviewed_applicants", {
                      defaultValue: "Reviewed Applicants",
                    })}
                  </span>
                  <span className="stat-change neutral">
                    {t("auto.in_screening_stage", {
                      defaultValue: "In screening stage",
                    })}
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">
                    {stats.shortlistedApplicants}
                  </span>
                  <span className="stat-label">
                    {t("auto.shortlisted_applicants", {
                      defaultValue: "Shortlisted Applicants",
                    })}
                  </span>
                  <span className="stat-change positive">
                    {t("auto.ready_for_next_step", {
                      defaultValue: "Ready for next step",
                    })}
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">{stats.hiredApplicants}</span>
                  <span className="stat-label">
                    {t("auto.hired_candidates", {
                      defaultValue: "Hired Candidates",
                    })}
                  </span>
                  <span className="stat-change positive">
                    {t("auto.successful_hires", {
                      defaultValue: "Successful hires",
                    })}
                  </span>
                </div>
              </div>

              {/* Onboarding / Getting Started Card */}
              {stats.totalApplicants === 0 && stats.activeJobs === 0 && (
                <div className="onboarding-card">
                  <div className="onboarding-header">
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      rocket_launch
                    </span>
                    <h3>
                      {t("auto.you_re_all_set_to_start_hiring", {
                        defaultValue: "You're all set to start hiring!",
                      })}
                    </h3>
                  </div>
                  <p>
                    {t(
                      "auto.here_s_how_to_get_your_first_job_posted_and_start_recei",
                      {
                        defaultValue:
                          "Here's how to get your first job posted and start receiving applications.",
                      },
                    )}
                  </p>
                  <div className="onboarding-steps">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <strong>
                          {t("auto.post_your_first_job_42ee9a", {
                            defaultValue: "Post Your First Job",
                          })}
                        </strong>
                        <p>
                          {t(
                            "auto.write_a_compelling_job_description_and_set_your_salary",
                            {
                              defaultValue:
                                "Write a compelling job description and set your salary range.",
                            },
                          )}
                        </p>
                        <button
                          className="btn-primary"
                          type="button"
                          aria-label={t("auto.post_a_new_job", {
                            defaultValue: "Post a new job",
                          })}
                          onClick={() =>
                            navigate("/dashboard/employer/post-job")
                          }
                        >
                          {t("auto.post_a_job", { defaultValue: "Post a Job" })}
                        </button>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <strong>
                          {t("auto.review_applications", {
                            defaultValue: "Review Applications",
                          })}
                        </strong>
                        <p>
                          {t(
                            "auto.once_candidates_apply_you_ll_see_them_here_you_can_revi",
                            {
                              defaultValue:
                                "Once candidates apply, you'll see them here. You can review, shortlist, or reject them.",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <strong>
                          {t("auto.hire_your_perfect_candidate", {
                            defaultValue: "Hire Your Perfect Candidate",
                          })}
                        </strong>
                        <p>
                          {t(
                            "auto.when_you_find_the_right_person_mark_them_as_hired_and_c",
                            {
                              defaultValue:
                                'When you find the right person, mark them as "Hired" and celebrate your success!',
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "post-job" && (
            <div className="post-job-tab">
              <h2>
                {t("auto.post_a_new_job_3dee8a", {
                  defaultValue: "Post a New Job",
                })}
              </h2>

              <div className="multi-step-form">
                <div className="step-indicator">
                  <div className={`step ${postStep >= 1 ? "active" : ""}`}>
                    {t("auto.1_basic_info", { defaultValue: "1. Basic Info" })}
                  </div>
                  <div className={`step ${postStep >= 2 ? "active" : ""}`}>
                    {t("auto.2_details", { defaultValue: "2. Details" })}
                  </div>
                  <div className={`step ${postStep >= 3 ? "active" : ""}`}>
                    {t("auto.3_review", { defaultValue: "3. Review" })}
                  </div>
                </div>

                {postStep === 1 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label htmlFor="job-title">
                        {t("auto.job_title_4aec7f", {
                          defaultValue: "Job Title *",
                        })}
                      </label>
                      <input
                        id="job-title"
                        type="text"
                        value={newJob.title}
                        onChange={(e) =>
                          handlePostJobChange("title", e.target.value)
                        }
                        placeholder={t("auto.e_g_senior_frontend_developer", {
                          defaultValue: "e.g., Senior Frontend Developer",
                        })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="job-location">
                        {t("auto.location_90e063", {
                          defaultValue: "Location *",
                        })}
                      </label>
                      <input
                        id="job-location"
                        type="text"
                        value={newJob.location}
                        onChange={(e) =>
                          handlePostJobChange("location", e.target.value)
                        }
                        placeholder={t("auto.e_g_san_francisco_ca_or_remote", {
                          defaultValue: "e.g., San Francisco, CA or Remote",
                        })}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="salary-min">
                          {t("auto.salary_min", { defaultValue: "Salary Min" })}
                        </label>
                        <input
                          id="salary-min"
                          type="number"
                          value={newJob.salary_min}
                          onChange={(e) =>
                            handlePostJobChange("salary_min", e.target.value)
                          }
                          placeholder={t("auto.e_g_80000", {
                            defaultValue: "e.g., 80000",
                          })}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="salary-max">
                          {t("auto.salary_max", { defaultValue: "Salary Max" })}
                        </label>
                        <input
                          id="salary-max"
                          type="number"
                          value={newJob.salary_max}
                          onChange={(e) =>
                            handlePostJobChange("salary_max", e.target.value)
                          }
                          placeholder={t("auto.e_g_120000", {
                            defaultValue: "e.g., 120000",
                          })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="job-type">
                          {t("auto.job_type", { defaultValue: "Job Type" })}
                        </label>
                        <select
                          id="job-type"
                          value={newJob.job_type}
                          onChange={(e) =>
                            handlePostJobChange("job_type", e.target.value)
                          }
                        >
                          <option value="full-time">
                            {t("auto.full_time_c00a28", {
                              defaultValue: "Full-time",
                            })}
                          </option>
                          <option value="part-time">
                            {t("auto.part_time_1f3df4", {
                              defaultValue: "Part-time",
                            })}
                          </option>
                          <option value="remote">
                            {t("auto.remote", { defaultValue: "Remote" })}
                          </option>
                          <option value="contract">
                            {t("auto.contract", { defaultValue: "Contract" })}
                          </option>
                          <option value="internship">
                            {t("auto.internship", {
                              defaultValue: "Internship",
                            })}
                          </option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="experience-level">
                          {t("auto.experience_level", {
                            defaultValue: "Experience Level",
                          })}
                        </label>
                        <select
                          id="experience-level"
                          value={newJob.experience_level}
                          onChange={(e) =>
                            handlePostJobChange(
                              "experience_level",
                              e.target.value,
                            )
                          }
                        >
                          <option value="entry">
                            {t("auto.entry_level", {
                              defaultValue: "Entry Level",
                            })}
                          </option>
                          <option value="mid">
                            {t("auto.mid_level", { defaultValue: "Mid Level" })}
                          </option>
                          <option value="senior">
                            {t("auto.senior_level", {
                              defaultValue: "Senior Level",
                            })}
                          </option>
                          <option value="lead">
                            {t("auto.lead", { defaultValue: "Lead" })}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {postStep === 2 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label htmlFor="job-description">
                        {t("auto.job_description", {
                          defaultValue: "Job Description *",
                        })}
                      </label>
                      <textarea
                        id="job-description"
                        rows="4"
                        value={newJob.description}
                        onChange={(e) =>
                          handlePostJobChange("description", e.target.value)
                        }
                        placeholder={t("auto.describe_the_role_clearly", {
                          defaultValue: "Describe the role clearly...",
                        })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="job-requirements">
                        {t("auto.requirements", {
                          defaultValue: "Requirements *",
                        })}
                      </label>
                      <textarea
                        id="job-requirements"
                        rows="4"
                        value={newJob.requirements}
                        onChange={(e) =>
                          handlePostJobChange("requirements", e.target.value)
                        }
                        placeholder={t(
                          "auto.list_required_skills_experience_education",
                          {
                            defaultValue:
                              "List required skills, experience, education...",
                          },
                        )}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="job-responsibilities">
                        {t("auto.responsibilities_optional", {
                          defaultValue: "Responsibilities (Optional)",
                        })}
                      </label>
                      <textarea
                        id="job-responsibilities"
                        rows="3"
                        value={newJob.responsibilities}
                        onChange={(e) =>
                          handlePostJobChange(
                            "responsibilities",
                            e.target.value,
                          )
                        }
                        placeholder={t(
                          "auto.this_is_only_shown_in_review_for_now",
                          {
                            defaultValue:
                              "This is only shown in review for now",
                          },
                        )}
                      />
                    </div>
                  </div>
                )}

                {postStep === 3 && (
                  <div className="form-step review-step">
                    <h3>
                      {t("auto.review_your_job_post", {
                        defaultValue: "Review Your Job Post",
                      })}
                    </h3>

                    <div className="review-card">
                      <p>
                        <strong>
                          {t("auto.title_51ec9b", { defaultValue: "Title:" })}
                        </strong>{" "}
                        {newJob.title}
                      </p>
                      <p>
                        <strong>
                          {t("auto.location_be9469", {
                            defaultValue: "Location:",
                          })}
                        </strong>{" "}
                        {newJob.location}
                      </p>
                      <p>
                        <strong>
                          {t("auto.salary", { defaultValue: "Salary:" })}
                        </strong>{" "}
                        {newJob.salary_min} - {newJob.salary_max}
                      </p>
                      <p>
                        <strong>
                          {t("auto.type", { defaultValue: "Type:" })}
                        </strong>{" "}
                        {newJob.job_type}
                      </p>
                      <p>
                        <strong>
                          {t("auto.experience", {
                            defaultValue: "Experience:",
                          })}
                        </strong>{" "}
                        {newJob.experience_level}
                      </p>
                      <p>
                        <strong>
                          {t("auto.description", {
                            defaultValue: "Description:",
                          })}
                        </strong>{" "}
                        {newJob.description}
                      </p>
                      <p>
                        <strong>
                          {t("auto.requirements_3b31c3", {
                            defaultValue: "Requirements:",
                          })}
                        </strong>{" "}
                        {newJob.requirements}
                      </p>
                      <p>
                        <strong>
                          {t("auto.responsibilities", {
                            defaultValue: "Responsibilities:",
                          })}
                        </strong>{" "}
                        {newJob.responsibilities ||
                          t("common.notSpecified", {
                            defaultValue: "Not specified",
                          })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  {postStep > 1 && (
                    <button type="button" onClick={handlePostJobPrev}>
                      {t("auto.previous", { defaultValue: "Previous" })}
                    </button>
                  )}

                  <button type="button" onClick={handlePostJobNext}>
                    {postStep === 3
                      ? t("auto.post_job", { defaultValue: "Post Job" })
                      : t("auto.next", { defaultValue: "Next" })}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetPostForm();
                      setActiveTab("overview");
                    }}
                  >
                    {t("auto.cancel", { defaultValue: "Cancel" })}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "my-jobs" && (
            <div className="my-jobs-tab">
              <h2>{t("auto.my_jobs", { defaultValue: "My Jobs" })}</h2>

              {jobs.length === 0 ? (
                <p>
                  {t("auto.no_jobs_posted_yet", {
                    defaultValue: "No jobs posted yet.",
                  })}
                </p>
              ) : (
                <div className="jobs-list">
                  {jobs.map((job) => (
                    <div key={job.id} className="job-card">
                      <div className="job-header">
                        <h3>{job.title}</h3>
                        <span
                          className={`status-badge ${
                            job.is_active ? "active" : "closed"
                          }`}
                        >
                          {job.is_active ? "Active" : "Closed"}
                        </span>
                      </div>

                      <p className="job-location">{job.location}</p>

                      <p className="job-salary">
                        ${Number(job.salary_min || 0).toLocaleString()} - $
                        {Number(job.salary_max || 0).toLocaleString()}
                      </p>

                      <p className="job-applicants">
                        {job.applications_count || 0} applicants
                      </p>

                      <div className="job-actions">
                        <button
                          type="button"
                          aria-label={`Edit ${job.title}`}
                          className="btn-secondary"
                          onClick={() => handleEditJob(job)}
                        >
                          {t("auto.edit", { defaultValue: "Edit" })}
                        </button>
                        <button
                          type="button"
                          aria-label={
                            job.is_active
                              ? `Deactivate ${job.title}`
                              : `Activate ${job.title}`
                          }
                          className="btn-warning"
                          onClick={() => handleToggleJob(job.id, job.is_active)}
                        >
                          {job.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${job.title}`}
                          className="btn-danger"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          {t("auto.delete", { defaultValue: "Delete" })}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="applicants-tab">
              <div className="applicants-header">
                <h2>{t("auto.applicants", { defaultValue: "Applicants" })}</h2>
                <p>
                  {t("auto.manage_candidates_across_all_your_job_postings", {
                    defaultValue:
                      "Manage candidates across all your job postings.",
                  })}
                </p>
              </div>

              {/* Applicants Stats */}
              <div className="applicant-stats-grid">
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.total}
                  </span>
                  <span className="mini-stat-label">
                    {t("auto.total", { defaultValue: "Total" })}
                  </span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.pending}
                  </span>
                  <span className="mini-stat-label">
                    {t("auto.pending_2d13df", { defaultValue: "Pending" })}
                  </span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.reviewed}
                  </span>
                  <span className="mini-stat-label">
                    {t("auto.reviewed", { defaultValue: "Reviewed" })}
                  </span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.shortlisted}
                  </span>
                  <span className="mini-stat-label">
                    {t("auto.shortlisted", { defaultValue: "Shortlisted" })}
                  </span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.hired}
                  </span>
                  <span className="mini-stat-label">
                    {t("auto.hired", { defaultValue: "Hired" })}
                  </span>
                </div>
              </div>

              <div className="filter-bar">
                <div className="filter-group">
                  <label htmlFor="filter-job">
                    {t("auto.filter_by_job", {
                      defaultValue: "Filter by Job:",
                    })}
                  </label>
                  <select
                    id="filter-job"
                    value={selectedJobId || ""}
                    onChange={(e) =>
                      setSelectedJobId(
                        e.target.value ? parseInt(e.target.value, 10) : null,
                      )
                    }
                  >
                    <option value="">
                      {t("auto.all_jobs", { defaultValue: "All Jobs" })}
                    </option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="filter-status">
                    {t("auto.filter_by_status", {
                      defaultValue: "Filter by Status:",
                    })}
                  </label>
                  <select
                    id="filter-status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">
                      {t("auto.all_statuses_a775fc", {
                        defaultValue: "All Statuses",
                      })}
                    </option>
                    <option value="pending">
                      {t("auto.pending_2d13df", { defaultValue: "Pending" })}
                    </option>
                    <option value="reviewed">
                      {t("auto.reviewed", { defaultValue: "Reviewed" })}
                    </option>
                    <option value="shortlisted">
                      {t("auto.shortlisted", { defaultValue: "Shortlisted" })}
                    </option>
                    <option value="rejected">
                      {t("auto.rejected", { defaultValue: "Rejected" })}
                    </option>
                    <option value="hired">
                      {t("auto.hired", { defaultValue: "Hired" })}
                    </option>
                  </select>
                </div>
              </div>

              {/* Applicants List */}
              {filteredApplicants.length === 0 ? (
                <div className="empty-state-illustrated">
                  <div className="empty-icon-wrapper">
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      group_off
                    </span>
                  </div>
                  <h3>
                    {t("auto.no_applicants_found", {
                      defaultValue: "No applicants found",
                    })}
                  </h3>
                  <p>
                    {t(
                      "auto.we_haven_apos_t_received_any_applications_yet_for_the_s",
                      {
                        defaultValue:
                          "We haven&apos;t received any applications yet for the selected filters.",
                      },
                    )}
                  </p>
                  <button
                    type="button"
                    aria-label={t("auto.post_your_first_job", {
                      defaultValue: "Post your first job",
                    })}
                    className="btn-ghost"
                    onClick={() => navigate("/dashboard/employer/post-job")}
                  >
                    {t("auto.post_your_first_job_9c17eb", {
                      defaultValue: "Post your first job \u2192",
                    })}
                  </button>
                </div>
              ) : (
                <div className="applicants-list">
                  {filteredApplicants.map((applicant) => {
                    const appliedDate =
                      applicant.applied_at || applicant.created_at;
                    const isUpdating = updatingStatus === applicant.id;

                    return (
                      <div key={applicant.id} className="applicant-card">
                        {/* Left: Person Info */}
                        <div className="applicant-person">
                          <div className="applicant-avatar" aria-hidden="true">
                            {(
                              applicant.applicant_name ||
                              applicant.candidate_name ||
                              "?"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="applicant-details">
                            <h3>
                              {applicant.applicant_name ||
                                applicant.candidate_name ||
                                "Unnamed Applicant"}
                            </h3>
                            <p>{applicant.job_title || "Unknown Position"}</p>
                            <p>
                              Applied:{" "}
                              {appliedDate
                                ? new Date(appliedDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                            {applicant.applicant_email && (
                              <p>Email: {applicant.applicant_email}</p>
                            )}
                          </div>
                        </div>

                        {/* Middle: Status */}
                        <div className="applicant-status">
                          <span
                            className={`status-badge status-${applicant.status}`}
                          >
                            {applicant.status}
                          </span>
                        </div>

                        {/* Right: Actions */}
                        <div className="applicant-actions">
                          <button
                            type="button"
                            aria-label={t("auto.mark_applicant_as_reviewed", {
                              defaultValue: "Mark applicant as reviewed",
                            })}
                            className="btn-review"
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "reviewed")
                            }
                            disabled={
                              isUpdating || applicant.status === "reviewed"
                            }
                          >
                            {isUpdating && applicant.status !== "reviewed"
                              ? "..."
                              : "Review"}
                          </button>

                          <button
                            type="button"
                            aria-label={t("auto.shortlist_applicant", {
                              defaultValue: "Shortlist applicant",
                            })}
                            className="btn-shortlist"
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "shortlisted")
                            }
                            disabled={
                              isUpdating || applicant.status === "shortlisted"
                            }
                          >
                            {isUpdating && applicant.status !== "shortlisted"
                              ? "..."
                              : "Shortlist"}
                          </button>

                          <button
                            type="button"
                            aria-label={t("auto.reject_applicant", {
                              defaultValue: "Reject applicant",
                            })}
                            className="btn-reject"
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "rejected")
                            }
                            disabled={
                              isUpdating || applicant.status === "rejected"
                            }
                          >
                            {isUpdating && applicant.status !== "rejected"
                              ? "..."
                              : "Reject"}
                          </button>

                          <button
                            type="button"
                            className="btn-hire"
                            aria-label={t("auto.hire_applicant", {
                              defaultValue: "Hire applicant",
                            })}
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "hired")
                            }
                            disabled={
                              isUpdating || applicant.status === "hired"
                            }
                          >
                            {isUpdating && applicant.status !== "hired"
                              ? "..."
                              : "Hire"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isEditing && editJobData && (
            <div className="modal-overlay" onClick={() => setIsEditing(false)}>
              <div
                className="modal-content"
                role="dialog"
                onClick={(e) => e.stopPropagation()}
                aria-modal="true"
                aria-labelledby="edit-job-title"
              >
                <h3 id="edit-job-title">
                  {t("auto.edit_job", { defaultValue: "Edit Job" })}
                </h3>

                <div className="form-group">
                  <label htmlFor="edit-title">
                    {t("auto.title", { defaultValue: "Title" })}
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editJobData.title}
                    onChange={(e) =>
                      setEditJobData({ ...editJobData, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-location">
                    {t("auto.location", { defaultValue: "Location" })}
                  </label>
                  <input
                    id="edit-location"
                    type="text"
                    value={editJobData.location}
                    onChange={(e) =>
                      setEditJobData({
                        ...editJobData,
                        location: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-salary-min">
                      {t("auto.salary_min", { defaultValue: "Salary Min" })}
                    </label>
                    <input
                      id="edit-salary-min"
                      type="number"
                      value={editJobData.salary_min}
                      onChange={(e) =>
                        setEditJobData({
                          ...editJobData,
                          salary_min:
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-salary-max">
                      {t("auto.salary_max", { defaultValue: "Salary Max" })}
                    </label>
                    <input
                      id="edit-salary-max"
                      type="number"
                      value={editJobData.salary_max}
                      onChange={(e) =>
                        setEditJobData({
                          ...editJobData,
                          salary_max:
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">
                    {t("auto.description_b5a7ad", {
                      defaultValue: "Description",
                    })}
                  </label>
                  <textarea
                    id="edit-description"
                    value={editJobData.description}
                    onChange={(e) =>
                      setEditJobData({
                        ...editJobData,
                        description: e.target.value,
                      })
                    }
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-requirements">
                    {t("auto.requirements_5a2ebf", {
                      defaultValue: "Requirements",
                    })}
                  </label>
                  <textarea
                    id="edit-requirements"
                    value={editJobData.requirements}
                    onChange={(e) =>
                      setEditJobData({
                        ...editJobData,
                        requirements: e.target.value,
                      })
                    }
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleUpdateJob}>
                    {t("auto.save", { defaultValue: "Save" })}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditJobData(null);
                    }}
                  >
                    {t("auto.cancel", { defaultValue: "Cancel" })}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployerDashboard;
