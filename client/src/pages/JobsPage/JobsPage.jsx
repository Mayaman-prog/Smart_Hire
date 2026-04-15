import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { jobAPI } from "../../services/api";
import JobCard from "../../components/jobs/JobCard/JobCard";
import toast from "react-hot-toast";
import "./JobsPage.css";

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states from URL
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
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const limit = 6;

  // Debounced values (300ms)
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [debouncedLocation, setDebouncedLocation] = useState(location);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce timers
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocation(location), 300);
    return () => clearTimeout(timer);
  }, [location]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedKeyword) params.set("keyword", debouncedKeyword);
    if (debouncedLocation) params.set("location", debouncedLocation);
    if (selectedJobTypes.length > 0)
      params.set("jobTypes", selectedJobTypes.join(","));
    if (salaryRange.min > 0) params.set("minSalary", salaryRange.min);
    if (salaryRange.max < 200000) params.set("maxSalary", salaryRange.max);
    if (sortBy !== "recent") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage);
    setSearchParams(params, { replace: true });
  }, [debouncedKeyword, debouncedLocation, selectedJobTypes, salaryRange, sortBy, currentPage, setSearchParams]);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = {
          keyword: debouncedKeyword,
          location: debouncedLocation,
          job_type: selectedJobTypes.length ? selectedJobTypes.join(",") : undefined,
          min_salary: salaryRange.min > 0 ? salaryRange.min : undefined,
          max_salary: salaryRange.max < 200000 ? salaryRange.max : undefined,
          sort: sortBy,
          page: currentPage,
          limit,
        };
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        const response = await jobAPI.getJobs(params);
        setJobs(response.data.data);
        setTotal(response.data.total || 0);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [debouncedKeyword, debouncedLocation, selectedJobTypes, salaryRange, sortBy, currentPage, limit]);

  const clearAllFilters = () => {
    setKeyword("");
    setLocation("");
    setSelectedJobTypes([]);
    setSalaryRange({ min: 0, max: 200000 });
    setSortBy("recent");
    setCurrentPage(1);
  };

  const toggleJobType = (type) => {
    setSelectedJobTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / limit);
  const startIndex = (currentPage - 1) * limit;
  const showingStart = startIndex + 1;
  const showingEnd = Math.min(startIndex + limit, total);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jobTypeOptions = [
    { value: "full-time", label: "Full Time", colorClass: "job-type-full-time" },
    { value: "part-time", label: "Part Time", colorClass: "job-type-part-time" },
    { value: "remote", label: "Remote", colorClass: "job-type-remote" },
    { value: "contract", label: "Contract", colorClass: "job-type-contract" },
    { value: "internship", label: "Internship", colorClass: "job-type-internship" },
  ];

  const activeFilterCount = selectedJobTypes.length + (keyword ? 1 : 0) + (location ? 1 : 0);

  return (
    <div className="jobs-page">
      <div className="container">
        {/* Search Bar Section */}
        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-group">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-input-group">
              <span className="material-symbols-outlined search-icon">location_on</span>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="search-btn" onClick={() => {}}>
              <span className="material-symbols-outlined">search</span>
              Search
            </button>
          </div>

          {/* Active Filters Display */}
          {(activeFilterCount > 0 || selectedJobTypes.length > 0) && (
            <div className="active-filters">
              <span className="filter-count">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
              </span>
              {selectedJobTypes.map(type => {
                const opt = jobTypeOptions.find(o => o.value === type);
                return (
                  <span key={type} className={`active-filter-tag ${opt?.colorClass}`}>
                    {opt?.label}
                    <button onClick={() => toggleJobType(type)}>×</button>
                  </span>
                );
              })}
              <button onClick={clearAllFilters} className="clear-all-link">Clear all</button>
            </div>
          )}
        </div>

        <div className="jobs-layout">
          {/* Desktop Filter Sidebar */}
          <aside className="filters-sidebar desktop-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearAllFilters} className="clear-filters-link">Clear all</button>
            </div>

            <div className="filter-group">
              <h4>Job Type</h4>
              <div className="job-type-buttons">
                {jobTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleJobType(opt.value)}
                    className={`job-type-filter-btn ${opt.colorClass} ${selectedJobTypes.includes(opt.value) ? "selected" : ""}`}
                  >
                    {opt.label}
                    {selectedJobTypes.includes(opt.value) && <span className="check-mark">✓</span>}
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
                onChange={(e) => setLocation(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <h4>Salary Range</h4>
              <div className="salary-inputs">
                <div className="salary-input">
                  <label>Min ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={salaryRange.min}
                    onChange={(e) => setSalaryRange({ ...salaryRange, min: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="salary-input">
                  <label>Max ($)</label>
                  <input
                    type="number"
                    placeholder="200000"
                    value={salaryRange.max}
                    onChange={(e) => setSalaryRange({ ...salaryRange, max: parseInt(e.target.value) || 200000 })}
                  />
                </div>
              </div>
              <div className="salary-range-bar">
                <div className="salary-range-fill" style={{ width: `${(salaryRange.max / 200000) * 100}%` }}></div>
              </div>
              <div className="salary-values">
                <span>${salaryRange.min.toLocaleString()}</span>
                <span>—</span>
                <span>${salaryRange.max.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={clearAllFilters} className="clear-filters-btn">Clear Filters</button>
          </aside>

          {/* Mobile Filter Button */}
          <button className="mobile-filter-btn" onClick={() => setIsFilterOpen(true)}>
            <span className="material-symbols-outlined">filter_list</span>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Mobile Filter Drawer */}
          {isFilterOpen && (
            <div className="filter-drawer" onClick={() => setIsFilterOpen(false)}>
              <div className="filter-drawer-content" onClick={(e) => e.stopPropagation()}>
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
                      {jobTypeOptions.map(opt => (
                        <button key={opt.value} onClick={() => toggleJobType(opt.value)} className={`job-type-filter-btn ${opt.colorClass} ${selectedJobTypes.includes(opt.value) ? "selected" : ""}`}>
                          {opt.label}
                          {selectedJobTypes.includes(opt.value) && <span className="check-mark">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="filter-group">
                    <h4>Location</h4>
                    <input type="text" placeholder="City or remote" value={location} onChange={(e) => setLocation(e.target.value)} className="filter-input" />
                  </div>
                  <div className="filter-group">
                    <h4>Salary Range</h4>
                    <div className="salary-inputs">
                      <input type="number" placeholder="Min" value={salaryRange.min} onChange={(e) => setSalaryRange({ ...salaryRange, min: parseInt(e.target.value) || 0 })} />
                      <input type="number" placeholder="Max" value={salaryRange.max} onChange={(e) => setSalaryRange({ ...salaryRange, max: parseInt(e.target.value) || 200000 })} />
                    </div>
                  </div>
                </div>
                <div className="drawer-footer">
                  <button onClick={clearAllFilters} className="drawer-clear-btn">Clear All</button>
                  <button onClick={() => setIsFilterOpen(false)} className="drawer-apply-btn">Apply Filters</button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Job Cards */}
          <main className="jobs-content">
            <div className="results-info">
              <p>
                Showing {total > 0 ? `${showingStart}-${showingEnd}` : "0"} of {total} jobs
              </p>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Most recent</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>

            {loading ? (
              <div className="jobs-grid loading-skeleton">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-logo"></div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="jobs-grid">
                  {jobs.map(job => <JobCard key={job.id} job={job} />)}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                      <span className="material-symbols-outlined">chevron_left</span> Previous
                    </button>
                    <div className="pagination-pages">
                      {[...Array(totalPages).keys()].map(i => i+1).map(page => (
                        <button key={page} className={`pagination-page ${currentPage === page ? "active" : ""}`} onClick={() => goToPage(page)}>{page}</button>
                      ))}
                    </div>
                    <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                      Next <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <span className="material-symbols-outlined">search_off</span>
                </div>
                <h3>No jobs found</h3>
                <p>Try adjusting your filters or search term</p>
                <button onClick={clearAllFilters} className="empty-clear-btn">Clear all filters</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;