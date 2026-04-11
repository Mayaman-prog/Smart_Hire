import React from 'react';
import { useParams } from 'react-router-dom';
import './CompanyDetailsPage.css';

const CompanyDetailsPage = () => {
    const { id } = useParams();  // Get company ID from URL

    return (
        <div className="company-details-page">
            <div className="container">
                <h1>Company Details</h1>
                <p>Viewing company with ID: {id}</p>
            </div>
        </div>
    );
};

export default CompanyDetailsPage;