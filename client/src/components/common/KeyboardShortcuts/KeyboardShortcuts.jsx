import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "./KeyboardShortcuts.css";

// Checks whether the user is currently typing in a form field
function isTypingElement(element) {
  if (!element) return false;

  const tagName = element.tagName?.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
}

// Moves keyboard focus directly to the main content area
function focusMainContent() {
  const mainContent = document.getElementById("main-content");

  if (mainContent) {
    mainContent.focus();
  }
}

// Finds and focuses the main job search input
function focusJobSearchInput(attempts = 10) {
  const searchInput =
    document.querySelector('[data-hotkey="job-search"]') ||
    document.getElementById("job-search-input") ||
    document.querySelector('input[type="search"]') ||
    document.querySelector('input[placeholder*="Search"]') ||
    document.querySelector('input[placeholder*="search"]');

  if (searchInput instanceof HTMLElement) {
    searchInput.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    searchInput.focus();
    searchInput.select?.();

    return;
  }

  // Tries again after navigation because the Jobs page may still be rendering
  if (attempts > 0) {
    setTimeout(() => {
      focusJobSearchInput(attempts - 1);
    }, 100);
  }
}

// Returns the same dashboard route used by the Navbar
function getDashboardPath(user, isAuthenticated) {
  if (!isAuthenticated) {
    return "/login";
  }

  if (user?.role === "job_seeker") {
    return "/dashboard/seeker";
  }

  if (user?.role === "employer") {
    return "/dashboard/employer";
  }

  if (user?.role === "admin") {
    return "/dashboard/admin";
  }

  return "/login";
}

// Tries to close the currently opened modal or dialog
function closeTopLayerElement() {
  const openDialog = document.querySelector(
    '[role="dialog"], [aria-modal="true"], .modal, .modal-overlay',
  );

  if (openDialog) {
    const closeButton =
      openDialog.querySelector('[aria-label="Close modal"]') ||
      openDialog.querySelector('[aria-label="Close"]') ||
      openDialog.querySelector('[aria-label="Close filters"]') ||
      openDialog.querySelector(".modal-close") ||
      openDialog.querySelector(".close-button") ||
      openDialog.querySelector("button");

    if (closeButton instanceof HTMLElement) {
      closeButton.click();
      return true;
    }
  }

  return false;
}

function KeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    function handleKeyboardShortcuts(event) {
      const key = event.key.toLowerCase();

      // Stops shortcuts from running while the user is typing
      if (isTypingElement(event.target)) {
        return;
      }

      // Checks that only the Alt key is used with the shortcut
      const isAltShortcut =
        event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

      // Alt + S opens the Jobs page and focuses the search input
      if (isAltShortcut && key === "s") {
        event.preventDefault();
        event.stopPropagation();

        if (location.pathname !== "/jobs") {
          navigate("/jobs");

          setTimeout(() => {
            focusJobSearchInput();
          }, 150);
        } else {
          focusJobSearchInput();
        }

        return;
      }

      // Alt + J navigates directly to the Jobs page
      if (isAltShortcut && key === "j") {
        event.preventDefault();
        event.stopPropagation();

        navigate("/jobs");
        setTimeout(focusMainContent, 100);

        return;
      }

      // Alt + H navigates directly to the Home page
      if (isAltShortcut && key === "h") {
        event.preventDefault();
        event.stopPropagation();

        navigate("/");
        setTimeout(focusMainContent, 100);

        return;
      }

      // Alt + D navigates to the dashboard using the logged-in user role
      if (isAltShortcut && key === "d") {
        event.preventDefault();
        event.stopPropagation();

        navigate(getDashboardPath(user, isAuthenticated));
        setTimeout(focusMainContent, 100);

        return;
      }

      // Escape closes modal or removes focus from the active element
      if (key === "escape") {
        event.preventDefault();
        event.stopPropagation();

        const didCloseElement = closeTopLayerElement();

        if (!didCloseElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    }

    // Adds global keyboard shortcut listener
    window.addEventListener("keydown", handleKeyboardShortcuts);

    // Removes listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [location.pathname, navigate, user, isAuthenticated]);

  return null;
}

export default KeyboardShortcuts;
