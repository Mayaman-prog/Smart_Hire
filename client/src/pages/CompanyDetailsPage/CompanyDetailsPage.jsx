import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import JobCard from '../../components/jobs/JobCard/JobCard';
import companiesData from '../../data/companies.json';
import jobsData from '../../data/jobs.json';
import './CompanyDetailsPage.css';

const CompanyDetailsPage = () => {
    // Get company ID from URL parameter
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State variables
    const [company, setCompany] = useState(null);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('positions'); // 'positions' or 'about'
    const [error, setError] = useState(null);

    // Load company details and jobs on component mount
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Simulate API delay (replace with actual API call)
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Find company by ID from JSON data
                const foundCompany = companiesData.companies.find(c => c.id === parseInt(id));
                
                // If company not found, show 404 error
                if (!foundCompany) {
                    setError('Company not found');
                    setLoading(false);
                    return;
                }
                
                setCompany(foundCompany);
                
                // Find jobs for this company
                const jobs = jobsData.jobs.filter(job => 
                    job.company === foundCompany.name && job.is_active !== false
                );
                setCompanyJobs(jobs);
                
            } catch (err) {
                setError('Failed to load company details');
                console.error('Error fetching company:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCompanyDetails();
    }, [id]);

    // Get job count text
    const getJobCountText = () => {
        if (companyJobs.length === 0) return 'No open positions';
        if (companyJobs.length === 1) return '1 open position';
        return `${companyJobs.length} open positions`;
    };

    // Loading skeleton state
    if (loading) {
        return (
            <div className="company-details-page">
                <div className="container">
                    <div className="loading-skeleton">
                        <div className="skeleton-banner"></div>
                        <div className="skeleton-logo"></div>
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-tabs"></div>
                    </div>
                </div>
            </div>
        );
    }

    // 404 error state - company not found
    if (error || !company) {
        return (
            <div className="company-details-page">
                <div className="container">
                    <div className="error-state">
                        <div className="error-icon">🏢</div>
                        <h2>Company Not Found</h2>
                        <p>The company you're looking for doesn't exist or has been removed.</p>
                        <button onClick={() => navigate('/companies')} className="back-btn">
                            Browse Companies
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="company-details-page">
            <div className="container">
                {/* Smart Feature: Skill Match Insights */}
                <div className="match-insights">
                    <div className="match-icon">⭐</div>
                    <div className="match-content">
                        <h4>SmartHire Match Insights</h4>
                        <p>Based on your profile as a Full Stack Engineer, you have a 94% skill alignment with {company.name}'s Engineering culture.</p>
                    </div>
                </div>

                {/* Company Banner */}
                <div className="company-banner">
                    <div className="banner-placeholder"></div>
                </div>

                {/* Company Header with Logo */}
                <div className="company-header">
                    <div className="company-logo-large">
                        {company.initials || company.name?.charAt(0) || 'C'}
                    </div>
                    <div className="company-info">
                        <h1 className="company-name">
                            {company.name}
                            {company.is_verified && <span className="verified-badge-large">✓ Verified</span>}
                        </h1>
                        <div className="company-location">
                            <span className="material-symbols-outlined">location_on</span>
                            <span>{company.location || 'Location not specified'}</span>
                        </div>
                        <div className="company-jobs-count">
                            <span className="material-symbols-outlined">work</span>
                            <span>{getJobCountText()}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="company-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'positions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('positions')}
                    >
                        <span className="material-symbols-outlined">work</span>
                        Open Positions
                        {companyJobs.length > 0 && <span className="tab-count">{companyJobs.length}</span>}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        <span className="material-symbols-outlined">info</span>
                        About
                    </button>
                </div>

                {/* Tab Content - Open Positions */}
                {activeTab === 'positions' && (
                    <div className="tab-content">
                        {companyJobs.length > 0 ? (
                            <div className="jobs-grid">
                                {companyJobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <span className="material-symbols-outlined">work_off</span>
                                </div>
                                <h3>No open positions</h3>
                                <p>This company doesn't have any open positions at the moment.</p>
                                <button onClick={() => navigate('/jobs')} className="empty-btn">
                                    Browse Other Jobs
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content - About */}
                {activeTab === 'about' && (
                    <div className="tab-content">
                        <div className="about-section">
                            <h2>About Us</h2>
                            <p>{company.description || `${company.name} is a leading technology company focused on innovation and excellence. We are dedicated to providing cutting-edge solutions and creating value for our customers.`}</p>
                        </div>

                        <div className="company-contact">
                            <h3>Contact Information</h3>
                            <div className="contact-grid">
                                {company.website && (
                                    <div className="contact-item">
                                        <span className="material-symbols-outlined">language</span>
                                        <div>
                                            <label>Website</label>
                                            <a href={company.website} target="_blank" rel="noopener noreferrer">
                                                {company.website.replace('https://', '')}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {company.email && (
                                    <div className="contact-item">
                                        <span className="material-symbols-outlined">mail</span>
                                        <div>
                                            <label>Email</label>
                                            <a href={`mailto:${company.email}`}>{company.email}</a>
                                        </div>
                                    </div>
                                )}
                                {company.phone && (
                                    <div className="contact-item">
                                        <span className="material-symbols-outlined">call</span>
                                        <div>
                                            <label>Phone</label>
                                            <a href={`tel:${company.phone}`}>{company.phone}</a>
                                        </div>
                                    </div>
                                )}
                                {company.location && (
                                    <div className="contact-item">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <div>
                                            <label>Address</label>
                                            <p>{company.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="map-placeholder">
                            <div className="map-fallback">
                                <span className="material-symbols-outlined">map</span>
                                <p>Map view - {company.location || 'Location not specified'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDetailsPage;