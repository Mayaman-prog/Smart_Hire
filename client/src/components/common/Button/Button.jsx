import React from "react";
import { useTranslation } from "react-i18next";
import "./Button.css";

// Button component with 5 variants, 3 sizes, and loading/disabled states
const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  fullWidth = false,
  className = "",
}) => {
  const { t } = useTranslation();

  // Get variant CSS class
  const getVariantClass = () => {
    switch (variant) {
      case "primary":
        return "btn-primary";
      case "secondary":
        return "btn-secondary";
      case "danger":
        return "btn-danger";
      case "outline":
        return "btn-outline";
      case "ghost":
        return "btn-ghost";
      default:
        return "btn-primary";
    }
  };

  // Get size CSS class
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "btn-sm";
      case "lg":
        return "btn-lg";
      default:
        return "btn-md";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${fullWidth ? "btn-full-width" : ""} ${className}`}
    >
      {isLoading ? (
        <div className="btn-loading">
          <span className="btn-spinner"></span>
          <span>{t("common.loading")}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
