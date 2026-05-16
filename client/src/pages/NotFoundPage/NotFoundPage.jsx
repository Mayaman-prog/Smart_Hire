import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./NotFoundPage.css";

// 404 page for unknown routes
const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">
          {t("auto.page_not_found", { defaultValue: "Page Not Found" })}
        </h2>
        <p className="not-found-text">
          {t("auto.oops_the_page_you_re_looking_for_doesn_t_exist_or_has_b", {
            defaultValue:
              "Oops! The page you're looking for doesn't exist or has been moved.",
          })}
        </p>
        <Link to="/" className="not-found-btn">
          {t("auto.go_back_home", { defaultValue: "Go Back Home" })}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
