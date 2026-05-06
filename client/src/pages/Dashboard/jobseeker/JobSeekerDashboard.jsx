import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  applicationAPI,
  savedJobsAPI,
  jobAPI,
  savedSearchAPI,
} from "../../../services/api";
import JobCard from "../../../components/jobs/JobCard/JobCard";
import SaveSearchModal from "../../../components/SaveSearchModal/SaveSearchModal";
import Navbar from "../../../components/common/Navbar/Navbar";
import Footer from "../../../components/common/Footer/Footer";
import toast from "react-hot-toast";
import { useSavedSearch } from "../../../contexts/SavedSearchContext";
import "./JobSeekerDashboard.css";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeStatusTab, setActiveStatusTab] = useState("Active");

  // Data states
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [premiumJobs, setPremiumJobs] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);

  // Search form states
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("Kathmandu, Nepal");

  const [expandedCard, setExpandedCard] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    interviews: 0,
    connections: 0,
  });

  // Loading states (separate for each section)
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingSearches, setLoadingSearches] = useState(true);

  const { refreshTrigger } = useSavedSearch();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSearchId, setDeletingSearchId] = useState(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingDashboard(true);
      try {
        const [appsRes, savedRes, jobsRes] = await Promise.all([
          applicationAPI.getMyApplications(),
          savedJobsAPI.getSavedJobs(),
          jobAPI.getJobs({ limit: 6 }),
        ]);

        setApplications(appsRes.data?.data || []);
        setSavedJobs(savedRes.data?.data || []);

        const allJobs = jobsRes.data?.data || [];
        setTrendingJobs(allJobs.slice(0, 3));
        setPremiumJobs(allJobs.slice(3, 6));

        setStats({
          applications: appsRes.data?.data?.length || 0,
          savedJobs: savedRes.data?.data?.length || 0,
          interviews: 0,
          connections: 0,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error("Could not load dashboard data");
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Saved Searches
  const fetchSavedSearches = async () => {
    setLoadingSearches(true);
    try {
      const res = await savedSearchAPI.getSavedSearches();
      setSavedSearches(res.data?.data || []);
    } catch (err) {
      console.error("Saved searches error:", err);
      toast.error("Could not load saved searches");
    } finally {
      setLoadingSearches(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, [refreshTrigger]);

  // Status Filter
  const statusGroups = {
    Active: ["pending", "reviewed", "shortlisted"],
    Inactive: ["rejected"],
    Hired: ["hired"],
  };

  const filteredApplications = applications.filter((app) =>
    statusGroups[activeStatusTab]?.includes(app.status?.toLowerCase() || ""),
  );

  // API Actions
  const handleToggleActive = async (searchId, currentActive) => {
    try {
      await savedSearchAPI.updateSavedSearch(searchId, {
        is_active: !currentActive,
      });
      setSavedSearches((prev) =>
        prev.map((s) =>
          s.id === searchId ? { ...s, is_active: !currentActive } : s,
        ),
      );
      toast.success(
        `Search ${!currentActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err) {
      toast.error("Failed to update search");
    }
  };

  const handleDeleteSearch = async () => {
    if (!deletingSearchId) return;
    try {
      await savedSearchAPI.deleteSavedSearch(deletingSearchId);
      setSavedSearches((prev) => prev.filter((s) => s.id !== deletingSearchId));
      toast.success("Search deleted successfully");
    } catch (err) {
      toast.error("Failed to delete search");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingSearchId(null);
    }
  };

  const handleEditSearch = (search) => {
    setEditingSearch(search);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      const res = await savedSearchAPI.updateSavedSearch(
        editingSearch.id,
        updatedData,
      );
      setSavedSearches((prev) =>
        prev.map((s) =>
          s.id === editingSearch.id
            ? res.data?.data || { ...s, ...updatedData }
            : s,
        ),
      );
      toast.success("Search updated successfully");
      setIsEditModalOpen(false);
      setEditingSearch(null);
    } catch (err) {
      toast.error("Failed to update search");
    }
  };

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Render
  return (
    <div className="seeker-dashboard">
      <div className="dashboard-main">
        <div className="container">
          {/* Welcome */}
          <div className="welcome-section">
            <h1 className="welcome-heading">
              Welcome, {user?.name || "Job Seeker"}
            </h1>
          </div>

          {/* Search Bar */}
          <form className="dashboard-search-bar" onSubmit={handleSearch}>
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <span className="material-symbols-outlined search-icon">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search jobs by title, skill or company"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="search-divider">|</div>
              <div className="search-input-wrapper location-input">
                <span className="material-symbols-outlined">location_on</span>
                <input
                  type="text"
                  placeholder="Kathmandu, Nepal"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="search-btn-black">
              Search
            </button>
          </form>

          {/* Quick Action Cards */}
          <div className="quick-actions-grid">
            <div
              className={`quick-action-card ${expandedCard === "applications" ? "active" : ""}`}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "applications" ? null : "applications",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="action-label">My Applications</div>
              <div className="action-count">{stats.applications}</div>
            </div>
            <div
              className={`quick-action-card ${expandedCard === "savedJobs" ? "active" : ""}`}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "savedJobs" ? null : "savedJobs",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined">favorite</span>
              </div>
              <div className="action-label">Saved Jobs</div>
              <div className="action-count">{stats.savedJobs}</div>
            </div>
            <div
              className={`quick-action-card ${expandedCard === "interviews" ? "active" : ""}`}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "interviews" ? null : "interviews",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined">
                  question_answer
                </span>
              </div>
              <div className="action-label">Interview</div>
              <div className="action-count">{stats.interviews}</div>
            </div>
            <div
              className={`quick-action-card ${expandedCard === "connections" ? "active" : ""}`}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "connections" ? null : "connections",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div className="action-label">My Connections</div>
              <div className="action-count">{stats.connections}</div>
            </div>
          </div>

          {/* Expanded Card Details */}
          {expandedCard && (
            <div className="expanded-card-details">
              {expandedCard === "applications" && (
                <div className="detail-content">
                  <h4>Your Applications</h4>
                  <p>
                    You have applied to <strong>{stats.applications}</strong>{" "}
                    jobs.
                  </p>
                  {stats.applications > 0 ? (
                    <p>Scroll down to see your applications listed below.</p>
                  ) : (
                    <p>Start applying to jobs to see them here!</p>
                  )}
                  <button
                    className="btn-primary"
                    onClick={() => navigate("/jobs")}
                  >
                    Browse Jobs
                  </button>
                </div>
              )}
              {expandedCard === "savedJobs" && (
                <div className="detail-content">
                  <h4>Your Saved Jobs</h4>
                  <p>
                    You have saved <strong>{stats.savedJobs}</strong> jobs.
                  </p>
                  {stats.savedJobs > 0 ? (
                    <button
                      className="btn-primary"
                      onClick={() => navigate("/dashboard/saved-jobs")}
                    >
                      View Saved Jobs
                    </button>
                  ) : (
                    <p>Browse jobs and save your favorites!</p>
                  )}
                </div>
              )}
              {expandedCard === "interviews" && (
                <div className="detail-content">
                  <h4>Your Interviews</h4>
                  <p>
                    You have <strong>{stats.interviews}</strong> upcoming
                    interviews.
                  </p>
                  <p>Check your interview schedule for details.</p>
                </div>
              )}
              {expandedCard === "connections" && (
                <div className="detail-content">
                  <h4>Your Connections</h4>
                  <p>
                    You have <strong>{stats.connections}</strong> connections.
                  </p>
                  <p>Build your professional network to grow your career.</p>
                </div>
              )}
            </div>
          )}

          {/* Saved Searches Section */}
          <div className="saved-searches-section">
            <div className="section-header">
              <h2 className="section-title">Saved Searches</h2>
              <span className="badge-count">{savedSearches.length}</span>
            </div>
            <p className="subtitle">
              Manage your saved job searches and email alerts
            </p>

            {loadingSearches ? (
              <div className="loading-grid">Loading saved searches...</div>
            ) : savedSearches.length > 0 ? (
              <div className="saved-searches-grid">
                {savedSearches.map((search) => (
                  <div key={search.id} className="saved-search-card">
                    <div className="saved-search-header">
                      <h4 className="search-name">{search.name}</h4>
                      <div className="search-actions">
                        {/* Active toggle */}
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={
                              search.is_active === 1 ||
                              search.is_active === true
                            }
                            onChange={() =>
                              handleToggleActive(
                                search.id,
                                search.is_active === 1 ||
                                  search.is_active === true,
                              )
                            }
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        {/* Edit button */}
                        <button
                          className="icon-btn edit-btn"
                          onClick={() => handleEditSearch(search)}
                          aria-label="Edit search"
                        >
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                        </button>
                        {/* Delete button */}
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => {
                            setDeletingSearchId(search.id);
                            setIsDeleteModalOpen(true);
                          }}
                          aria-label="Delete search"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Criteria summary */}
                    <div className="search-criteria">
                      {search.keyword && (
                        <span className="criteria-tag">
                          Keyword: {search.keyword}
                        </span>
                      )}
                      {search.location && (
                        <span className="criteria-tag">
                          Location: {search.location}
                        </span>
                      )}
                      {search.job_type && (
                        <span className="criteria-tag">
                          Type: {search.job_type}
                        </span>
                      )}
                      {search.salary_min !== null &&
                      search.salary_max !== null ? (
                        <span className="criteria-tag">
                          Salary: ${search.salary_min} - ${search.salary_max}
                        </span>
                      ) : search.salary_min !== null ? (
                        <span className="criteria-tag">
                          Min: ${search.salary_min}
                        </span>
                      ) : search.salary_max !== null ? (
                        <span className="criteria-tag">
                          Max: ${search.salary_max}
                        </span>
                      ) : null}
                      <span className="criteria-tag frequency">
                        {search.alert_frequency || "Instant"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-container">
                <div className="empty-state-icon">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <h3>No Saved Searches</h3>
                <p>
                  Save a search from the jobs page to get alerts when new jobs
                  match your criteria.
                </p>
              </div>
            )}
          </div>

          {/* Trending Jobs */}
          <div className="jobs-section">
            <div className="section-header">
              <span className="fire-icon">🔥</span>
              <h2 className="section-title">Trending Jobs</h2>
            </div>
            {loadingDashboard ? (
              <div className="loading-grid">Loading jobs...</div>
            ) : trendingJobs.length > 0 ? (
              <div className="jobs-grid">
                {trendingJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="empty-message">No jobs found.</p>
            )}
            <div className="load-more-container">
              <button
                className="load-more-btn"
                onClick={() => navigate("/jobs")}
              >
                View All Jobs
              </button>
            </div>
          </div>

          {/* Premium Jobs */}
          <div className="jobs-section">
            <div className="section-header">
              <span className="star-icon">⭐</span>
              <h2 className="section-title">Premium Jobs</h2>
            </div>
            {loadingDashboard ? (
              <div className="loading-grid">Loading jobs...</div>
            ) : premiumJobs.length > 0 ? (
              <div className="jobs-grid">
                {premiumJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="empty-message">No jobs found.</p>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* Edit Saved Search Modal */}
      {isEditModalOpen && editingSearch && (
        <SaveSearchModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSearch(null);
          }}
          initialData={editingSearch}
          mode="edit"
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="modal-content delete-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Saved Search</h3>
            <p>
              Are you sure you want to delete this saved search? This action
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteSearch}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerDashboard;
