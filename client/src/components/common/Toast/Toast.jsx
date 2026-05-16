import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./Toast.css";

// Shared accessibility setting for all toast messages.
// role="status" and aria-live="polite" allow screen readers to announce
// notifications without immediately interrupting the user.
const toastAriaProps = {
  role: "status",
  "aria-live": "polite",
};

// Custom toast functions
export const showSuccess = (message, duration = 5000) => {
  toast.success(message, {
    duration,
    icon: (
      <span aria-hidden="true" className="toast-icon">
        ✓
      </span>
    ),
    ariaProps: toastAriaProps,
    style: {
      background: "var(--toast-success-bg)",
      color: "white",
    },
  });
};

export const showError = (message, duration = 5000) => {
  toast.error(message, {
    duration,
    icon: (
      <span aria-hidden="true" className="toast-icon">
        ✗
      </span>
    ),
    ariaProps: toastAriaProps,
    style: {
      background: "var(--toast-error-bg)",
      color: "white",
    },
  });
};

export const showInfo = (message, duration = 5000) => {
  toast(message, {
    duration,
    icon: (
      <span aria-hidden="true" className="toast-icon">
        {"\u2139"}
      </span>
    ),
    ariaProps: toastAriaProps,
    className: "custom-toast-info",
    style: {
      background: "var(--toast-info-bg)",
      color: "white",
    },
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    ariaProps: toastAriaProps,
    className: "custom-toast-loading",
    style: {
      background: "var(--toast-loading-bg)",
      color: "white",
    },
  });
};

// Toast Provider wrapper
export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}

      {/* 
        Live region wrapper for screen reader announcements.
        Keeping this region mounted helps NVDA and VoiceOver detect
        dynamically added toast messages more reliably.
      */}
      <div
        className="toast-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={t("auto.notification_messages", {
          defaultValue: "Notification messages",
        })}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            className: "custom-toast",
            ariaProps: toastAriaProps,
            success: {
              className: "custom-toast-success",
              ariaProps: toastAriaProps,
            },
            error: {
              className: "custom-toast-error",
              ariaProps: toastAriaProps,
            },
            loading: {
              className: "custom-toast-loading",
              ariaProps: toastAriaProps,
            },
          }}
        />
      </div>
    </>
  );
};
