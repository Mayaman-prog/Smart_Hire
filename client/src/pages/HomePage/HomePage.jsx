import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { jobAPI, companyAPI } from "../../services/api";
import JobCard from "../../components/jobs/JobCard/JobCard";
import CompanyCard from "../../components/companies/CompanyCard/CompanyCard";
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
  const [companies, setCompanies] = useState([]);

  // Carousel refs and states
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const animationRef = useRef(null);
  const speed = 1; // Pixels per frame

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          jobAPI.getFeaturedJobs(),
          companyAPI.getCompanies(),
        ]);
        setFeaturedJobs(jobsRes.data.data || []);
        setCompanies(companiesRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Could not load homepage data");
      }
    };
    fetchData();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (isDragging) return; // Pause auto-scroll while dragging

    const animate = () => {
      if (!trackRef.current) return;

      const track = trackRef.current;
      const trackWidth = track.scrollWidth;
      const containerWidth = track.parentElement.clientWidth;

      setCurrentTranslate((prev) => {
        let newPos = prev - speed;

        // Reset smoothly when we've scrolled through half the content
        if (Math.abs(newPos) >= trackWidth / 2) {
          newPos = 0;
        }

        track.style.transform = `translateX(${newPos}px)`;
        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDragging, speed]);

  // Mouse Drag Handlers
  const handleDragStart = (e) => {
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    const newTranslate = currentTranslate + diff;
    setCurrentTranslate(newTranslate);
    trackRef.current.style.transform = `translateX(${newTranslate}px)`;
    setStartX(clientX); // Update start position for continuous drag
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handlers for mouse/touch
  const handleMouseDown = (e) => handleDragStart(e);
  const handleMouseMove = (e) => handleDragMove(e);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => handleDragEnd();

  const handleTouchStart = (e) => handleDragStart(e);
  const handleTouchMove = (e) => handleDragMove(e);
  const handleTouchEnd = () => handleDragEnd();

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
          <h1 className="hero-title">
            Find Your <span className="hero-highlight">Dream Job</span> With
            SmartHire
          </h1>
          <form className="hero-search-bar" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <span className="material-symbols-outlined search-icon">
                search
              </span>
              <label htmlFor="home-keyword-search" className="sr-only">
                Search jobs by title, skill or company
              </label>

              <input
                id="home-keyword-search"
                type="text"
                placeholder="Search jobs by title, skill or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <span className="search-divider">|</span>
            <div className="search-input-wrapper">
              <span className="material-symbols-outlined search-icon">
                location_on
              </span>
              <label htmlFor="home-location-search" className="sr-only">
                Search jobs by location
              </label>

              <input
                id="home-location-search"
                type="text"
                placeholder="Kathmandu, Nepal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="search-btn"
              aria-label="Search jobs"
            >
              <span className="material-symbols-outlined">search</span>
              Search
            </button>
          </form>

          <div className="popular-searches">
            <span>Discover: </span>
            {["Front Desk", "Freelance", "Pre-School", "Parking"].map(
              (term) => (
                <span key={term} className="popular-tag">
                  {term}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="companies-section">
        <div className="container">
          <h2 className="section-title">Companies Actively Hiring</h2>
          <div
            className="carousel-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className="carousel-track" ref={trackRef}>
              {Array(7)
                .fill(companies)
                .flat()
                .map((company, index) => (
                  <div key={`${company.id}-${index}`} className="carousel-item">
                    <CompanyCard company={company} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Jobs Section */}
      <section className="jobs-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trending Jobs</h2>
            <button
              onClick={() => navigate("/jobs")}
              className="view-all-link"
              aria-label="View all jobs"
            >
              View all
            </button>
          </div>
          <div className="jobs-grid">
            {featuredJobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Premium Jobs Section */}
      {featuredJobs.length > 3 && (
        <section className="jobs-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Premium Jobs</h2>
              <button
                onClick={() => navigate("/jobs")}
                className="view-all-link"
                aria-label="View all jobs"
              >
                View all
              </button>
            </div>
            <div className="jobs-grid">
              {featuredJobs.slice(3, 6).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="testimonials-title">
            Find out how SmartHire Jobseekers achieved career breakthroughs.
          </h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>“SmartHire played a pivotal role in securing a job for me.”</p>
              <strong>- Samikshya Basnet</strong>
            </div>
            <div className="testimonial-card">
              <p>“I got a job in Kathmandu through SmartHire.”</p>
              <strong>- Dipesh Manandhar</strong>
            </div>
            <div className="testimonial-card">
              <p>
                “Exceptional quality of service. Your only responsibility is to
                upload your resume.”
              </p>
              <strong>- Giriraj Rawal</strong>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="ai-features-section">
        <div className="container">
          <h2 className="ai-features-title">
            Never miss a Job opportunity – Thanks to SmartHire AI.
          </h2>
          <div className="ai-features-grid">
            <div className="ai-feature-card">
              <div className="icon-circle">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <h3>Discover Ideal Opportunities</h3>
              <p>We automatically show job postings that match your profile.</p>
            </div>
            <div className="ai-feature-card">
              <div className="icon-circle">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <h3>Get Invited to Apply</h3>
              <p>Showcase your profile to companies for roles you desire.</p>
            </div>
            <div className="ai-feature-card">
              <div className="icon-circle">
                <span className="material-symbols-outlined">thumb_up</span>
              </div>
              <h3>1-Click Apply</h3>
              <p>Apply to jobs quickly using your stored resume.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
