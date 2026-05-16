import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        toast.error(
          t("auto.could_not_load_dashboard_data", {
            defaultValue: "Could not load dashboard data",
          }),
        );
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
      toast.error(
        t("auto.could_not_load_saved_searches", {
          defaultValue: "Could not load saved searches",
        }),
      );
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
      toast.error(
        t("auto.failed_to_update_search", {
          defaultValue: "Failed to update search",
        }),
      );
    }
  };

  const handleDeleteSearch = async () => {
    if (!deletingSearchId) return;
    try {
      await savedSearchAPI.deleteSavedSearch(deletingSearchId);
      setSavedSearches((prev) => prev.filter((s) => s.id !== deletingSearchId));
      toast.success(
        t("auto.search_deleted_successfully", {
          defaultValue: "Search deleted successfully",
        }),
      );
    } catch (err) {
      toast.error(
        t("auto.failed_to_delete_search", {
          defaultValue: "Failed to delete search",
        }),
      );
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
      toast.success(
        t("auto.search_updated_successfully", {
          defaultValue: "Search updated successfully",
        }),
      );
      setIsEditModalOpen(false);
      setEditingSearch(null);
    } catch (err) {
      toast.error(
        t("auto.failed_to_update_search", {
          defaultValue: "Failed to update search",
        }),
      );
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
    toast.success(
      t("auto.logged_out_successfully", {
        defaultValue: "Logged out successfully",
      }),
    );
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
                <span
                  className="material-symbols-outlined search-icon"
                  aria-hidden="true"
                >
                  search
                </span>
                <>
                  <label htmlFor="dashboard-keyword-search" className="sr-only">
                    {t("auto.search_jobs_by_keyword", {
                      defaultValue: "Search jobs by keyword",
                    })}
                  </label>

                  <input
                    id="dashboard-keyword-search"
                    type="text"
                    placeholder={t(
                      "auto.search_jobs_by_title_skill_or_company",
                      {
                        defaultValue: "Search jobs by title, skill or company",
                      },
                    )}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </>
              </div>
              <div className="search-divider" aria-hidden="true">
                |
              </div>
              <div className="search-input-wrapper location-input">
                <span className="material-symbols-outlined">location_on</span>
                <>
                  <label
                    htmlFor="dashboard-location-search"
                    className="sr-only"
                  >
                    {t("auto.search_jobs_by_location", {
                      defaultValue: "Search jobs by location",
                    })}
                  </label>

                  <input
                    id="dashboard-location-search"
                    type="text"
                    placeholder={t("auto.kathmandu_nepal", {
                      defaultValue: "Kathmandu, Nepal",
                    })}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </>
              </div>
            </div>
            <button
              type="submit"
              className="search-btn-black"
              aria-label={t("auto.search_jobs", {
                defaultValue: "Search jobs",
              })}
            >
              {t("auto.search", { defaultValue: "Search" })}
            </button>
          </form>

          {/* Quick Action Cards */}
          <div className="quick-actions-grid">
            <button
              type="button"
              className={`quick-action-card ${expandedCard === "applications" ? "active" : ""}`}
              aria-label={t("auto.view_applications_summary", {
                defaultValue: "View applications summary",
              })}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "applications" ? null : "applications",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined" aria-hidden="true">
                  description
                </span>
              </div>
              <div className="action-label">
                {t("auto.my_applications", { defaultValue: "My Applications" })}
              </div>
              <div className="action-count">{stats.applications}</div>
            </button>
            <button
              type="button"
              className={`quick-action-card ${expandedCard === "interviews" ? "active" : ""}`}
              aria-label={t("auto.view_interviews_summary", {
                defaultValue: "View interviews summary",
              })}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "savedJobs" ? null : "savedJobs",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined" aria-hidden="true">
                  favorite
                </span>
              </div>
              <div className="action-label">
                {t("auto.saved_jobs", { defaultValue: "Saved Jobs" })}
              </div>
              <div className="action-count">{stats.savedJobs}</div>
            </button>
            <div
              className={`quick-action-card ${expandedCard === "interviews" ? "active" : ""}`}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "interviews" ? null : "interviews",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined" aria-hidden="true">
                  question_answer
                </span>
              </div>
              <div className="action-label">
                {t("auto.interview", { defaultValue: "Interview" })}
              </div>
              <div className="action-count">{stats.interviews}</div>
            </div>
            <button
              type="button"
              className={`quick-action-card ${expandedCard === "connections" ? "active" : ""}`}
              aria-label={t("auto.view_connections_summary", {
                defaultValue: "View connections summary",
              })}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "connections" ? null : "connections",
                )
              }
            >
              <div className="icon-circle">
                <span className="material-symbols-outlined" aria-hidden="true">
                  group
                </span>
              </div>
              <div className="action-label">
                {t("auto.my_connections", { defaultValue: "My Connections" })}
              </div>
              <div className="action-count">{stats.connections}</div>
            </button>
          </div>

          {/* Expanded Card Details */}
          {expandedCard && (
            <div className="expanded-card-details">
              {expandedCard === "applications" && (
                <div className="detail-content">
                  <h3>
                    {t("auto.your_applications", {
                      defaultValue: "Your Applications",
                    })}
                  </h3>
                  <p>
                    {t("auto.you_have_applied_to", {
                      defaultValue: "You have applied to",
                    })}
                    <strong>{stats.applications}</strong> jobs.
                  </p>
                  {stats.applications > 0 ? (
                    <p>
                      {t(
                        "auto.scroll_down_to_see_your_applications_listed_below",
                        {
                          defaultValue:
                            "Scroll down to see your applications listed below.",
                        },
                      )}
                    </p>
                  ) : (
                    <p>
                      {t("auto.start_applying_to_jobs_to_see_them_here", {
                        defaultValue:
                          "Start applying to jobs to see them here!",
                      })}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate("/jobs")}
                  >
                    {t("auto.browse_jobs", { defaultValue: "Browse Jobs" })}
                  </button>
                </div>
              )}
              {expandedCard === "savedJobs" && (
                <div className="detail-content">
                  <h3>
                    {t("auto.your_saved_jobs", {
                      defaultValue: "Your Saved Jobs",
                    })}
                  </h3>
                  <p>
                    {t("auto.you_have_saved", {
                      defaultValue: "You have saved",
                    })}
                    <strong>{stats.savedJobs}</strong>
                    {t("auto.jobs_643303", { defaultValue: "jobs." })}
                  </p>
                  {stats.savedJobs > 0 ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate("/dashboard/saved-jobs")}
                    >
                      {t("auto.view_saved_jobs", {
                        defaultValue: "View Saved Jobs",
                      })}
                    </button>
                  ) : (
                    <p>
                      {t("auto.browse_jobs_and_save_your_favorites", {
                        defaultValue: "Browse jobs and save your favorites!",
                      })}
                    </p>
                  )}
                </div>
              )}
              {expandedCard === "interviews" && (
                <div className="detail-content">
                  <h3>
                    {t("auto.your_interviews", {
                      defaultValue: "Your Interviews",
                    })}
                  </h3>
                  <p>
                    {t("auto.you_have", { defaultValue: "You have" })}
                    <strong>{stats.interviews}</strong>
                    {t("auto.upcoming_interviews", {
                      defaultValue: "upcoming interviews.",
                    })}
                  </p>
                  <p>
                    {t("auto.check_your_interview_schedule_for_details", {
                      defaultValue:
                        "Check your interview schedule for details.",
                    })}
                  </p>
                </div>
              )}
              {expandedCard === "connections" && (
                <div className="detail-content">
                  <h3>
                    {t("auto.your_connections", {
                      defaultValue: "Your Connections",
                    })}
                  </h3>
                  <p>
                    {t("auto.you_have", { defaultValue: "You have" })}
                    <strong>{stats.connections}</strong>
                    {t("auto.connections", { defaultValue: "connections." })}
                  </p>
                  <p>
                    {t(
                      "auto.build_your_professional_network_to_grow_your_career",
                      {
                        defaultValue:
                          "Build your professional network to grow your career.",
                      },
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Saved Searches Section */}
          <div className="saved-searches-section">
            <div className="section-header">
              <h2 className="section-title">
                {t("auto.saved_searches", { defaultValue: "Saved Searches" })}
              </h2>
              <span className="badge-count">{savedSearches.length}</span>
            </div>
            <p className="subtitle">
              {t("auto.manage_your_saved_job_searches_and_email_alerts", {
                defaultValue: "Manage your saved job searches and email alerts",
              })}
            </p>

            {loadingSearches ? (
              <div className="loading-grid" role="status" aria-live="polite">
                {t("auto.loading_saved_searches", {
                  defaultValue: "Loading saved searches...",
                })}
              </div>
            ) : savedSearches.length > 0 ? (
              <div className="saved-searches-grid">
                {savedSearches.map((search) => (
                  <div key={search.id} className="saved-search-card">
                    <div className="saved-search-header">
                      <h3 className="search-name">{search.name}</h3>
                      <div className="search-actions">
                        {/* Active toggle */}
                        <label className="toggle-switch">
                          <input
                            aria-label={`Toggle alerts for ${search.name}`}
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
                          <span
                            className="toggle-slider"
                            aria-hidden="true"
                          ></span>
                        </label>
                        {/* Edit button */}
                        <button
                          type="button"
                          className="icon-btn edit-btn"
                          onClick={() => handleEditSearch(search)}
                          aria-label={`Edit saved search ${search.name}`}
                        >
                          <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                          >
                            edit
                          </span>
                        </button>
                        {/* Delete button */}
                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          aria-label={`Delete saved search ${search.name}`}
                          onClick={() => {
                            setDeletingSearchId(search.id);
                            setIsDeleteModalOpen(true);
                          }}
                          aria-label={t("auto.delete_search", {
                            defaultValue: "Delete search",
                          })}
                        >
                          <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                          >
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
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    search
                  </span>
                </div>
                <h3>
                  {t("auto.no_saved_searches", {
                    defaultValue: "No Saved Searches",
                  })}
                </h3>
                <p>
                  {t(
                    "auto.save_a_search_from_the_jobs_page_to_get_alerts_when_new",
                    {
                      defaultValue:
                        "Save a search from the jobs page to get alerts when new jobs match your criteria.",
                    },
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Trending Jobs */}
          <div className="jobs-section">
            <div className="section-header">
              <span className="fire-icon" aria-hidden="true">
                🔥
              </span>
              <h2 className="section-title">
                {t("auto.trending_jobs", { defaultValue: "Trending Jobs" })}
              </h2>
            </div>
            {loadingDashboard ? (
              <div className="loading-grid" role="status" aria-live="polite">
                {t("auto.loading_jobs", { defaultValue: "Loading jobs..." })}
              </div>
            ) : trendingJobs.length > 0 ? (
              <div className="jobs-grid">
                {trendingJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="empty-message">
                {t("auto.no_jobs_found", { defaultValue: "No jobs found." })}
              </p>
            )}
            <div className="load-more-container">
              <button
                type="button"
                className="load-more-btn"
                onClick={() => navigate("/jobs")}
              >
                {t("auto.view_all_jobs", { defaultValue: "View All Jobs" })}
              </button>
            </div>
          </div>

          {/* Premium Jobs */}
          <div className="jobs-section">
            <div className="section-header">
              <span className="star-icon" aria-hidden="true">
                ⭐
              </span>
              <h2 className="section-title">
                {t("auto.premium_jobs", { defaultValue: "Premium Jobs" })}
              </h2>
            </div>
            {loadingDashboard ? (
              <div className="loading-grid" role="status" aria-live="polite">
                {t("auto.loading_jobs", { defaultValue: "Loading jobs..." })}
              </div>
            ) : premiumJobs.length > 0 ? (
              <div className="jobs-grid">
                {premiumJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="empty-message">
                {t("auto.no_jobs_found", { defaultValue: "No jobs found." })}
              </p>
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-search-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-search-title">
              {t("auto.delete_saved_search", {
                defaultValue: "Delete Saved Search",
              })}
            </h3>
            <p>
              {t(
                "auto.are_you_sure_you_want_to_delete_this_saved_search_this",
                {
                  defaultValue:
                    "Are you sure you want to delete this saved search? This action cannot be undone.",
                },
              )}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                {t("auto.cancel", { defaultValue: "Cancel" })}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteSearch}
              >
                {t("auto.delete", { defaultValue: "Delete" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerDashboard;
