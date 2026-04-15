import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { employerAPI, jobAPI, applicationAPI } from "../../../services/api";
import toast from "react-hot-toast";
import "./EmployerDashboard.css";

// @desc Get applications for logged in job seeker
// @route GET /api/applications/my
// @access Private (job seeker)
const EmployerDashboard = () => {
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [editingJob, setEditingJob] = useState(null);
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
      toast.error("Please fill in title and location");
      return;
    }

    if (postStep === 2 && (!newJob.description || !newJob.requirements)) {
      toast.error("Please fill in description and requirements");
      return;
    }

    if (postStep === 3) {
      try {
        const { responsibilities, ...jobData } = newJob;
        await jobAPI.createJob(jobData);

        await fetchData();
        toast.success("Job posted successfully");

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
    setEditingJob(job);
    setEditJobData({
      ...job,
      salary_min: job.salary_min ?? "",
      salary_max: job.salary_max ?? "",
    });
  };

  // Handle changes in the edit form
  const handleUpdateJob = async () => {
    try {
      await jobAPI.updateJob(editJobData.id, editJobData);
      toast.success("Job updated");
      setEditingJob(null);
      setEditJobData(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  // Delete job with confirmation
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    setDeletingId(jobId);

    try {
      await jobAPI.deleteJob(jobId);
      toast.success("Job deleted");
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
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Extra loading state while we verify authentication and fetch data
  if (authLoading || loading) {
    return <div className="employer-dashboard-loading">Loading...</div>;
  }

  // Extra protection in case user role is not correct
  return (
    <div className="employer-dashboard">
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="company-info">
            <div className="company-avatar">
              <span className="material-symbols-outlined">business</span>
            </div>
            <h3>{user?.company_name || "Your Company"}</h3>
            <p>{user?.email}</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              <span className="material-symbols-outlined">dashboard</span>{" "}
              Overview
            </button>

            <button
              className={activeTab === "post-job" ? "active" : ""}
              onClick={() => {
                resetPostForm();
                setActiveTab("post-job");
              }}
            >
              <span className="material-symbols-outlined">post_add</span> Post a
              Job
            </button>

            <button
              className={activeTab === "my-jobs" ? "active" : ""}
              onClick={() => setActiveTab("my-jobs")}
            >
              <span className="material-symbols-outlined">work</span> My Jobs
            </button>

            <button
              className={activeTab === "applicants" ? "active" : ""}
              onClick={() => setActiveTab("applicants")}
            >
              <span className="material-symbols-outlined">people</span>{" "}
              Applicants
            </button>
          </nav>

          <div className="sidebar-footer">
            <button
              className="help-btn"
              onClick={() => toast.info("Help & Support coming soon")}
            >
              <span className="material-symbols-outlined">help</span> Help
            </button>

            <button className="logout-btn" onClick={logout}>
              <span className="material-symbols-outlined">logout</span> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="welcome-header">
                <h1>
                  Welcome back, {user?.name?.split(" ")[0] || "Employer"}!
                </h1>
                <p>
                  Here&apos;s what&apos;s happening with your hiring pipeline
                  today.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.totalApplicants}</span>
                  <span className="stat-label">Total Applicants</span>
                  <span className="stat-change neutral">Across all jobs</span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">{stats.activeJobs}</span>
                  <span className="stat-label">Active Jobs</span>
                  <span className="stat-change neutral">Currently open</span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">{stats.reviewedApplicants}</span>
                  <span className="stat-label">Reviewed Applicants</span>
                  <span className="stat-change neutral">
                    In screening stage
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">
                    {stats.shortlistedApplicants}
                  </span>
                  <span className="stat-label">Shortlisted Applicants</span>
                  <span className="stat-change positive">
                    Ready for next step
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">{stats.hiredApplicants}</span>
                  <span className="stat-label">Hired Candidates</span>
                  <span className="stat-change positive">Successful hires</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "post-job" && (
            <div className="post-job-tab">
              <h2>Post a New Job</h2>

              <div className="multi-step-form">
                <div className="step-indicator">
                  <div className={`step ${postStep >= 1 ? "active" : ""}`}>
                    1. Basic Info
                  </div>
                  <div className={`step ${postStep >= 2 ? "active" : ""}`}>
                    2. Details
                  </div>
                  <div className={`step ${postStep >= 3 ? "active" : ""}`}>
                    3. Review
                  </div>
                </div>

                {postStep === 1 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label>Job Title *</label>
                      <input
                        type="text"
                        value={newJob.title}
                        onChange={(e) =>
                          handlePostJobChange("title", e.target.value)
                        }
                        placeholder="e.g., Senior Frontend Developer"
                      />
                    </div>

                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        value={newJob.location}
                        onChange={(e) =>
                          handlePostJobChange("location", e.target.value)
                        }
                        placeholder="e.g., San Francisco, CA or Remote"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Salary Min</label>
                        <input
                          type="number"
                          value={newJob.salary_min}
                          onChange={(e) =>
                            handlePostJobChange("salary_min", e.target.value)
                          }
                          placeholder="e.g., 80000"
                        />
                      </div>

                      <div className="form-group">
                        <label>Salary Max</label>
                        <input
                          type="number"
                          value={newJob.salary_max}
                          onChange={(e) =>
                            handlePostJobChange("salary_max", e.target.value)
                          }
                          placeholder="e.g., 120000"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Job Type</label>
                        <select
                          value={newJob.job_type}
                          onChange={(e) =>
                            handlePostJobChange("job_type", e.target.value)
                          }
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="remote">Remote</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Experience Level</label>
                        <select
                          value={newJob.experience_level}
                          onChange={(e) =>
                            handlePostJobChange(
                              "experience_level",
                              e.target.value,
                            )
                          }
                        >
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid Level</option>
                          <option value="senior">Senior Level</option>
                          <option value="lead">Lead</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {postStep === 2 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label>Job Description *</label>
                      <textarea
                        rows="4"
                        value={newJob.description}
                        onChange={(e) =>
                          handlePostJobChange("description", e.target.value)
                        }
                        placeholder="Describe the role clearly..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Requirements *</label>
                      <textarea
                        rows="4"
                        value={newJob.requirements}
                        onChange={(e) =>
                          handlePostJobChange("requirements", e.target.value)
                        }
                        placeholder="List required skills, experience, education..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Responsibilities (Optional)</label>
                      <textarea
                        rows="3"
                        value={newJob.responsibilities}
                        onChange={(e) =>
                          handlePostJobChange(
                            "responsibilities",
                            e.target.value,
                          )
                        }
                        placeholder="This is only shown in review for now"
                      />
                    </div>
                  </div>
                )}

                {postStep === 3 && (
                  <div className="form-step review-step">
                    <h3>Review Your Job Post</h3>

                    <div className="review-card">
                      <p>
                        <strong>Title:</strong> {newJob.title}
                      </p>
                      <p>
                        <strong>Location:</strong> {newJob.location}
                      </p>
                      <p>
                        <strong>Salary:</strong> {newJob.salary_min} -{" "}
                        {newJob.salary_max}
                      </p>
                      <p>
                        <strong>Type:</strong> {newJob.job_type}
                      </p>
                      <p>
                        <strong>Experience:</strong> {newJob.experience_level}
                      </p>
                      <p>
                        <strong>Description:</strong> {newJob.description}
                      </p>
                      <p>
                        <strong>Requirements:</strong> {newJob.requirements}
                      </p>
                      <p>
                        <strong>Responsibilities:</strong>{" "}
                        {newJob.responsibilities || "Not specified"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  {postStep > 1 && (
                    <button onClick={handlePostJobPrev}>Previous</button>
                  )}

                  <button onClick={handlePostJobNext}>
                    {postStep === 3 ? "Post Job" : "Next"}
                  </button>

                  <button
                    onClick={() => {
                      resetPostForm();
                      setActiveTab("overview");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "my-jobs" && (
            <div className="my-jobs-tab">
              <h2>My Jobs</h2>

              {jobs.length === 0 ? (
                <p>No jobs posted yet.</p>
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
                          className="btn-secondary"
                          onClick={() => handleEditJob(job)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-secondary"
                          onClick={() => handleToggleJob(job.id, job.is_active)}
                          disabled={updatingStatus === job.id}
                        >
                          {updatingStatus === job.id
                            ? "Updating..."
                            : job.is_active
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                        >
                          {deletingId === job.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "applicants" && (
            <div className="applicants-tab">
              <div className="applicants-header">
                <h2>Applicants</h2>
                <p>Manage candidates across all your job postings.</p>
              </div>

              <div className="applicant-stats-grid">
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.total}
                  </span>
                  <span className="mini-stat-label">Total</span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.pending}
                  </span>
                  <span className="mini-stat-label">Pending</span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.reviewed}
                  </span>
                  <span className="mini-stat-label">Reviewed</span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.shortlisted}
                  </span>
                  <span className="mini-stat-label">Shortlisted</span>
                </div>
                <div className="mini-stat-card">
                  <span className="mini-stat-value">
                    {applicantStats.hired}
                  </span>
                  <span className="mini-stat-label">Hired</span>
                </div>
              </div>

              <div className="filter-bar">
                <div className="filter-group">
                  <label>Filter by Job:</label>
                  <select
                    value={selectedJobId || ""}
                    onChange={(e) =>
                      setSelectedJobId(
                        e.target.value ? parseInt(e.target.value, 10) : null,
                      )
                    }
                  >
                    <option value="">All Jobs</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Filter by Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </div>
              </div>

              {filteredApplicants.length === 0 ? (
                <div className="empty-state-card">
                  <h3>No applicants found</h3>
                  <p>
                    There are no applicants matching the current filters. Try
                    switching the job or status filter.
                  </p>
                </div>
              ) : (
                <div className="applicants-list">
                  {filteredApplicants.map((applicant) => {
                    const appliedDate =
                      applicant.applied_at || applicant.created_at;
                    const isUpdating = updatingStatus === applicant.id;

                    return (
                      <div key={applicant.id} className="applicant-card">
                        <div className="applicant-top">
                          <div className="applicant-info">
                            <h4>
                              {applicant.applicant_name ||
                                applicant.candidate_name ||
                                "Unnamed Applicant"}
                            </h4>

                            <p className="applicant-job">
                              {applicant.job_title}
                            </p>

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

                          <div className="applicant-status-wrap">
                            <span
                              className={`status-badge status-${applicant.status}`}
                            >
                              {applicant.status}
                            </span>
                          </div>
                        </div>

                        <div className="applicant-actions">
                          <button
                            className={
                              applicant.status === "reviewed"
                                ? "active-action"
                                : ""
                            }
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "reviewed")
                            }
                            disabled={
                              isUpdating || applicant.status === "reviewed"
                            }
                          >
                            {isUpdating && applicant.status !== "reviewed"
                              ? "Updating..."
                              : "Review"}
                          </button>

                          <button
                            className={
                              applicant.status === "shortlisted"
                                ? "active-action"
                                : ""
                            }
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "shortlisted")
                            }
                            disabled={
                              isUpdating || applicant.status === "shortlisted"
                            }
                          >
                            {isUpdating && applicant.status !== "shortlisted"
                              ? "Updating..."
                              : "Shortlist"}
                          </button>

                          <button
                            className={
                              applicant.status === "rejected"
                                ? "active-action"
                                : ""
                            }
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "rejected")
                            }
                            disabled={
                              isUpdating || applicant.status === "rejected"
                            }
                          >
                            {isUpdating && applicant.status !== "rejected"
                              ? "Updating..."
                              : "Reject"}
                          </button>

                          <button
                            className={
                              applicant.status === "hired"
                                ? "active-action"
                                : ""
                            }
                            onClick={() =>
                              handleUpdateStatus(applicant.id, "hired")
                            }
                            disabled={
                              isUpdating || applicant.status === "hired"
                            }
                          >
                            {isUpdating && applicant.status !== "hired"
                              ? "Updating..."
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

          {editingJob && editJobData && (
            <div className="modal-overlay" onClick={() => setEditingJob(null)}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Edit Job</h3>

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editJobData.title}
                    onChange={(e) =>
                      setEditJobData({ ...editJobData, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
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
                    <label>Salary Min</label>
                    <input
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
                    <label>Salary Max</label>
                    <input
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
                  <label>Description</label>
                  <textarea
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
                  <label>Requirements</label>
                  <textarea
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
                  <button onClick={handleUpdateJob}>Save</button>
                  <button
                    onClick={() => {
                      setEditingJob(null);
                      setEditJobData(null);
                    }}
                  >
                    Cancel
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
