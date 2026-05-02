import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  applicationAPI,
  savedJobsAPI,
  userAPI,
  jobAPI,
  notificationAPI,
  savedSearchAPI,
  getCoverLetters,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  setDefaultCoverLetter,
} from "../../../services/api";
import toast from "react-hot-toast";
import ResumeUpload from "../../../components/common/ResumeUpload/ResumeUpload";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./JobSeekerDashboard.css";

/**
 * JobSeekerDashboard Component
 * Main dashboard for job seekers displaying:
 * - Overview with stats and recommended jobs
 * - Applied jobs with withdrawal option
 * - Saved jobs for bookmarking
 * - Saved searches for job alerts
 * - Profile settings and resume upload
 */
const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [coverLetters, setCoverLetters] = useState([]);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [editingCover, setEditingCover] = useState(null);
  const [coverForm, setCoverForm] = useState({ name: "", content: "" });
  const [coverDeleteConfirm, setCoverDeleteConfirm] = useState(null);

  const [showSearchForm, setShowSearchForm] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);
  const [searchForm, setSearchForm] = useState({
    name: "",
    keyword: "",
    location: "",
    job_type: "full-time",
    salary_min: "",
    salary_max: "",
    alert_frequency: "instant",
  });
  const [searchLoading, setSearchLoading] = useState(false);

  const [withdrawing, setWithdrawing] = useState(null);
  const [removingSaved, setRemovingSaved] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State to hold the current resume URL for display and updates
  const [resumeUrl, setResumeUrl] = useState(user?.resume_url || null);

  useEffect(() => {
    setResumeUrl(user?.resume_url || null);
  }, [user]);

  // Calculate profile strength based on completeness of profile and activity
  const calculateProfileStrength = () => {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.email) score += 20;
    if (resumeUrl) score += 30;
    if (applications.length > 0) score += 15;
    return score;
  };

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);

  // Fetch all necessary dashboard data on component mount and when auth state changes
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "job_seeker") return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [appsRes, savedRes, notifRes, searchRes] = await Promise.all([
          applicationAPI.getMyApplications(),
          savedJobsAPI.getSavedJobs(),
          notificationAPI.getNotifications(),
          savedSearchAPI
            .getSavedSearches()
            .catch(() => ({ data: { data: [] } })),
        ]);

        let recommendedRes = { data: { data: [] } };
        try {
          recommendedRes = await jobAPI.getRecommendedJobs();
        } catch {
          try {
            recommendedRes = await jobAPI.getJobs({ limit: 6 });
          } catch {
            // If even fetching general jobs fails, we'll just show an empty list
          }
        }

        // Update state with fetched data
        setApplications(appsRes.data?.data || []);
        setSavedJobs(savedRes.data?.data || []);
        setSavedSearches(searchRes.data?.data || []);
        setRecommendedJobs(recommendedRes.data?.data || []);
        setNotifications(notifRes.data?.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isAuthenticated, user]);

  // Cover Letters Functions
  const loadCoverLetters = async () => {
    try {
      const res = await getCoverLetters();
      const letters = res.data?.data || res.data || [];
      setCoverLetters(letters);
    } catch (err) {
      toast.error("Failed to load cover letters");
    }
  };

  useEffect(() => {
    if (activeTab === "cover-letters") {
      loadCoverLetters();
    }
  }, [activeTab]);

  const openCoverModal = (cover = null) => {
    setEditingCover(cover);
    setCoverForm({
      name: cover ? cover.name : "",
      content: cover ? cover.content : "",
    });
    setCoverModalOpen(true);
  };

  const closeCoverModal = () => {
    setCoverModalOpen(false);
    setEditingCover(null);
    setCoverForm({ name: "", content: "" });
  };

  const handleCoverSave = async () => {
    if (!coverForm.name.trim() || !coverForm.content.trim()) {
      toast.error("Name and content are required");
      return;
    }
    try {
      if (editingCover) {
        await updateCoverLetter(editingCover.id, coverForm);
        toast.success("Cover letter updated");
      } else {
        await createCoverLetter(coverForm);
        toast.success("Cover letter created");
      }
      loadCoverLetters();
      closeCoverModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save cover letter");
    }
  };

  const handleCoverDelete = async (id) => {
    try {
      await deleteCoverLetter(id);
      toast.success("Cover letter deleted");
      loadCoverLetters();
      setCoverDeleteConfirm(null);
    } catch (err) {
      toast.error("Failed to delete cover letter");
    }
  };

  const handleSetDefaultCover = async (id) => {
    try {
      await setDefaultCoverLetter(id);
      toast.success("Default cover letter updated");
      loadCoverLetters();
    } catch (err) {
      toast.error("Failed to set default cover letter");
    }
  };

  // Utility Functions
  // Format salary range for display
  const formatSalary = (min, max) => {
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;
    if (!hasMin && !hasMax) return "Negotiable";
    if (hasMin && !hasMax) return `$${Number(min).toLocaleString()}`;
    if (!hasMin && hasMax) return `$${Number(max).toLocaleString()}`;
    return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  };

  // Handle resume upload success by updating the resume URL in state
  const stats = {
    profileStrength: calculateProfileStrength(),
    applied: applications.length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
  };

  // Handle withdrawing an application with confirmation and state updates
  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?"))
      return;
    setWithdrawing(applicationId);
    try {
      await applicationAPI.withdrawApplication(applicationId);
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      toast.success("Application withdrawn");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw");
    } finally {
      setWithdrawing(null);
    }
  };

  const handleRemoveSaved = async (jobId) => {
    setRemovingSaved(jobId);
    try {
      await savedJobsAPI.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast.success("Job removed from saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove saved job");
    } finally {
      setRemovingSaved(null);
    }
  };

  // Handle profile update with validation for password change and API call to update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (
      profile.newPassword &&
      profile.newPassword !== profile.confirmPassword
    ) {
      toast.error("New passwords do not match");
      return;
    }
    setUpdatingProfile(true);
    try {
      const updateData = {
        name: profile.name,
        email: profile.email,
        ...(profile.currentPassword
          ? { current_password: profile.currentPassword }
          : {}),
        ...(profile.newPassword ? { new_password: profile.newPassword } : {}),
      };
      await userAPI.updateProfile(updateData);
      toast.success("Profile updated successfully");
      setProfile((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Load saved searches for the user with error handling and loading state management
  const loadSavedSearches = async () => {
    try {
      setSearchLoading(true);
      const res = await savedSearchAPI.getSavedSearches();
      setSavedSearches(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load saved searches");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchFormChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.name.trim()) return toast.error("Search name is required");
    try {
      if (editingSearch) {
        await savedSearchAPI.updateSavedSearch(editingSearch.id, searchForm);
        toast.success("Saved search updated");
      } else {
        await savedSearchAPI.createSavedSearch(searchForm);
        toast.success("Saved search created");
      }
      setShowSearchForm(false);
      setEditingSearch(null);
      setSearchForm({
        name: "",
        keyword: "",
        location: "",
        job_type: "full-time",
        salary_min: "",
        salary_max: "",
        alert_frequency: "instant",
      });
      loadSavedSearches();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving search");
    }
  };

  const handleEditSearch = (search) => {
    setEditingSearch(search);
    setSearchForm({
      name: search.name,
      keyword: search.keyword || "",
      location: search.location || "",
      job_type: search.job_type || "full-time",
      salary_min: search.salary_min || "",
      salary_max: search.salary_max || "",
      alert_frequency: search.alert_frequency || "instant",
    });
    setShowSearchForm(true);
  };

  const handleDeleteSearch = async (id) => {
    if (!window.confirm("Delete this saved search?")) return;
    try {
      await savedSearchAPI.deleteSavedSearch(id);
      toast.success("Search deleted");
      loadSavedSearches();
    } catch (err) {
      toast.error("Failed to delete search");
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  // Render the cover letters management section with list of cover letters and modals for creating/editing and deleting cover letters
  const renderCoverLetters = () => (
    <div className="cover-letters-section">
      <div className="section-header">
        <h3>Cover Letters</h3>
        <button className="btn-primary" onClick={() => openCoverModal()}>
          <span className="material-symbols-outlined">add</span> New Cover
          Letter
        </button>
      </div>

      {coverLetters.length === 0 ? (
        <p className="empty-message">
          No cover letters yet. Create one to get started.
        </p>
      ) : (
        <div className="cover-letters-list">
          {coverLetters.map((cl) => (
            <div key={cl.id} className="cover-letter-card">
              <div className="card-header">
                <span className="name">{cl.name}</span>
                {cl.is_default && <span className="default-star">⭐</span>}
              </div>
              <div className="card-body">
                <div
                  className="preview"
                  dangerouslySetInnerHTML={{
                    __html: cl.content.substring(0, 150) + "...",
                  }}
                />
              </div>
              <div className="card-actions">
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => openCoverModal(cl)}
                >
                  Edit
                </button>
                <button
                  className="btn-sm btn-outline"
                  onClick={() => handleSetDefaultCover(cl.id)}
                >
                  {cl.is_default ? "Default" : "Set as Default"}
                </button>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => setCoverDeleteConfirm(cl.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for New/Edit */}
      {coverModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCover ? "Edit Cover Letter" : "New Cover Letter"}</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={coverForm.name}
                onChange={(e) =>
                  setCoverForm({ ...coverForm, name: e.target.value })
                }
                placeholder="e.g. Software Engineer Template"
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <ReactQuill
                value={coverForm.content}
                onChange={(content) => setCoverForm({ ...coverForm, content })}
                theme="snow"
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "clean"],
                  ],
                }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleCoverSave}>
                Save
              </button>
              <button className="btn-secondary" onClick={closeCoverModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {coverDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Cover Letter</h3>
            <p>
              Are you sure you want to delete this cover letter? This action
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => handleCoverDelete(coverDeleteConfirm)}
              >
                Delete
              </button>
              <button
                className="btn-secondary"
                onClick={() => setCoverDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If the user is not authenticated or still loading auth state, show loading message
  return (
    <div className="seeker-dashboard">
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || "U"}</div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Overview
            </button>

            <button
              className={activeTab === "applied" ? "active" : ""}
              onClick={() => setActiveTab("applied")}
            >
              <span className="material-symbols-outlined">assignment</span>
              Applied Jobs
            </button>

            <button
              className={activeTab === "saved" ? "active" : ""}
              onClick={() => setActiveTab("saved")}
            >
              <span className="material-symbols-outlined">bookmarks</span>
              Saved Jobs
            </button>

            <button
              className={activeTab === "saved-searches" ? "active" : ""}
              onClick={() => {
                setActiveTab("saved-searches");
                setShowSearchForm(false);
                setEditingSearch(null);
              }}
            >
              <span className="material-symbols-outlined">search</span>
              Saved Searches
            </button>

            <button
              className={activeTab === "cover-letters" ? "active" : ""}
              onClick={() => setActiveTab("cover-letters")}
            >
              <span className="material-symbols-outlined">description</span>
              Cover Letters
            </button>

            <button
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <span className="material-symbols-outlined">person</span>
              Profile
            </button>
          </nav>

          <div className="sidebar-footer">
            <button
              className="help-btn"
              onClick={() => toast.info("Help & Support coming soon")}
            >
              <span className="material-symbols-outlined">help</span>
              Help
            </button>
            <button className="logout-btn" onClick={logout}>
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          {activeTab === "overview" && (
            <div className="overview-tab">
              {/* Overview content */}
              <div className="welcome-header">
                <h1>Welcome back, {user?.name?.split(" ")[0]}!</h1>
                <p>
                  Track your applications, saved jobs, and the latest updates in
                  one place.
                </p>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.profileStrength}%</span>
                  <span className="stat-label">Profile Strength</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.applied}</span>
                  <span className="stat-label">Applied</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.shortlisted}</span>
                  <span className="stat-label">Shortlisted</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.hired}</span>
                  <span className="stat-label">Hired</span>
                </div>
              </div>
              <div className="recommended-section">
                <div className="section-header">
                  <h2>Recommended for You</h2>
                  <span className="ai-badge">AI-MATCHED</span>
                  <button
                    className="view-all"
                    onClick={() => navigate("/jobs")}
                  >
                    View all roles
                  </button>
                </div>
                {recommendedJobs.length === 0 ? (
                  <p className="empty-message">
                    No recommendations yet. Browse jobs to discover roles.
                  </p>
                ) : (
                  <div className="recommended-jobs">
                    {recommendedJobs.map((job) => (
                      <div key={job.id} className="job-card">
                        <h4>{job.title}</h4>
                        <p>
                          {job.company_name} · {job.location || "Remote"}
                        </p>
                        <p>{formatSalary(job.salary_min, job.salary_max)}</p>
                        <button onClick={() => navigate(`/jobs/${job.id}`)}>
                          View Job
                        </button>
                        <span className="match-score">AI Match</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="activity-section">
                <h2>Recent Activity</h2>
                {notifications.length === 0 ? (
                  <p className="empty-message">
                    No recent activity. Apply to jobs to see updates here.
                  </p>
                ) : (
                  <div className="activity-list">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="activity-item">
                        <span className="material-symbols-outlined">
                          {notif.type === "application"
                            ? "assignment_turned_in"
                            : notif.type === "profile"
                              ? "visibility"
                              : "notifications"}
                        </span>
                        <div>
                          <strong>{notif.title}</strong>
                          <p>{notif.message}</p>
                          <span className="time">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "applied" && (
            <div className="applied-tab">
              <h2>Applied Jobs</h2>
              {applications.length === 0 ? (
                <p>You haven't applied to any jobs yet.</p>
              ) : (
                <div className="applications-list">
                  {applications.map((app) => (
                    <div key={app.id} className="application-card">
                      <div className="app-info">
                        <h3>{app.job_title}</h3>
                        <p>{app.company_name}</p>
                        <span className={`status-badge status-${app.status}`}>
                          {app.status}
                        </span>
                        <p>
                          Applied:{" "}
                          {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      {["pending", "reviewed"].includes(app.status) && (
                        <button
                          className="withdraw-btn"
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawing === app.id}
                        >
                          {withdrawing === app.id
                            ? "Withdrawing..."
                            : "Withdraw"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="saved-tab">
              <h2>Saved Jobs</h2>
              {savedJobs.length === 0 ? (
                <p>
                  No saved jobs. Browse jobs and click the heart icon to save
                  them.
                </p>
              ) : (
                <div className="saved-jobs-grid">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="saved-job-card">
                      <h3>{job.title}</h3>
                      <p>{job.company_name || "Company"}</p>
                      <p>{job.location || "Remote"}</p>
                      <div className="job-actions">
                        <button
                          className="apply-btn"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Job
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveSaved(job.id)}
                          disabled={removingSaved === job.id}
                        >
                          {removingSaved === job.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "saved-searches" && (
            <div className="saved-searches-container">
              <div className="section-header">
                <h3>Your Saved Searches</h3>
                {!showSearchForm && (
                  <button
                    className="new-search-btn"
                    onClick={() => setShowSearchForm(true)}
                  >
                    <span className="material-symbols-outlined">add</span> New
                    Search
                  </button>
                )}
              </div>

              {showSearchForm && (
                <form
                  onSubmit={handleCreateOrUpdateSearch}
                  className="search-form-card"
                >
                  <h4>
                    {editingSearch
                      ? "Edit Saved Search"
                      : "Create Saved Search"}
                  </h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Search Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={searchForm.name}
                        onChange={handleSearchFormChange}
                        required
                        placeholder="e.g. Remote React Jobs"
                      />
                    </div>
                    <div className="form-group">
                      <label>Keyword</label>
                      <input
                        type="text"
                        name="keyword"
                        value={searchForm.keyword}
                        onChange={handleSearchFormChange}
                        placeholder="e.g. React, Node"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={searchForm.location}
                        onChange={handleSearchFormChange}
                        placeholder="e.g. Remote, New York"
                      />
                    </div>
                    <div className="form-group">
                      <label>Job Type</label>
                      <select
                        name="job_type"
                        value={searchForm.job_type}
                        onChange={handleSearchFormChange}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="remote">Remote</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Min Salary</label>
                      <input
                        type="number"
                        name="salary_min"
                        value={searchForm.salary_min}
                        onChange={handleSearchFormChange}
                        placeholder="80000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Salary</label>
                      <input
                        type="number"
                        name="salary_max"
                        value={searchForm.salary_max}
                        onChange={handleSearchFormChange}
                        placeholder="150000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Alert Frequency</label>
                      <select
                        name="alert_frequency"
                        value={searchForm.alert_frequency}
                        onChange={handleSearchFormChange}
                      >
                        <option value="instant">Instant</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit">
                      {editingSearch ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearchForm(false);
                        setEditingSearch(null);
                        setSearchForm({
                          name: "",
                          keyword: "",
                          location: "",
                          job_type: "full-time",
                          salary_min: "",
                          salary_max: "",
                          alert_frequency: "instant",
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {!showSearchForm &&
                (searchLoading ? (
                  <p>Loading...</p>
                ) : savedSearches.length === 0 ? (
                  <p className="empty-message">
                    No saved searches yet. Create one to get notified about
                    matching jobs!
                  </p>
                ) : (
                  <div className="search-list">
                    {savedSearches.map((search) => (
                      <div key={search.id} className="search-card">
                        <div className="search-info">
                          <h3>{search.name}</h3>
                          <div className="search-meta">
                            {search.keyword && (
                              <span className="tag">{search.keyword}</span>
                            )}
                            {search.location && <span>{search.location}</span>}
                            <span>{search.job_type}</span>
                            {search.salary_min && (
                              <span>
                                ${search.salary_min}
                                {search.salary_max
                                  ? ` - $${search.salary_max}`
                                  : "+"}
                              </span>
                            )}
                            <span className="alert-badge">
                              {search.alert_frequency} alerts
                            </span>
                            <span
                              className={`status-badge ${search.is_active ? "active" : "inactive"}`}
                            >
                              {search.is_active ? "Active" : "Paused"}
                            </span>
                          </div>
                        </div>
                        <div className="search-actions">
                          <button onClick={() => handleEditSearch(search)}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteSearch(search.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}

          {/* Cover Letters Tab */}
          {activeTab === "cover-letters" && renderCoverLetters()}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="profile-tab">
              <h2>Edit Profile</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Current Password (required to change password)</label>
                  <input
                    type="password"
                    value={profile.currentPassword}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={profile.newPassword}
                    onChange={(e) =>
                      setProfile({ ...profile, newPassword: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={profile.confirmPassword}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <ResumeUpload
                  currentResumeUrl={resumeUrl}
                  onUploadSuccess={(newUrl) => setResumeUrl(newUrl)}
                  onDeleteSuccess={() => setResumeUrl(null)}
                />
                <button type="submit" disabled={updatingProfile}>
                  {updatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
