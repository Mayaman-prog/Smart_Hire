// React hooks for state management and lifecycle
import React, { useState, useEffect } from "react";

// Custom context hook for authentication state and user data
import { useAuth } from "../../../contexts/AuthContext";

// Router hook for navigation between pages
import { useNavigate } from "react-router-dom";

// API service functions for different features
import {
  applicationAPI,      // Handle job application operations
  savedJobsAPI,        // Manage saved job bookmarks
  userAPI,             // User profile and authentication operations
  jobAPI,              // Fetch job listings and recommendations
  notificationAPI,     // Retrieve user notifications
  savedSearchAPI,      // Manage saved job searches
} from "../../../services/api";

// Toast notification library for user feedback
import toast from "react-hot-toast";

// Component-specific styles
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
  // Router and Auth Hooks
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();

  // UI State
  // Track which dashboard tab is currently active
  const [activeTab, setActiveTab] = useState("overview");
  // Overall loading state for initial data fetch
  const [loading, setLoading] = useState(true);

  // Dashboard Data State
  // Store user's job applications
  const [applications, setApplications] = useState([]);
  // Store user's bookmarked jobs
  const [savedJobs, setSavedJobs] = useState([]);
  // Store user's saved job searches
  const [savedSearches, setSavedSearches] = useState([]);
  // Recommended jobs based on user profile
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  // User notifications and activity updates
  const [notifications, setNotifications] = useState([]);

  // Saved Searches Form State
  // Toggle visibility of the saved search creation form
  const [showSearchForm, setShowSearchForm] = useState(false);
  // Store the currently edited search (null if creating new)
  const [editingSearch, setEditingSearch] = useState(null);
  // Form data for creating/updating saved searches
  const [searchForm, setSearchForm] = useState({
    name: "",
    keyword: "",
    location: "",
    job_type: "full-time",
    salary_min: "",
    salary_max: "",
    alert_frequency: "instant",
  });
  // Loading state for saved search operations
  const [searchLoading, setSearchLoading] = useState(false);

  // Action Loading States
  // Track which application is being withdrawn
  const [withdrawing, setWithdrawing] = useState(null);
  // Track which saved job is being removed
  const [removingSaved, setRemovingSaved] = useState(null);
  // Loading state for profile update
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Profile Form State
  // Store user profile information for editing
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Effects
  // Sync profile form with authenticated user data when it changes
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);

  // Fetch all dashboard data on component mount and user authentication
  useEffect(() => {
    // Skip if still loading auth or user is not authenticated or is not a job seeker
    if (authLoading || !isAuthenticated || user?.role !== "job_seeker") return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel for better performance
        const [appsRes, savedRes, notifRes, searchRes] = await Promise.all([
          applicationAPI.getMyApplications(),
          savedJobsAPI.getSavedJobs(),
          notificationAPI.getNotifications(),
          // Saved searches API might fail on first setup, provide fallback
          savedSearchAPI
            .getSavedSearches()
            .catch(() => ({ data: { data: [] } })),
        ]);

        // Try to fetch AI-recommended jobs, with fallbacks
        let recommendedRes = { data: { data: [] } };
        try {
          // First try dedicated recommendations endpoint
          recommendedRes = await jobAPI.getRecommendedJobs();
        } catch {
          try {
            // Fallback: fetch top jobs if recommendations unavailable
            recommendedRes = await jobAPI.getJobs({ limit: 6 });
          } catch {
            // If all fails, use empty array
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

  const stats = {
    profileStrength: 85,
    applied: applications.length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
  };

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

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      await userAPI.uploadResume(formData);
      toast.success("Resume uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  // Saved Searches Functions
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
              {/* ... unchanged overview content ... */}
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
                            {search.location && (
                              <span>{search.location}</span>
                            )}
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
                <div className="form-group">
                  <label>Resume (PDF, DOC, DOCX)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                  />
                </div>
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
