import React from 'react';
import { useParams } from 'react-router-dom';
import './JobDetailsPage.css';

const JobDetailsPage = () => {
    const { id } = useParams();  // Get job ID from URL

    return (
        <div className="job-details-page">
            <div className="container">
                <h1>Job Details</h1>
                <p>Viewing job with ID: {id}</p>
            </div>
        </div>
    );
};

export default JobDetailsPage;