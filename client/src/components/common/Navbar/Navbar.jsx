import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
    toast.success("Logged out successfully");
    navigate("/");
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // NAVIGATION LINKS (Main Navbar)
  const getNavLinks = () => {
    const commonLinks = [
      { path: "/", label: "Home", icon: "home" },
      { path: "/jobs", label: "Find Jobs", icon: "search" },
    ];
    if (!isAuthenticated) return commonLinks;

    const roleSpecificLinks = [];
    switch (user?.role) {
      case "job_seeker":
        roleSpecificLinks.push({
          path: "/dashboard/seeker",
          label: "Dashboard",
          icon: "dashboard",
        });
        // TEMPORARILY REMOVED TO PREVENT 404 – add later when `/profile` route exists
        // roleSpecificLinks.push({
        //   path: "/profile",
        //   label: "Upload Resume",
        //   icon: "upload_file",
        // });
        break;
      case "employer":
        roleSpecificLinks.push({
          path: "/dashboard/employer",
          label: "Dashboard",
          icon: "dashboard",
        });
        roleSpecificLinks.push({
          path: "/dashboard/employer/post-job",
          label: "Post a Job",
          icon: "work",
        });
        roleSpecificLinks.push({
          path: "/dashboard/employer/my-jobs",
          label: "My Jobs",
          icon: "list",
        });
        roleSpecificLinks.push({
          path: "/dashboard/employer/candidates",
          label: "Candidates",
          icon: "group",
        });
        break;
      case "admin":
        roleSpecificLinks.push({
          path: "/dashboard/admin",
          label: "Admin Panel",
          icon: "admin_panel_settings",
        });
        break;
      default:
        roleSpecificLinks.push({
          path: "/dashboard",
          label: "Dashboard",
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
        label: "Post a Job",
        icon: "post_add",
      });
    }

    // Dashboard
    items.push({
      path: getDashboardPath(),
      label: "Dashboard",
      icon: "dashboard",
    });

    items.push({
      path: getProfilePath(),
      label: "Profile",
      icon: "person",
    });

    if (user?.role === "admin") {
      items.push({
        path: "/dashboard/admin",
        label: "Admin Panel",
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
        return "Employer";
      case "admin":
        return "Admin";
      default:
        return "Job Seeker";
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
      <nav className="navbar">
        <div className="navbar-container">
          <Link
            to="/"
            className="logo"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined">work</span>
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
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-right">
            {isAuthenticated ? (
              <div className="user-menu">
                {/* Notification Bell */}
                <div className="nav-icons">
                  <button className="icon-btn">
                    <span className="material-symbols-outlined">
                      notifications
                    </span>
                  </button>
                </div>

                {/* User Trigger Button */}
                <button
                  ref={buttonRef}
                  className="user-trigger-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-expanded={isUserDropdownOpen}
                >
                  <span className="user-trigger-icon">
                    <span className="material-symbols-outlined">
                      {getTriggerIcon()}
                    </span>
                  </span>
                  <span className="material-symbols-outlined arrow-icon">
                    arrow_drop_down
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div ref={dropdownRef} className="dropdown-menu">
                    <div className="dropdown-user-info">
                      <div className="user-avatar-circle">
                        <span className="material-symbols-outlined">
                          {getTriggerIcon()}
                        </span>
                      </div>
                      <div className="user-text-info">
                        <p className="dropdown-user-name">
                          {user?.name || "User"}
                        </p>
                        <p className="dropdown-user-email">{user?.email}</p>
                        <span className={getRoleBadgeClass()}>
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    {dropdownItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className="dropdown-item"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                        {item.label}
                      </NavLink>
                    ))}
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-link">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}

            {/* Theme Toggle Button */}
            <div className="theme-toggle">
              <button onClick={toggleTheme} className="theme-toggle-btn">
                <span className="material-symbols-outlined">
                  {activeTheme === "light" ? "light_mode" : "dark_mode"}
                </span>
              </button>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? "open" : ""}`}>
        <div
          className="drawer-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div className="drawer-content">
          <div className="drawer-header">
            <Link
              to="/"
              className="drawer-logo"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined">work</span>
              <span className="logo-text">
                Smart<span className="logo-highlight">Hire</span>
              </span>
            </Link>
            <button
              className="close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {isAuthenticated && (
            <div className="drawer-user-info">
              <div className="drawer-user-details">
                <p className="drawer-user-name">{user?.name || "User"}</p>
                <p className="drawer-user-email">{user?.email}</p>
                <span className={getRoleBadgeClass()}>{getRoleLabel()}</span>
              </div>
            </div>
          )}

          <div className="drawer-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? "drawer-link active" : "drawer-link"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
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
              >
                Login
              </Link>
              <Link
                to="/register"
                className="drawer-btn-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="drawer-footer">
              <button onClick={handleLogout} className="drawer-logout-btn">
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
