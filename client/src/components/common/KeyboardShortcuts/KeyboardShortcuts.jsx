import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "./KeyboardShortcuts.css";

// List of shortcut keys shown inside the help panel
const shortcuts = [
  {
    keys: "Alt + S",
    action: "Focus job search",
  },
  {
    keys: "Alt + J",
    action: "Go to Jobs page",
  },
  {
    keys: "Alt + H",
    action: "Go to Home page",
  },
  {
    keys: "Alt + D",
    action: "Go to Dashboard",
  },
  {
    keys: "Esc",
    action: "Close modal/help or remove focus",
  },
  {
    keys: "?",
    action: "Show or hide keyboard shortcuts help",
  },
];

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
      openDialog.querySelector(".modal-close") ||
      openDialog.querySelector(".close-button") ||
      openDialog.querySelector("button");

    if (closeButton) {
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
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyboardShortcuts(event) {
      const key = event.key.toLowerCase();

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

      // Escape closes help, closes modal, or removes focus from the active element
      if (key === "escape") {
        event.preventDefault();
        event.stopPropagation();

        if (showHelp) {
          setShowHelp(false);
          return;
        }

        const didCloseElement = closeTopLayerElement();

        if (!didCloseElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        return;
      }

      // Question mark opens or closes the keyboard shortcuts help panel
      if (
        event.key === "?" &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !isTypingElement(event.target)
      ) {
        event.preventDefault();
        event.stopPropagation();

        setShowHelp((currentValue) => !currentValue);
      }
    }

    // Adds global keyboard shortcut listener
    window.addEventListener("keydown", handleKeyboardShortcuts);

    // Removes listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [location.pathname, navigate, showHelp, user, isAuthenticated]);

  return (
    <>
      <button
        type="button"
        className="keyboard-help-button"
        aria-label="Show keyboard shortcuts help"
        aria-expanded={showHelp}
        onClick={() => setShowHelp((currentValue) => !currentValue)}
      >
        ?
      </button>

      {showHelp && (
        <div
          className="keyboard-help-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="keyboard-help-title"
        >
          <div className="keyboard-help-header">
            <h2 id="keyboard-help-title">Keyboard shortcuts</h2>

            <button
              type="button"
              className="keyboard-help-close"
              aria-label="Close keyboard shortcuts help"
              onClick={() => setShowHelp(false)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </div>

          <ul className="keyboard-help-list">
            {shortcuts.map((shortcut) => (
              <li key={shortcut.keys}>
                <kbd>{shortcut.keys}</kbd>
                <span>{shortcut.action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default KeyboardShortcuts;
