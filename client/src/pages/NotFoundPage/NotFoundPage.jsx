import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

// 404 page for unknown routes
const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-container">
                <h1 className="not-found-code">404</h1>
                <h2 className="not-found-title">Page Not Found</h2>
                <p className="not-found-text">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="not-found-btn">
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;