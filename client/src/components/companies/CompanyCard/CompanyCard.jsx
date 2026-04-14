import React from 'react';
import { Link } from 'react-router-dom';
import './CompanyCard.css';

const CompanyCard = ({ company }) => {
    return (
        <Link to={`/companies/${company.id}`} className="company-card-link">
            <div className="company-card">
                <div className="company-card-header">
                    <div className="company-logo">
                        {company.initials || company.name?.charAt(0) || 'C'}
                    </div>
                    {company.is_verified && (
                        <div className="verified-badge">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                    )}
                </div>

                <div className="company-card-content">
                    <h3 className="company-name">{company.name}</h3>
                    <div className="company-location">
                        <span className="material-symbols-outlined">location_on</span>
                        <span>{company.location || 'Location not specified'}</span>
                    </div>
                    <div className="company-jobs-count">
                        <span className="material-symbols-outlined">work</span>
                        <span>{company.jobs_count || 0} open position{company.jobs_count !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CompanyCard;