import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import JobCard, {
  getJobTypeColor,
  getJobTypeLabel,
} from "../../components/jobs/JobCard/JobCard";
import jobsData from "../../data/jobs.json";
import "./JobsPage.css";

const JobsPage = () => {
  // URL query parameters
  const [searchParams, setSearchParams] = useSearchParams();

  // State for jobs data
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent");

  // Filter states - initialized from URL params
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [selectedJobTypes, setSelectedJobTypes] = useState(() => {
    const types = searchParams.get("jobTypes");
    return types ? types.split(",") : [];
  });
  const [salaryRange, setSalaryRange] = useState({
    min: parseInt(searchParams.get("minSalary")) || 0,
    max: parseInt(searchParams.get("maxSalary")) || 200000,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1,
  );
  const itemsPerPage = 6;

  // Debounced search timer
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Job type options with color classes matching JobCard
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
    { value: "remote", label: "Remote", colorClass: "job-type-remote" },
    { value: "contract", label: "Contract", colorClass: "job-type-contract" },
    {
      value: "internship",
      label: "Internship",
      colorClass: "job-type-internship",
    },
  ];

  // Load jobs from JSON file (will be replaced with API call later)
  useEffect(() => {
    setTimeout(() => {
      setAllJobs(jobsData.jobs);
      setLoading(false);
    }, 800);
  }, []);

  // Sort jobs based on selected sort option
  const sortJobs = useCallback((jobs, sortType) => {
    const sorted = [...jobs];
    switch (sortType) {
      case "salary_high":
        return sorted.sort((a, b) => b.salary_max - a.salary_max);
      case "salary_low":
        return sorted.sort((a, b) => a.salary_min - b.salary_min);
      case "recent":
      default:
        return sorted.sort(
          (a, b) => new Date(b.posted_date) - new Date(a.posted_date),
        );
    }
  }, []);

  // Apply all filters and sorting to jobs
  const applyFilters = useCallback(() => {
    let filtered = [...allJobs];

    // Filter by keyword (title or company)
    if (keyword) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword.toLowerCase()) ||
          job.company.toLowerCase().includes(keyword.toLowerCase()),
      );
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(location.toLowerCase()),
      );
    }

    // Filter by selected job types
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter((job) =>
        selectedJobTypes.includes(job.job_type),
      );
    }

    // Filter by salary range
    filtered = filtered.filter(
      (job) =>
        job.salary_min >= salaryRange.min && job.salary_max <= salaryRange.max,
    );

    // Apply sorting
    filtered = sortJobs(filtered, sortBy);

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [
    allJobs,
    keyword,
    location,
    selectedJobTypes,
    salaryRange,
    sortJobs,
    sortBy,
  ]);

  // Update URL query parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    if (selectedJobTypes.length > 0)
      params.set("jobTypes", selectedJobTypes.join(","));
    if (salaryRange.min > 0) params.set("minSalary", salaryRange.min);
    if (salaryRange.max < 200000) params.set("maxSalary", salaryRange.max);
    if (currentPage > 1) params.set("page", currentPage);
    if (sortBy !== "recent") params.set("sort", sortBy);
    setSearchParams(params);
  }, [
    keyword,
    location,
    selectedJobTypes,
    salaryRange,
    currentPage,
    sortBy,
    setSearchParams,
  ]);

  // Apply filters when data or filters change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [applyFilters, loading]);

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Debounced search for keyword (300ms delay)
  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {}, 300);
    setDebounceTimer(timer);
  };

  // Handle location input change
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  // Toggle job type selection
  const toggleJobType = (type) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  // Handle salary range change
  const handleSalaryChange = (type, value) => {
    setSalaryRange((prev) => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  // Clear all filters and reset to default
  const clearAllFilters = () => {
    setKeyword("");
    setLocation("");
    setSelectedJobTypes([]);
    setSalaryRange({ min: 0, max: 200000 });
    setSortBy("recent");
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const showingStart = startIndex + 1;
  const showingEnd = Math.min(startIndex + itemsPerPage, filteredJobs.length);

  // Navigate to specific page
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Count active filters for display
  const activeFilterCount =
    selectedJobTypes.length + (keyword ? 1 : 0) + (location ? 1 : 0);

  return (
    <div className="jobs-page">
      <div className="container">
        {/* Search Bar Section */}
        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-group">
              <span className="material-symbols-outlined search-icon">
                search
              </span>
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={keyword}
                onChange={handleKeywordChange}
                className="search-input"
              />
            </div>
            <div className="search-input-group">
              <span className="material-symbols-outlined search-icon">
                location_on
              </span>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={handleLocationChange}
                className="search-input"
              />
            </div>
            <button className="search-btn">
              <span className="material-symbols-outlined">search</span>
              Search
            </button>
          </div>

          {/* Active Filters Display */}
          {(activeFilterCount > 0 || selectedJobTypes.length > 0) && (
            <div className="active-filters">
              <span className="filter-count">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                active
              </span>
              {selectedJobTypes.map((type) => {
                const option = jobTypeOptions.find((opt) => opt.value === type);
                return (
                  <span
                    key={type}
                    className={`active-filter-tag ${option?.colorClass}`}
                  >
                    {option?.label}
                    <button onClick={() => toggleJobType(type)}>×</button>
                  </span>
                );
              })}
              <button onClick={clearAllFilters} className="clear-all-link">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="jobs-layout">
          {/* Desktop Filter Sidebar */}
          <aside className="filters-sidebar desktop-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearAllFilters} className="clear-filters-link">
                Clear all
              </button>
            </div>

            {/* Job Type Filter - Using same tag styles as JobCard */}
            <div className="filter-group">
              <h4>Job Type</h4>
              <div className="job-type-buttons">
                {jobTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleJobType(option.value)}
                    className={`job-type-filter-btn ${option.colorClass} ${selectedJobTypes.includes(option.value) ? "selected" : ""}`}
                  >
                    {option.label}
                    {selectedJobTypes.includes(option.value) && (
                      <span className="check-mark">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <h4>Location</h4>
              <input
                type="text"
                placeholder="City or remote"
                value={location}
                onChange={handleLocationChange}
                className="filter-input"
              />
            </div>

            {/* Salary Range Filter */}
            <div className="filter-group">
              <h4>Salary Range</h4>
              <div className="salary-inputs">
                <div className="salary-input">
                  <label>Min ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={salaryRange.min}
                    onChange={(e) => handleSalaryChange("min", e.target.value)}
                  />
                </div>
                <div className="salary-input">
                  <label>Max ($)</label>
                  <input
                    type="number"
                    placeholder="200000"
                    value={salaryRange.max}
                    onChange={(e) => handleSalaryChange("max", e.target.value)}
                  />
                </div>
              </div>
              <div className="salary-range-bar">
                <div
                  className="salary-range-fill"
                  style={{ width: `${(salaryRange.max / 200000) * 100}%` }}
                ></div>
              </div>
              <div className="salary-values">
                <span>${salaryRange.min.toLocaleString()}</span>
                <span>—</span>
                <span>${salaryRange.max.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={clearAllFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </aside>

          {/* Mobile Filter Button - Opens drawer on click */}
          <button
            className="mobile-filter-btn"
            onClick={() => setIsFilterOpen(true)}
          >
            <span className="material-symbols-outlined">filter_list</span>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Mobile Filter Drawer - Slide in panel */}
          {isFilterOpen && (
            <div
              className="filter-drawer"
              onClick={() => setIsFilterOpen(false)}
            >
              <div
                className="filter-drawer-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="drawer-header">
                  <h3>Filters</h3>
                  <button onClick={() => setIsFilterOpen(false)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="drawer-body">
                  <div className="filter-group">
                    <h4>Job Type</h4>
                    <div className="job-type-buttons">
                      {jobTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleJobType(option.value)}
                          className={`job-type-filter-btn ${option.colorClass} ${selectedJobTypes.includes(option.value) ? "selected" : ""}`}
                        >
                          {option.label}
                          {selectedJobTypes.includes(option.value) && (
                            <span className="check-mark">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <h4>Location</h4>
                    <input
                      type="text"
                      placeholder="City or remote"
                      value={location}
                      onChange={handleLocationChange}
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <h4>Salary Range</h4>
                    <div className="salary-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={salaryRange.min}
                        onChange={(e) =>
                          handleSalaryChange("min", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={salaryRange.max}
                        onChange={(e) =>
                          handleSalaryChange("max", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="drawer-footer">
                  <button
                    onClick={clearAllFilters}
                    className="drawer-clear-btn"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="drawer-apply-btn"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Job Cards */}
          <main className="jobs-content">
            {/* Results Info and Sort Dropdown */}
            <div className="results-info">
              <p>
                Showing{" "}
                {filteredJobs.length > 0
                  ? `${showingStart}-${showingEnd}`
                  : "0"}{" "}
                of {filteredJobs.length} jobs
              </p>
              <select
                className="sort-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="recent">Most recent</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>

            {/* Loading Skeleton - Shows 6 placeholder cards */}
            {loading ? (
              <div className="jobs-grid loading-skeleton">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-logo"></div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                ))}
              </div>
            ) : paginatedJobs.length > 0 ? (
              <>
                {/* Job Cards Grid */}
                <div className="jobs-grid">
                  {paginatedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                      Previous
                    </button>

                    <div className="pagination-pages">
                      {[...Array(totalPages).keys()]
                        .map((i) => i + 1)
                        .map((page) => (
                          <button
                            key={page}
                            className={`pagination-page ${currentPage === page ? "active" : ""}`}
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                    </div>

                    <button
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      Next
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State - No jobs found */
              <div className="empty-state">
                <div className="empty-icon">
                  <span className="material-symbols-outlined">search_off</span>
                </div>
                <h3>No jobs found</h3>
                <p>Try adjusting your filters or search term</p>
                <button onClick={clearAllFilters} className="empty-clear-btn">
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
