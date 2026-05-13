import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyCard from "../../components/companies/CompanyCard/CompanyCard";
import companiesData from "../../data/companies.json";
import jobsData from "../../data/jobs.json";
import "./CompaniesPage.css";

const CompaniesPage = () => {
  // State variables
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // Load companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API delay (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Get job counts for each company
        const companiesWithJobCounts = companiesData.companies.map(
          (company) => {
            const jobCount = jobsData.jobs.filter(
              (job) => job.company === company.name,
            ).length;
            return { ...company, jobs_count: jobCount };
          },
        );

        setCompanies(companiesWithJobCounts);
        setFilteredCompanies(companiesWithJobCounts);
      } catch (err) {
        setError("Failed to load companies");
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter companies based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCompanies(filtered);
    }
  }, [searchTerm, companies]);

  // Clear search input
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="companies-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Discover Top Employers</h1>
            <p className="page-subtitle">
              Connect with companies that share your values. Browse through our
              curated list of industry leaders and innovators.
            </p>
          </div>
          <div className="search-section">
            <div className="search-bar">
              <span className="material-symbols-outlined search-icon" aria-hidden="true">
                search
              </span>
              <>
                <label htmlFor="company-search-loading" className="sr-only">
                  Search companies by name
                </label>

                <input
                  id="company-search-loading"
                  type="text"
                  placeholder="Search companies by name..."
                  className="search-input"
                  disabled
                />
              </>
            </div>
          </div>
          <div className="companies-grid loading-skeleton">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-logo"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="companies-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">🏢</div>
            <h2>Unable to Load Companies</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
              type="button"
              aria-label="Reload companies page"
            >
              <span className="material-symbols-outlined">refresh</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="companies-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Discover Top Employers</h1>
          <p className="page-subtitle">
            Connect with companies that share your values. Browse through our
            curated list of industry leaders and innovators.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="search-section">
          <div className="search-bar">
            <span className="material-symbols-outlined search-icon" aria-hidden="true">
              search
            </span>
            <>
              <label htmlFor="company-search" className="sr-only">
                Search companies by name
              </label>

              <input
                id="company-search"
                type="text"
                placeholder="Search companies by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </>
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={clearSearch}
                type="button"
                aria-label="Clear company search"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="search-results-info">
              <p>
                Found {filteredCompanies.length} company
                {filteredCompanies.length !== 1 ? "ies" : ""} matching "
                {searchTerm}"
              </p>
            </div>
          )}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="companies-grid">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          // Empty state - no companies found
          <div className="empty-state">
            <div className="empty-icon">
              <span className="material-symbols-outlined">business_center</span>
            </div>
            <h3>No companies found</h3>
            <p>We couldn't find any companies matching "{searchTerm}"</p>
            <button onClick={clearSearch} className="empty-clear-btn">
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
