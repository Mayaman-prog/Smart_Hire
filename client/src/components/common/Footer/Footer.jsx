import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import "./Footer.css";

const Footer = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Determine which links to show based on user role
  const getRoleLinks = () => {
    switch (user?.role) {
      case "employer":
        return {
          column1: {
            title: t("footer.forEmployers"),
            links: [
              {
                label: t("nav.postJob"),
                path: "/dashboard/employer?tab=post-job",
              },
              { label: t("footer.employerSupport"), path: "#" },
            ],
          },
        };
      case "admin":
        return {
          column1: {
            title: t("roles.admin"),
            links: [
              {
                label: t("footer.manageUsers"),
                path: "/dashboard/admin?tab=users",
              },
              {
                label: t("footer.systemLogs"),
                path: "/dashboard/admin?tab=logs",
              },
            ],
          },
        };
      default: // job_seeker or unauthenticated
        return {
          column1: {
            title: t("footer.forJobseekers"),
            links: [
              { label: t("nav.findJobs"), path: "/jobs" },
              { label: t("footer.createFreeAccount"), path: "/register" },
              { label: t("footer.uploadResume"), path: "/profile" },
              { label: t("footer.jobseekerSupport"), path: "#" },
            ],
          },
        };
    }
  };

  const roleLinks = getRoleLinks();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* TOP SECTION: 3 Columns (Links) */}
        <div className="footer-links-section">
          {/* Column 1: Role-specific links */}
          <div className="footer-column">
            <h4 className="footer-column-title">{roleLinks.column1.title}</h4>
            <ul className="footer-list">
              {roleLinks.column1.links.map((link, index) => (
                <li key={index}>
                  <a href={link.path} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="footer-column">
            <h4 className="footer-column-title">{t("footer.company")}</h4>
            <ul className="footer-list">
              <li>
                <a href="#" className="footer-link">
                  {t("footer.whySmartHireAi")}
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  {t("footer.blog")}
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  {t("footer.aboutSmartHire")}
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  {t("footer.career")}
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  {t("footer.contactUs")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Helpful Resources */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              {t("footer.helpfulResources")}
            </h4>
            <ul className="footer-list">
              <li>
                <a href="#" className="footer-link">
                  {t("footer.terms")}
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  {t("footer.privacy")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION: Logo + Social Icons */}
        <div className="footer-brand-row">
          <div className="footer-brand-left">
            <span
              className="material-symbols-outlined work-icon"
              aria-hidden="true"
            >
              work
            </span>
            <span className="footer-brand-text">
              Smart<span className="footer-brand-highlight">Hire</span>
            </span>
          </div>
          <div className="footer-social-right">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label={t("footer.linkedin")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label={t("footer.github")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57 4.765-1.587 8.205-6.085 8.205-11.387 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label={t("footer.twitter")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label={t("footer.facebook")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="footer-copyright">
          <p>{t("footer.copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
