import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { jobAPI } from "../../services/api";
import JobCard from "../../components/jobs/JobCard/JobCard";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import toast from "react-hot-toast";
import SaveSearchModal from "../../components/SaveSearchModal/SaveSearchModal";
import { useSavedSearch } from "../../contexts/SavedSearchContext";
import "./JobsPage.css";

const JobsPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for search fields
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const [selectedJobTypes, setSelectedJobTypes] = useState(() => {
    const types = searchParams.get("jobTypes");
    return types ? types.split(",") : [];
  });

  const [salaryRange, setSalaryRange] = useState({
    min: parseInt(searchParams.get("minSalary"), 10) || 0,
    max: parseInt(searchParams.get("maxSalary"), 10) || 200000,
  });

  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent");

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page"), 10) || 1,
  );

  const [jobs, setJobs] = useState([]);
  const limit = 6;

  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [debouncedLocation, setDebouncedLocation] = useState(location);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const filterDrawerRef = useFocusTrap(isFilterOpen, () =>
    setIsFilterOpen(false),
  );

  const { refreshSavedSearches } = useSavedSearch();

  // Debounces keyword search to reduce unnecessary API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Debounces location search to reduce unnecessary API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocation(location), 300);
    return () => clearTimeout(timer);
  }, [location]);

  // Keeps URL query parameters synced with active filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedKeyword) params.set("keyword", debouncedKeyword);
    if (debouncedLocation) params.set("location", debouncedLocation);

    if (selectedJobTypes.length > 0) {
      params.set("jobTypes", selectedJobTypes.join(","));
    }

    if (salaryRange.min > 0) {
      params.set("minSalary", String(salaryRange.min));
    }

    if (salaryRange.max < 200000) {
      params.set("maxSalary", String(salaryRange.max));
    }

    if (sortBy !== "recent") {
      params.set("sort", sortBy);
    }

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }

    setSearchParams(params, { replace: true });
  }, [
    debouncedKeyword,
    debouncedLocation,
    selectedJobTypes,
    salaryRange,
    sortBy,
    currentPage,
    setSearchParams,
  ]);

  // Fetches jobs from backend whenever filters or pagination changes
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      try {
        const params = {
          keyword: debouncedKeyword || undefined,
          location: debouncedLocation || undefined,
          job_type:
            selectedJobTypes.length > 0
              ? selectedJobTypes.join(",")
              : undefined,
          min_salary: salaryRange.min > 0 ? salaryRange.min : undefined,
          max_salary: salaryRange.max < 200000 ? salaryRange.max : undefined,
          sort: sortBy,
          page: currentPage,
          limit,
        };

        Object.keys(params).forEach((key) => {
          if (params[key] === undefined) delete params[key];
        });

        const response = await jobAPI.getJobs(params);

        setJobs(response.data?.data || []);
        setTotal(response.data?.total || 0);
      } catch (error) {
        console.error("Jobs fetch error:", error);
        toast.error(error.response?.data?.message || "Failed to load jobs");
        setJobs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
    debouncedKeyword,
    debouncedLocation,
    selectedJobTypes,
    salaryRange,
    sortBy,
    currentPage,
  ]);

  // Clears every active search and filter option
  const clearAllFilters = () => {
    setKeyword("");
    setLocation("");
    setSelectedJobTypes([]);
    setSalaryRange({ min: 0, max: 200000 });
    setSortBy("recent");
    setCurrentPage(1);
  };

  // Adds or removes a selected job type filter
  const toggleJobType = (type) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setCurrentPage(1);
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const startIndex = (currentPage - 1) * limit;
  const showingStart = total > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(startIndex + limit, total);

  // Changes page and scrolls back to top of page
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jobTypeOptions = [
    {
      value: "full-time",
      label: "Full Time",
      colorClass: "job-type-full-time",
    },
    {
      value: "part-time",
      label: "Part Time",
      colorClass: "job-type-part-time",
    },
    {
      value: "remote",
      label: "Remote",
      colorClass: "job-type-remote",
    },
    {
      value: "contract",
      label: "Contract",
      colorClass: "job-type-contract",
    },
    {
      value: "internship",
      label: "Internship",
      colorClass: "job-type-internship",
    },
  ];

  const activeFilterCount =
    selectedJobTypes.length + (keyword ? 1 : 0) + (location ? 1 : 0);

  const currentQueryParams = {
    keyword: debouncedKeyword,
    location: debouncedLocation,
    job_type: selectedJobTypes.join(",") || "",
    salary_min: salaryRange.min,
    salary_max: salaryRange.max,
  };

  // Opens save search modal only for logged-in job seekers
  const handleSaveSearchClick = () => {
    if (!isAuthenticated) {
      toast.error(
        t("auto.please_login_to_save_searches", {
          defaultValue: "Please login to save searches",
        }),
      );
      return;
    }

    if (user?.role !== "job_seeker") {
      toast.error(
        t("auto.only_job_seekers_can_save_searches", {
          defaultValue: "Only job seekers can save searches",
        }),
      );
      return;
    }

    setIsSaveModalOpen(true);
  };

  const showSaveSearch = user?.role === "job_seeker";

  return (
    <div className="jobs-page">
      <div className="container">
        <h1 className="sr-only">
          {t("auto.find_jobs", { defaultValue: "Find Jobs" })}
        </h1>

        <section
          className="search-section"
          aria-labelledby="job-search-heading"
        >
          <h2 id="job-search-heading" className="sr-only">
            {t("auto.search_and_filter_jobs", {
              defaultValue: "Search and filter jobs",
            })}
          </h2>

          <div
            className="search-bar"
            role="search"
            aria-label={t("auto.job_search", { defaultValue: "Job search" })}
          >
            <div className="search-input-group">
              <span
                className="material-symbols-outlined search-icon"
                aria-hidden="true"
              >
                search
              </span>

              <label htmlFor="job-search-input" className="sr-only">
                {t("auto.search_jobs_by_title_keyword_or_company", {
                  defaultValue: "Search jobs by title, keyword, or company",
                })}
              </label>

              <input
                id="job-search-input"
                data-hotkey="job-search"
                type="search"
                placeholder={t("auto.job_title_keyword_or_company", {
                  defaultValue: "Job title, keyword, or company",
                })}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
                aria-label={t("auto.search_jobs_by_title_keyword_or_company", {
                  defaultValue: "Search jobs by title, keyword, or company",
                })}
              />
            </div>

            <div className="search-input-group">
              <span
                className="material-symbols-outlined search-icon"
                aria-hidden="true"
              >
                location_on
              </span>

              <label htmlFor="jobs-location-search" className="sr-only">
                {t("auto.search_jobs_by_location", {
                  defaultValue: "Search jobs by location",
                })}
              </label>

              <input
                id="jobs-location-search"
                type="text"
                placeholder={t("auto.city_state_or_remote", {
                  defaultValue: "City, state, or remote",
                })}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
                aria-label={t("auto.search_jobs_by_location", {
                  defaultValue: "Search jobs by location",
                })}
              />
            </div>

            <button
              className="search-btn"
              onClick={() => setCurrentPage(1)}
              type="button"
              aria-label={t("auto.search_jobs", {
                defaultValue: "Search jobs",
              })}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                search
              </span>
              {t("auto.search", { defaultValue: "Search" })}
            </button>
          </div>

          {showSaveSearch && (
            <button
              className="save-search-btn"
              type="button"
              onClick={handleSaveSearchClick}
              title={t("auto.save_this_search", {
                defaultValue: "Save this search",
              })}
              aria-label={t("auto.save_current_job_search", {
                defaultValue: "Save current job search",
              })}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                bookmark
              </span>
              {t("auto.save_this_search", { defaultValue: "Save this search" })}
            </button>
          )}

          {(activeFilterCount > 0 || selectedJobTypes.length > 0) && (
            <div
              className="active-filters"
              aria-label={t("auto.active_job_filters", {
                defaultValue: "Active job filters",
              })}
            >
              <span className="filter-count" role="status" aria-live="polite">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                active
              </span>

              {selectedJobTypes.map((type) => {
                const opt = jobTypeOptions.find((o) => o.value === type);

                return (
                  <span
                    key={type}
                    className={`active-filter-tag ${opt?.colorClass || ""}`}
                  >
                    {opt?.label || type}
                    <button
                      type="button"
                      onClick={() => toggleJobType(type)}
                      aria-label={`Remove ${opt?.label || type} filter`}
                    >
                      <span aria-hidden="true">x</span>
                    </button>
                  </span>
                );
              })}

              <button
                onClick={clearAllFilters}
                className="clear-all-link"
                type="button"
                aria-label={t("auto.clear_all_active_filters", {
                  defaultValue: "Clear all active filters",
                })}
              >
                {t("auto.clear_all", { defaultValue: "Clear all" })}
              </button>
            </div>
          )}
        </section>

        <div className="jobs-layout">
          <aside
            className="filters-sidebar desktop-sidebar"
            aria-labelledby="desktop-filters-heading"
          >
            <div className="filters-header">
              <h2 id="desktop-filters-heading">
                {t("auto.filters", { defaultValue: "Filters" })}
              </h2>

              <button
                onClick={clearAllFilters}
                className="clear-filters-link"
                type="button"
                aria-label={t("auto.clear_all_filters", {
                  defaultValue: "Clear all filters",
                })}
              >
                {t("auto.clear_all", { defaultValue: "Clear all" })}
              </button>
            </div>

            <div className="filter-group">
              <h3>{t("auto.job_type", { defaultValue: "Job Type" })}</h3>

              <div
                className="job-type-buttons"
                role="group"
                aria-label={t("auto.job_type_filters", {
                  defaultValue: "Job type filters",
                })}
              >
                {jobTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleJobType(opt.value)}
                    type="button"
                    className={`job-type-filter-btn ${opt.colorClass} ${
                      selectedJobTypes.includes(opt.value) ? "selected" : ""
                    }`}
                    aria-pressed={selectedJobTypes.includes(opt.value)}
                    aria-label={`${
                      selectedJobTypes.includes(opt.value) ? "Remove" : "Apply"
                    } ${opt.label} job type filter`}
                  >
                    {opt.label}
                    {selectedJobTypes.includes(opt.value) && (
                      <span className="check-mark" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>{t("auto.location", { defaultValue: "Location" })}</h3>

              <label htmlFor="desktop-location-filter" className="sr-only">
                {t("auto.filter_jobs_by_location", {
                  defaultValue: "Filter jobs by location",
                })}
              </label>

              <input
                id="desktop-location-filter"
                type="text"
                placeholder={t("auto.city_or_remote", {
                  defaultValue: "City or remote",
                })}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-input"
                aria-label={t("auto.filter_jobs_by_location", {
                  defaultValue: "Filter jobs by location",
                })}
              />
            </div>

            <div className="filter-group">
              <h3>
                {t("auto.salary_range", { defaultValue: "Salary Range" })}
              </h3>

              <div className="salary-inputs">
                <div className="salary-input">
                  <label htmlFor="salary-min-desktop">
                    {t("auto.min_887c84", { defaultValue: "Min ($)" })}
                  </label>

                  <input
                    type="number"
                    id="salary-min-desktop"
                    placeholder="0"
                    value={salaryRange.min}
                    onChange={(e) => {
                      setSalaryRange({
                        ...salaryRange,
                        min: parseInt(e.target.value, 10) || 0,
                      });
                      setCurrentPage(1);
                    }}
                    aria-label={t("auto.minimum_salary_filter", {
                      defaultValue: "Minimum salary filter",
                    })}
                  />
                </div>

                <div className="salary-input">
                  <label htmlFor="salary-max-desktop">
                    {t("auto.max_9c35f8", { defaultValue: "Max ($)" })}
                  </label>

                  <input
                    type="number"
                    id="salary-max-desktop"
                    placeholder="200000"
                    value={salaryRange.max}
                    onChange={(e) => {
                      setSalaryRange({
                        ...salaryRange,
                        max: parseInt(e.target.value, 10) || 200000,
                      });
                      setCurrentPage(1);
                    }}
                    aria-label={t("auto.maximum_salary_filter", {
                      defaultValue: "Maximum salary filter",
                    })}
                  />
                </div>
              </div>

              <div className="salary-range-bar" aria-hidden="true">
                <div
                  className="salary-range-fill"
                  style={{ width: `${(salaryRange.max / 200000) * 100}%` }}
                />
              </div>

              <div
                className="salary-values"
                aria-label={t("auto.selected_salary_range", {
                  defaultValue: "Selected salary range",
                })}
              >
                <span>${salaryRange.min.toLocaleString()}</span>
                <span aria-hidden="true">—</span>
                <span>${salaryRange.max.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={clearAllFilters}
              className="clear-filters-btn"
              type="button"
              aria-label={t("auto.clear_all_filters", {
                defaultValue: "Clear all filters",
              })}
            >
              {t("auto.clear_filters", { defaultValue: "Clear Filters" })}
            </button>
          </aside>

          <button
            className="mobile-filter-btn"
            onClick={() => setIsFilterOpen(true)}
            type="button"
            aria-label={`Open filters${
              activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""
            }`}
            aria-haspopup="dialog"
            aria-expanded={isFilterOpen}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              filter_list
            </span>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {isFilterOpen && (
            <div
              className="filter-drawer"
              role="presentation"
              onClick={() => setIsFilterOpen(false)}
            >
              <div
                className="filter-drawer-content"
                ref={filterDrawerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-filters-heading"
                tabIndex="-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="drawer-header">
                  <h2 id="mobile-filters-heading">
                    {t("auto.filters", { defaultValue: "Filters" })}
                  </h2>

                  <button
                    onClick={() => setIsFilterOpen(false)}
                    type="button"
                    aria-label={t("auto.close_filters", {
                      defaultValue: "Close filters",
                    })}
                    data-autofocus
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      close
                    </span>
                  </button>
                </div>

                <div className="drawer-body">
                  <div className="filter-group">
                    <h3>{t("auto.job_type", { defaultValue: "Job Type" })}</h3>

                    <div
                      className="job-type-buttons"
                      role="group"
                      aria-label={t("auto.mobile_job_type_filters", {
                        defaultValue: "Mobile job type filters",
                      })}
                    >
                      {jobTypeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleJobType(opt.value)}
                          className={`job-type-filter-btn ${opt.colorClass} ${
                            selectedJobTypes.includes(opt.value)
                              ? "selected"
                              : ""
                          }`}
                          aria-pressed={selectedJobTypes.includes(opt.value)}
                          aria-label={`${
                            selectedJobTypes.includes(opt.value)
                              ? "Remove"
                              : "Apply"
                          } ${opt.label} job type filter`}
                        >
                          {opt.label}
                          {selectedJobTypes.includes(opt.value) && (
                            <span className="check-mark" aria-hidden="true">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <h3>{t("auto.location", { defaultValue: "Location" })}</h3>

                    <label htmlFor="mobile-location-filter" className="sr-only">
                      {t("auto.filter_jobs_by_location", {
                        defaultValue: "Filter jobs by location",
                      })}
                    </label>

                    <input
                      id="mobile-location-filter"
                      type="text"
                      placeholder={t("auto.city_or_remote", {
                        defaultValue: "City or remote",
                      })}
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="filter-input"
                      aria-label={t("auto.filter_jobs_by_location", {
                        defaultValue: "Filter jobs by location",
                      })}
                    />
                  </div>

                  <div className="filter-group">
                    <h3>
                      {t("auto.salary_range", { defaultValue: "Salary Range" })}
                    </h3>

                    <div className="salary-inputs">
                      <label htmlFor="salary-min-mobile" className="sr-only">
                        {t("auto.minimum_salary", {
                          defaultValue: "Minimum salary",
                        })}
                      </label>

                      <input
                        id="salary-min-mobile"
                        type="number"
                        placeholder={t("auto.min", { defaultValue: "Min" })}
                        value={salaryRange.min}
                        onChange={(e) => {
                          setSalaryRange({
                            ...salaryRange,
                            min: parseInt(e.target.value, 10) || 0,
                          });
                          setCurrentPage(1);
                        }}
                        aria-label={t("auto.minimum_salary_filter", {
                          defaultValue: "Minimum salary filter",
                        })}
                      />

                      <label htmlFor="salary-max-mobile" className="sr-only">
                        {t("auto.maximum_salary", {
                          defaultValue: "Maximum salary",
                        })}
                      </label>

                      <input
                        id="salary-max-mobile"
                        type="number"
                        placeholder={t("auto.max", { defaultValue: "Max" })}
                        value={salaryRange.max}
                        onChange={(e) => {
                          setSalaryRange({
                            ...salaryRange,
                            max: parseInt(e.target.value, 10) || 200000,
                          });
                          setCurrentPage(1);
                        }}
                        aria-label={t("auto.maximum_salary_filter", {
                          defaultValue: "Maximum salary filter",
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="drawer-footer">
                  <button
                    onClick={clearAllFilters}
                    className="drawer-clear-btn"
                    type="button"
                    aria-label={t("auto.clear_all_filters", {
                      defaultValue: "Clear all filters",
                    })}
                  >
                    {t("auto.clear_all_e77fef", { defaultValue: "Clear All" })}
                  </button>

                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="drawer-apply-btn"
                    type="button"
                    aria-label={t(
                      "auto.apply_filters_and_close_filter_drawer",
                      { defaultValue: "Apply filters and close filter drawer" },
                    )}
                  >
                    {t("auto.apply_filters", { defaultValue: "Apply Filters" })}
                  </button>
                </div>
              </div>
            </div>
          )}

          <section
            className="jobs-content"
            aria-labelledby="jobs-results-heading"
          >
            <h2 id="jobs-results-heading" className="sr-only">
              {t("auto.job_search_results", {
                defaultValue: "Job search results",
              })}
            </h2>

            <div className="results-info">
              <p role="status" aria-live="polite">
                Showing {showingStart}-{showingEnd} of {total} jobs
              </p>

              <label htmlFor="jobs-sort" className="sr-only">
                {t("auto.sort_jobs", { defaultValue: "Sort jobs" })}
              </label>

              <select
                id="jobs-sort"
                className="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label={t("auto.sort_jobs", { defaultValue: "Sort jobs" })}
              >
                <option value="recent">
                  {t("auto.most_recent", { defaultValue: "Most recent" })}
                </option>
                <option value="salary_high">
                  {t("auto.salary_high_to_low", {
                    defaultValue: "Salary: High to Low",
                  })}
                </option>
                <option value="salary_low">
                  {t("auto.salary_low_to_high", {
                    defaultValue: "Salary: Low to High",
                  })}
                </option>
              </select>
            </div>

            {loading ? (
              <div
                className="jobs-grid loading-skeleton"
                role="status"
                aria-live="polite"
                aria-label={t("auto.loading_jobs_32d726", {
                  defaultValue: "Loading jobs",
                })}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton-card" aria-hidden="true">
                    <div className="skeleton-logo" />
                    <div className="skeleton-title" />
                    <div className="skeleton-text" />
                    <div className="skeleton-text" />
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div
                  className="jobs-grid"
                  aria-label={t("auto.job_search_results_list", {
                    defaultValue: "Job search results list",
                  })}
                >
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav
                    className="pagination"
                    aria-label={t("auto.job_results_pagination", {
                      defaultValue: "Job results pagination",
                    })}
                  >
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                      type="button"
                      aria-label={t("auto.go_to_previous_page", {
                        defaultValue: "Go to previous page",
                      })}
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        chevron_left
                      </span>
                      {t("auto.previous", { defaultValue: "Previous" })}
                    </button>

                    <div
                      className="pagination-pages"
                      role="group"
                      aria-label={t("auto.page_numbers", {
                        defaultValue: "Page numbers",
                      })}
                    >
                      {[...Array(totalPages).keys()].map((i) => {
                        const page = i + 1;

                        return (
                          <button
                            key={page}
                            className={`pagination-page ${
                              currentPage === page ? "active" : ""
                            }`}
                            onClick={() => goToPage(page)}
                            type="button"
                            aria-label={`Go to page ${page}`}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      type="button"
                      aria-label={t("auto.go_to_next_page", {
                        defaultValue: "Go to next page",
                      })}
                    >
                      {t("auto.next", { defaultValue: "Next" })}
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        chevron_right
                      </span>
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="empty-state" role="status" aria-live="polite">
                <div className="empty-icon" aria-hidden="true">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    search_off
                  </span>
                </div>

                <h2>
                  {t("auto.no_jobs_found_b6016a", {
                    defaultValue: "No jobs found",
                  })}
                </h2>
                <p>
                  {t("auto.try_adjusting_your_filters_or_search_term", {
                    defaultValue: "Try adjusting your filters or search term",
                  })}
                </p>

                <button
                  onClick={clearAllFilters}
                  className="empty-clear-btn"
                  type="button"
                  aria-label={t("auto.clear_all_filters_and_show_all_jobs", {
                    defaultValue: "Clear all filters and show all jobs",
                  })}
                >
                  {t("auto.clear_all_filters", {
                    defaultValue: "Clear all filters",
                  })}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {showSaveSearch && (
        <SaveSearchModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          queryParams={currentQueryParams}
          onSaveSuccess={refreshSavedSearches}
        />
      )}
    </div>
  );
};

export default JobsPage;
