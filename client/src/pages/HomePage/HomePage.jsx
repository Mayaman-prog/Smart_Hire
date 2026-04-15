import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { jobAPI } from "../../services/api";
import JobCard from "../../components/jobs/JobCard/JobCard";
import JobSeekerDashboard from "../Dashboard/jobseeker/JobSeekerDashboard";
import toast from "react-hot-toast";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  // Fetch featured jobs on mount
  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getFeaturedJobs();
        setFeaturedJobs(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch featured jobs:", err);
        setError("Failed to load featured jobs. Please try again later.");
        toast.error("Could not load featured jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  // Conditional return – MUST be after all hooks
  if (isAuthenticated && user?.role === "job_seeker") {
    return <JobSeekerDashboard />;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (keyword || location) {
        sessionStorage.setItem("searchKeyword", keyword);
        sessionStorage.setItem("searchLocation", location);
      }
      navigate("/login");
      return;
    }
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleSearchJobs = () => {
    if (!isAuthenticated) navigate("/login");
    else navigate("/jobs");
  };

  const handlePostJob = () => {
    if (!isAuthenticated) navigate("/login");
    else navigate("/register");
  };

  const showPostJobButton = !isAuthenticated || user?.role === "employer";

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Your <span className="hero-highlight">Dream Job</span> Today
            </h1>
            <p className="hero-subtitle">
              Connect with top employers and find opportunities that match your
              skills
            </p>
            <div className="hero-buttons">
              <button
                onClick={handleSearchJobs}
                className="btn-primary btn-large"
              >
                <span className="material-symbols-outlined">search</span>
                Search Jobs
              </button>
              {showPostJobButton && (
                <button
                  onClick={handlePostJob}
                  className="btn-secondary btn-large"
                >
                  <span className="material-symbols-outlined">post_add</span>
                  Post a Job
                </button>
              )}
            </div>
          </div>
          <form onSubmit={handleSearch} className="search-bar">
            <div className="search-input-group">
              <span className="material-symbols-outlined search-icon">
                search
              </span>
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
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
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              <span className="material-symbols-outlined">search</span>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Jobs</h2>
            <button onClick={() => navigate("/jobs")} className="view-all-link">
              View All Jobs
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          {loading ? (
            <div className="jobs-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-logo"></div>
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="material-symbols-outlined">error</span>
              </div>
              <h3 className="empty-title">Something went wrong</h3>
              <p className="empty-text">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-btn"
              >
                <span className="material-symbols-outlined">refresh</span>
                Try Again
              </button>
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="jobs-grid">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="material-symbols-outlined">inbox</span>
              </div>
              <h3 className="empty-title">No featured jobs available</h3>
              <p className="empty-text">
                Check back later for new opportunities
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title centered">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <h3 className="step-title">Create Account</h3>
              <p className="step-description">
                Sign up as a job seeker or employer in just a few clicks
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <span className="material-symbols-outlined">search</span>
              </div>
              <h3 className="step-title">Search or Post</h3>
              <p className="step-description">
                Search for jobs or post openings and receive applications
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <span className="material-symbols-outlined">handshake</span>
              </div>
              <h3 className="step-title">Get Hired or Hire</h3>
              <p className="step-description">
                Get hired by top companies or find the perfect candidate for
                your role
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
