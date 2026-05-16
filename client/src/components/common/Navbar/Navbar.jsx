import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useAuth } from "../../../contexts/AuthContext";
import { ThemeContext } from "../../../contexts/ThemeContext";
import toast from "react-hot-toast";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const isSystemDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  const activeTheme =
    theme === "system" ? (isSystemDark ? "dark" : "light") : theme;

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { t } = useTranslation();

  const translate = (key, defaultValue) => {
    return t(key, { defaultValue });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isUserDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserDropdownOpen]);

  // Lock scroll when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    toast.success(
      t("toast.loggedOut", { defaultValue: "Logged out successfully" }),
    );
    navigate("/");
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // NAVIGATION LINKS (Main Navbar)
  const getNavLinks = () => {
    const commonLinks = [
      {
        path: "/",
        label: translate("nav.home", "Home"),
        icon: "home",
      },
      {
        path: "/jobs",
        label: translate("nav.findJobs", "Find Jobs"),
        icon: "search",
      },
    ];

    if (!isAuthenticated) return commonLinks;

    const roleSpecificLinks = [];

    switch (user?.role) {
      case "job_seeker":
        roleSpecificLinks.push({
          path: "/dashboard/seeker",
          label: translate("nav.dashboard", "Dashboard"),
          icon: "dashboard",
        });
        break;
      // TEMPORARILY REMOVED TO PREVENT 404 – add later when `/profile` route exists
      // roleSpecificLinks.push({
      //   path: "/profile",
      //   label: "Upload Resume",
      //   icon: "upload_file",
      // });

      case "employer":
        roleSpecificLinks.push({
          path: "/dashboard/employer",
          label: translate("nav.dashboard", "Dashboard"),
          icon: "dashboard",
        });
        roleSpecificLinks.push({
          path: "/dashboard/employer/post-job",
          label: translate("nav.postJob", "Post a Job"),
          icon: "work",
        });
        roleSpecificLinks.push({
          path: "/dashboard/employer/my-jobs",
          label: translate("nav.myJobs", "My Jobs"),
          icon: "list",
        });
        roleSpecificLinks.push({
          path: "/dashboard/employer/candidates",
          label: translate("nav.candidates", "Candidates"),
          icon: "group",
        });
        break;

      case "admin":
        roleSpecificLinks.push({
          path: "/dashboard/admin",
          label: translate("nav.adminPanel", "Admin Panel"),
          icon: "admin_panel_settings",
        });
        break;

      default:
        roleSpecificLinks.push({
          path: "/dashboard",
          label: translate("nav.dashboard", "Dashboard"),
          icon: "dashboard",
        });
    }
    return [...commonLinks, ...roleSpecificLinks];
  };

  const navLinks = getNavLinks();

  // USER DROPDOWN ITEMS
  const getDashboardPath = () => {
    if (user?.role === "job_seeker") return "/dashboard/seeker";
    if (user?.role === "employer") return "/dashboard/employer";
    if (user?.role === "admin") return "/dashboard/admin";
    return "/dashboard";
  };

  const getProfilePath = () => {
    if (user?.role === "job_seeker") return "/dashboard/seeker/profile";
    if (user?.role === "employer") return "/dashboard/employer/profile";
    if (user?.role === "admin") return "/dashboard/admin/profile";
    return "/profile";
  };

  const getUserDropdownItems = () => {
    const items = [];

    if (user?.role === "employer") {
      items.push({
        path: "/dashboard/employer/post-job",
        label: translate("nav.postJob", "Post a Job"),
        icon: "post_add",
      });
    }

    // Dashboard
    items.push({
      path: getDashboardPath(),
      label: translate("nav.dashboard", "Dashboard"),
      icon: "dashboard",
    });

    items.push({
      path: getProfilePath(),
      label: translate("nav.profile", "Profile"),
      icon: "person",
    });

    if (user?.role === "admin") {
      items.push({
        path: "/dashboard/admin",
        label: translate("nav.adminPanel", "Admin Panel"),
        icon: "admin_panel_settings",
      });
    }

    return items;
  };

  const dropdownItems = getUserDropdownItems();

  // HELPER FUNCTIONS (Badges, Labels, Icons)
  const getRoleBadgeClass = () => {
    switch (user?.role) {
      case "employer":
        return "role-badge employer";
      case "admin":
        return "role-badge admin";
      default:
        return "role-badge job-seeker";
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "employer":
        return translate("roles.employer", "Employer");
      case "admin":
        return translate("roles.admin", "Admin");
      default:
        return translate("roles.jobSeeker", "Job Seeker");
    }
  };

  const getTriggerIcon = () => {
    switch (user?.role) {
      case "employer":
        return "apartment";
      case "admin":
        return "admin_panel_settings";
      default:
        return "person";
    }
  };

  // RENDER
  return (
    <>
      <nav
        className="navbar"
        aria-label={translate("nav.primaryNavigation", "Primary navigation")}
      >
        <div className="navbar-container">
          <Link
            to="/"
            className="logo"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={translate("nav.smartHireHome", "SmartHire home")}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              work
            </span>
            <span className="logo-text">
              Smart<span className="logo-highlight">Hire</span>
            </span>
          </Link>

          <div className="nav-links desktop-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={
                  link.path === "/dashboard/seeker" ||
                  link.path === "/dashboard/employer" ||
                  link.path === "/dashboard/admin"
                }
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-right">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="user-menu">
                {/* Notification Bell */}
                <div className="nav-icons">
                  <button
                    className="icon-btn"
                    type="button"
                    aria-label={translate(
                      "nav.viewNotifications",
                      "View notifications",
                    )}
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      notifications
                    </span>
                  </button>
                </div>

                {/* User Trigger Button */}
                <button
                  ref={buttonRef}
                  className="user-trigger-btn"
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="menu"
                  aria-controls="user-dropdown-menu"
                  aria-label={
                    isUserDropdownOpen
                      ? translate("nav.closeUserMenu", "Close user menu")
                      : translate("nav.openUserMenu", "Open user menu")
                  }
                >
                  <span className="user-trigger-icon">
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      {getTriggerIcon()}
                    </span>
                  </span>
                  <span
                    className="material-symbols-outlined arrow-icon"
                    aria-hidden="true"
                  >
                    arrow_drop_down
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    ref={dropdownRef}
                    className="dropdown-menu"
                    role="menu"
                    aria-label={translate("nav.userMenu", "User menu")}
                  >
                    <div className="dropdown-user-info">
                      <div className="user-avatar-circle">
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          {getTriggerIcon()}
                        </span>
                      </div>
                      <div className="user-text-info">
                        <p className="dropdown-user-name">
                          {user?.name || translate("nav.defaultUser", "User")}
                        </p>
                        <p className="dropdown-user-email">{user?.email}</p>
                        <span className={getRoleBadgeClass()}>
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>
                    <div className="dropdown-divider" aria-hidden="true"></div>
                    {dropdownItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setIsUserDropdownOpen(false)}
                        aria-label={item.label}
                      >
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </NavLink>
                    ))}
                    <div className="dropdown-divider" aria-hidden="true"></div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-item logout"
                      role="menuitem"
                      aria-label={translate("nav.signOut", "Sign out")}
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        logout
                      </span>
                      {translate("nav.signOut", "Sign out")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="btn-link"
                  aria-label={translate("nav.login", "Login")}
                >
                  {translate("nav.login", "Login")}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                  aria-label={translate("nav.register", "Register")}
                >
                  {translate("nav.register", "Register")}
                </Link>
              </div>
            )}

            {/* Theme Toggle Button */}
            <div className="theme-toggle">
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                type="button"
                aria-label={translate(
                  "nav.switchTheme",
                  `Switch theme. Current theme is ${activeTheme}`,
                )}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {activeTheme === "light" ? "light_mode" : "dark_mode"}
                </span>
              </button>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              type="button"
              aria-label={translate(
                "nav.openNavigationMenu",
                "Open navigation menu",
              )}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                menu
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-navigation-drawer"
        className={`mobile-drawer ${isMobileMenuOpen ? "open" : ""}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          className="drawer-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label={translate(
            "nav.closeNavigationMenu",
            "Close navigation menu",
          )}
        ></button>
        <aside
          className="drawer-content"
          role="dialog"
          aria-modal="true"
          aria-label={translate("nav.mobileNavigation", "Mobile navigation")}
        >
          <div className="drawer-header">
            <Link
              to="/"
              className="drawer-logo"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={translate("nav.smartHireHome", "SmartHire home")}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                work
              </span>
              <span className="logo-text">
                Smart<span className="logo-highlight">Hire</span>
              </span>
            </Link>

            <button
              className="close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              type="button"
              aria-label={translate(
                "nav.closeNavigationMenu",
                "Close navigation menu",
              )}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </div>

          {isAuthenticated && (
            <div className="drawer-user-info">
              <div className="drawer-user-details">
                <p className="drawer-user-name">
                  {user?.name || translate("nav.defaultUser", "User")}
                </p>
                <p className="drawer-user-email">{user?.email}</p>
                <span className={getRoleBadgeClass()}>{getRoleLabel()}</span>
              </div>
            </div>
          )}

          <div
            className="drawer-links"
            aria-label={translate("nav.mobileNavigation", "Mobile navigation")}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? "drawer-link active" : "drawer-link"
                }
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={link.label}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="drawer-auth-buttons">
              <Link
                to="/login"
                className="drawer-btn-link"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={translate("nav.login", "Login")}
              >
                {translate("nav.login", "Login")}
              </Link>

              <Link
                to="/register"
                className="drawer-btn-primary"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={translate("nav.register", "Register")}
              >
                {translate("nav.register", "Register")}
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="drawer-footer">
              <button
                type="button"
                onClick={handleLogout}
                className="drawer-logout-btn"
                aria-label={translate("nav.logout", "Logout")}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  logout
                </span>
                {translate("nav.logout", "Logout")}
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default Navbar;
