import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./CompanyCard.css";

const CompanyCard = ({ company }) => {
  const { t } = useTranslation();
  const jobsCount = company.jobs_count || 0;

  return (
    <Link
      to={`/companies/${company.id}`}
      className="company-card-link"
      aria-label={t("companies.viewCompanyNamed", {
        defaultValue: "View company {{name}}",
        name: company.name,
      })}
    >
      <div className="company-card">
        <div className="company-card-header">
          <div className="company-logo" aria-hidden="true">
            {company.initials || company.name?.charAt(0) || "C"}
          </div>
          {company.is_verified && (
            <div
              className="verified-badge"
              aria-label={t("companies.verified", {
                defaultValue: "Verified Company",
              })}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                verified
              </span>
            </div>
          )}
        </div>

        <div className="company-card-content">
          <h3 className="company-name">{company.name}</h3>
          <div className="company-location">
            <span className="material-symbols-outlined" aria-hidden="true">
              location_on
            </span>
            <span>
              {company.location ||
                t("companies.locationNotSpecified", {
                  defaultValue: "Location not specified",
                })}
            </span>
          </div>
          <div className="company-jobs-count">
            <span className="material-symbols-outlined" aria-hidden="true">
              work
            </span>
            <span>
              {t("companies.openPositionsCount", {
                defaultValue: "{{count}} open position",
                count: jobsCount,
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;
