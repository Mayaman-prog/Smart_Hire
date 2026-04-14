import React from "react";
import toast from "react-hot-toast";
import "./Toast.css";

// Custom toast functions
export const showSuccess = (message, duration = 3000) => {
  toast.success(message, {
    duration,
    icon: "✓",
    style: {
      background: "var(--toast-success-bg)",
      color: "white",
    },
  });
};

export const showError = (message, duration = 4000) => {
  toast.error(message, {
    duration,
    icon: "✗",
    style: {
      background: "var(--toast-error-bg)",
      color: "white",
    },
  });
};

export const showInfo = (message, duration = 3000) => {
  toast(message, {
    duration,
    icon: "ℹ",
    style: {
      background: "var(--toast-info-bg)",
      color: "white",
    },
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
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
      <Toaster
        position="top-right"
        toastOptions={{
          className: "custom-toast",
          success: {
            className: "custom-toast-success",
          },
          error: {
            className: "custom-toast-error",
          },
        }}
      />
    </>
  );
};
