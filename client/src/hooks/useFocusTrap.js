import { useEffect, useRef } from "react";

// These are the elements that keyboard users can normally focus inside a modal
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

// This function collects all visible focusable elements inside the modal
function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(container.querySelectorAll(focusableSelector)).filter(
    (element) => {
      const style = window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.getAttribute("aria-hidden") !== "true"
      );
    },
  );
}

// This custom hook keeps keyboard focus inside the modal while it is open
export function useFocusTrap(isOpen, onClose) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keeps the latest close function available inside the keydown listener
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;

    // Saves the element that opened the modal so focus can return there later
    previousFocusRef.current = document.activeElement;

    if (!container) return;

    // Moves focus to the first useful element inside the modal
    const focusFirstElement = () => {
      const focusableElements = getFocusableElements(container);
      const autoFocusElement = container.querySelector("[data-autofocus]");

      if (autoFocusElement instanceof HTMLElement) {
        autoFocusElement.focus();
        return;
      }

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        return;
      }

      container.focus();
    };

    // Handles Tab, Shift + Tab, and Escape while the modal is open
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        if (onCloseRef.current) {
          onCloseRef.current();
        }

        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(container);

      // If there are no focusable elements, keep focus on the modal itself
      if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If focus somehow moves outside the modal, bring it back inside
      if (!container.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      // Shift + Tab on first element moves focus to the last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab on last element moves focus back to the first element
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    requestAnimationFrame(focusFirstElement);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      const previousFocus = previousFocusRef.current;

      // Returns focus to the button or element that opened the modal
      if (
        previousFocus instanceof HTMLElement &&
        document.contains(previousFocus)
      ) {
        previousFocus.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}
