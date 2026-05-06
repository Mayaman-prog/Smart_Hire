import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import ConnectedAccounts from "./ConnectedAccounts";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();

  // Handle OAuth Redirect URL Parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkStatus = params.get('link');

    if (linkStatus === 'success') {
      toast.success('Account successfully linked!');
    } else if (linkStatus === 'error') {
      toast.error('Failed to link account. Try again.');
    } else if (linkStatus === 'duplicate_error') {
      toast.error('This social account is already linked to another user.');
    }

    // Clean up the URL so the toast doesn't persist on page refresh
    if (linkStatus) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleAdd = (section) => {
    toast.success(`Add ${section} feature coming soon!`);
  };

  // Helper data (Use actual data from backend when available)
  const userData = {
    fullName: user?.name || "Amit Ram",
    email: user?.email || "amitram@example.com",
    role: user?.role || "Job Seeker",
    location: "Not Available",
    phone: "9707921003",
    salaryExpectation: "Not Available",
    about: "Completing your profile is vital as it serves as your professional introduction. A well-crafted bio enhances your visibility, credibility, and networking opportunities.",
  };

  return (
    <div className="profile-page">
      <div className="profile-container container">
        {/* LEFT COLUMN */}
        <div className="profile-left">

          {/* Profile Header (Banner + Avatar) */}
          <div className="profile-card profile-header-card">
            <div className="profile-banner"></div>
            <div className="profile-info-wrapper">
              <div className="profile-avatar">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="profile-header-actions">
                <button className="btn-edit-profile">
                  <span className="material-symbols-outlined">edit</span>
                  Edit
                </button>
              </div>
              <div className="profile-name-section">
                <h1>{userData.fullName}</h1>
                <span className="role-badge">Public</span>
              </div>
              <div className="profile-stats">
                <span>0 Connections</span>
                <span className="stat-divider">•</span>
                <span>0 Followers</span>
              </div>
              <div className="profile-status-pill">
                <span className="status-dot"></span>
                Open to work
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              <button className="icon-btn" onClick={() => handleAdd("Personal Info")}>
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-icon"><span className="material-symbols-outlined">mail</span></span>
                <div>
                  <label>Email</label>
                  <p>{userData.email}</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon"><span className="material-symbols-outlined">call</span></span>
                <div>
                  <label>Phone Number</label>
                  <p>{userData.phone}</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon"><span className="material-symbols-outlined">location_on</span></span>
                <div>
                  <label>Location</label>
                  <p>{userData.location}</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon"><span className="material-symbols-outlined">attach_money</span></span>
                <div>
                  <label>Salary Expectation</label>
                  <p>{userData.salaryExpectation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="profile-card">
            <div className="card-header">
              <h2>About <span className="required-asterisk">*</span></h2>
              <button className="icon-btn" onClick={() => handleAdd("About")}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="card-content">{userData.about}</p>
          </div>

          {/* Resume */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Resume</h2>
              <button className="icon-btn" onClick={() => handleAdd("Resume")}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="card-placeholder">
              The resume stands as the most crucial document that recruiters prioritize, often disregarding profiles lacking this essential component.
            </p>
          </div>

          {/* Experience */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Experience <span className="required-asterisk">*</span></h2>
              <button className="icon-btn" onClick={() => handleAdd("Experience")}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="card-placeholder">
              Outline your employment particulars encompassing both your present role and past professional experiences.
            </p>
          </div>

          {/* Education */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Education <span className="required-asterisk">*</span></h2>
              <button className="icon-btn" onClick={() => handleAdd("Education")}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="card-placeholder">
              Kindly provide information about your educational background, including details about your schooling, college attendance, and degrees earned.
            </p>
          </div>

          {/* Skills */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Skills <span className="required-asterisk">*</span></h2>
              <button className="icon-btn" onClick={() => handleAdd("Skills")}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="card-placeholder">
              Share your expertise or notable skills with recruiters, such as Java, Python, Project Management, etc.
            </p>
          </div>
          {/* Render the connected accounts block here */}
          <ConnectedAccounts />
        </div>

        {/* RIGHT COLUMN (WIDGETS) */}
        <div className="profile-right">
          
          {/* AI Profile Completion Widget */}
          <div className="profile-card widget-card">
            <h2>Your AI Personal Recruiter</h2>
            <p className="widget-subtitle">
              Dear {userData.fullName.split(" ")[0]}, your profile is only <strong>8.33 %</strong> complete. Please fill in all required details.
            </p>
            <div className="progress-bar-container">
              <div className="progress-fill" style={{width: "8.33%"}}></div>
            </div>
            <div className="widget-list">
              <div className="widget-item"><span className="material-symbols-outlined">add_circle</span> Add Experience</div>
              <div className="widget-item"><span className="material-symbols-outlined">add_circle</span> Add Skills</div>
              <div className="widget-item"><span className="material-symbols-outlined">add_circle</span> Add Education</div>
              <div className="widget-item"><span className="material-symbols-outlined">add_circle</span> Add About you</div>
              <div className="widget-item"><span className="material-symbols-outlined">add_circle</span> Add information</div>
            </div>
            <button className="btn-primary-full" onClick={() => handleAdd("Resume")}>
              Generate Resume
            </button>
          </div>

          {/* Jobs For You Widget */}
          <div className="profile-card widget-card">
            <div className="card-header">
              <h2>Jobs For You</h2>
            </div>
            <p className="card-placeholder">Not available, add more skills.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;