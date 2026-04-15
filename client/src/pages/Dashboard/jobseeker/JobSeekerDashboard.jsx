import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  applicationAPI,
  savedJobsAPI,
  userAPI,
  jobAPI,
  notificationAPI,
} from "../../../services/api";
import toast from "react-hot-toast";
import "./JobSeekerDashboard.css";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

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

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "job_seeker") return;

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const [appsRes, savedRes, notifRes] = await Promise.all([
          applicationAPI.getMyApplications(),
          savedJobsAPI.getSavedJobs(),
          notificationAPI.getNotifications(),
        ]);

        let recommendedRes = { data: { data: [] } };

        try {
          recommendedRes = await jobAPI.getRecommendedJobs();
        } catch {
          // fallback → latest jobs
          try {
            recommendedRes = await jobAPI.getJobs({ limit: 6 });
          } catch {
            recommendedRes = { data: { data: [] } };
          }
        }

        setApplications(appsRes.data?.data || []);
        setSavedJobs(savedRes.data?.data || []);
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
    if (
      !window.confirm("Are you sure you want to withdraw this application?")
    ) {
      return;
    }

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
                      setProfile({
                        ...profile,
                        newPassword: e.target.value,
                      })
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
