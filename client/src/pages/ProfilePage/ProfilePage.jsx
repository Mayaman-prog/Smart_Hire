import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import ConnectedAccounts from "./ConnectedAccounts";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Handle OAuth Redirect URL Parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkStatus = params.get("link");

    if (linkStatus === "success") {
      toast.success(
        t("auto.account_successfully_linked", {
          defaultValue: "Account successfully linked!",
        }),
      );
    } else if (linkStatus === "error") {
      toast.error(
        t("auto.failed_to_link_account_try_again", {
          defaultValue: "Failed to link account. Try again.",
        }),
      );
    } else if (linkStatus === "duplicate_error") {
      toast.error(
        t("auto.this_social_account_is_already_linked_to_another_user", {
          defaultValue:
            "This social account is already linked to another user.",
        }),
      );
    }

    // Clean up the URL so the toast doesn't persist on page refresh
    if (linkStatus) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleAdd = (section) => {
    toast.success(
      t("profile.featureComingSoon", {
        defaultValue: "Add {{section}} feature coming soon!",
        section,
      }),
    );
  };

  // Helper data (Use actual data from backend when available)
  const userData = {
    fullName: user?.name || "Amit Ram",
    email: user?.email || "amitram@example.com",
    role: user?.role || "Job Seeker",
    location: "Not Available",
    phone: "9707921003",
    salaryExpectation: "Not Available",
    about:
      "Completing your profile is vital as it serves as your professional introduction. A well-crafted bio enhances your visibility, credibility, and networking opportunities.",
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
                <button
                  className="btn-edit-profile"
                  type="button"
                  aria-label={t("auto.edit_profile", {
                    defaultValue: "Edit profile",
                  })}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    edit
                  </span>
                  {t("auto.edit", { defaultValue: "Edit" })}
                </button>
              </div>
              <div className="profile-name-section">
                <h1>{userData.fullName}</h1>
                <span className="role-badge">
                  {t("auto.public", { defaultValue: "Public" })}
                </span>
              </div>
              <div className="profile-stats">
                <span>
                  {t("auto.0_connections", { defaultValue: "0 Connections" })}
                </span>
                <span className="stat-divider">•</span>
                <span>
                  {t("auto.0_followers", { defaultValue: "0 Followers" })}
                </span>
              </div>
              <div className="profile-status-pill">
                <span className="status-dot"></span>
                {t("auto.open_to_work", { defaultValue: "Open to work" })}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="profile-card">
            <div className="card-header">
              <h2>
                {t("auto.personal_information", {
                  defaultValue: "Personal Information",
                })}
              </h2>
              <button
                className="icon-btn"
                type="button"
                onClick={() => handleAdd("Personal Info")}
                aria-label={t("auto.edit_personal_information", {
                  defaultValue: "Edit personal information",
                })}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  edit
                </span>
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-icon">
                  <span className="material-symbols-outlined">mail</span>
                </span>
                <div>
                  <label>{t("auto.email", { defaultValue: "Email" })}</label>
                  <p>{userData.email}</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">
                  <span className="material-symbols-outlined">call</span>
                </span>
                <div>
                  <label>
                    {t("auto.phone_number", { defaultValue: "Phone Number" })}
                  </label>
                  <p>{userData.phone}</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">
                  <span className="material-symbols-outlined">location_on</span>
                </span>
                <div>
                  <label>
                    {t("auto.location", { defaultValue: "Location" })}
                  </label>
                  <p>{userData.location}</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">
                  <span className="material-symbols-outlined">
                    attach_money
                  </span>
                </span>
                <div>
                  <label>
                    {t("auto.salary_expectation", {
                      defaultValue: "Salary Expectation",
                    })}
                  </label>
                  <p>{userData.salaryExpectation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="profile-card">
            <div className="card-header">
              <h2>
                {t("auto.about", { defaultValue: "About" })}
                <span className="required-asterisk">*</span>
              </h2>
              <button
                className="icon-btn"
                onClick={() => handleAdd("About")}
                type="button"
                aria-label={t("auto.add_about", { defaultValue: "Add about" })}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
              </button>
            </div>
            <p className="card-content">{userData.about}</p>
          </div>

          {/* Resume */}
          <div className="profile-card">
            <div className="card-header">
              <h2>{t("auto.resume", { defaultValue: "Resume" })}</h2>
              <button
                className="icon-btn"
                onClick={() => handleAdd("Resume")}
                type="button"
                aria-label={t("auto.add_resume", {
                  defaultValue: "Add resume",
                })}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
              </button>
            </div>
            <p className="card-placeholder">
              {t(
                "auto.the_resume_stands_as_the_most_crucial_document_that_rec",
                {
                  defaultValue:
                    "The resume stands as the most crucial document that recruiters prioritize, often disregarding profiles lacking this essential component.",
                },
              )}
            </p>
          </div>

          {/* Experience */}
          <div className="profile-card">
            <div className="card-header">
              <h2>
                {t("auto.experience_4038d5", { defaultValue: "Experience" })}
                <span className="required-asterisk">*</span>
              </h2>
              <button
                className="icon-btn"
                onClick={() => handleAdd("Experience")}
                type="button"
                aria-label={t("auto.add_experience", {
                  defaultValue: "Add experience",
                })}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
              </button>
            </div>
            <p className="card-placeholder">
              {t(
                "auto.outline_your_employment_particulars_encompassing_both_y",
                {
                  defaultValue:
                    "Outline your employment particulars encompassing both your present role and past professional experiences.",
                },
              )}
            </p>
          </div>

          {/* Education */}
          <div className="profile-card">
            <div className="card-header">
              <h2>
                {t("auto.education", { defaultValue: "Education" })}
                <span className="required-asterisk">*</span>
              </h2>
              <button
                className="icon-btn"
                onClick={() => handleAdd("Education")}
                type="button"
                aria-label={t("auto.add_education", {
                  defaultValue: "Add education",
                })}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
              </button>
            </div>
            <p className="card-placeholder">
              {t(
                "auto.kindly_provide_information_about_your_educational_backg",
                {
                  defaultValue:
                    "Kindly provide information about your educational background, including details about your schooling, college attendance, and degrees earned.",
                },
              )}
            </p>
          </div>

          {/* Skills */}
          <div className="profile-card">
            <div className="card-header">
              <h2>
                {t("auto.skills", { defaultValue: "Skills" })}
                <span className="required-asterisk">*</span>
              </h2>
              <button
                className="icon-btn"
                onClick={() => handleAdd("Skills")}
                type="button"
                aria-label={t("auto.add_skills", {
                  defaultValue: "Add skills",
                })}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
              </button>
            </div>
            <p className="card-placeholder">
              {t(
                "auto.share_your_expertise_or_notable_skills_with_recruiters",
                {
                  defaultValue:
                    "Share your expertise or notable skills with recruiters, such as Java, Python, Project Management, etc.",
                },
              )}
            </p>
          </div>
          {/* Render the connected accounts block here */}
          <ConnectedAccounts />
        </div>

        {/* RIGHT COLUMN (WIDGETS) */}
        <div className="profile-right">
          {/* AI Profile Completion Widget */}
          <div className="profile-card widget-card">
            <h2>
              {t("auto.your_ai_personal_recruiter", {
                defaultValue: "Your AI Personal Recruiter",
              })}
            </h2>
            <p className="widget-subtitle">
              Dear {userData.fullName.split(" ")[0]}, your profile is only{" "}
              <strong>8.33 %</strong>
              {t("auto.complete_please_fill_in_all_required_details", {
                defaultValue: "complete. Please fill in all required details.",
              })}
            </p>
            <div className="progress-bar-container">
              <div className="progress-fill" style={{ width: "8.33%" }}></div>
            </div>
            <div className="widget-list">
              <div className="widget-item">
                <span className="material-symbols-outlined">add_circle</span>{" "}
                Add Experience
              </div>
              <div className="widget-item">
                <span className="material-symbols-outlined">add_circle</span>{" "}
                Add Skills
              </div>
              <div className="widget-item">
                <span className="material-symbols-outlined">add_circle</span>{" "}
                Add Education
              </div>
              <div className="widget-item">
                <span className="material-symbols-outlined">add_circle</span>{" "}
                Add About you
              </div>
              <div className="widget-item">
                <span className="material-symbols-outlined">add_circle</span>{" "}
                Add information
              </div>
            </div>
            <button
              className="btn-primary-full"
              onClick={() => handleAdd("Resume")}
              aria-label={t("auto.generate_resume", {
                defaultValue: "Generate resume",
              })}
            >
              {t("auto.generate_resume_9ef700", {
                defaultValue: "Generate Resume",
              })}
            </button>
          </div>

          {/* Jobs For You Widget */}
          <div className="profile-card widget-card">
            <div className="card-header">
              <h2>
                {t("auto.jobs_for_you", { defaultValue: "Jobs For You" })}
              </h2>
            </div>
            <p className="card-placeholder">
              {t("auto.not_available_add_more_skills", {
                defaultValue: "Not available, add more skills.",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
