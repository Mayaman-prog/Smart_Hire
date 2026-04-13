import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import JobCard from '../../components/jobs/JobCard/JobCard';
import jobsData from '../../data/jobs.json';
import companiesData from '../../data/companies.json';
import toast from 'react-hot-toast';
import './JobDetailsPage.css';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    
    const [job, setJob] = useState(null);
    const [company, setCompany] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState(null);

    // Load job details
    useEffect(() => {
        const fetchJobDetails = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const foundJob = jobsData.jobs.find(j => j.id === parseInt(id));
                
                if (!foundJob) {
                    setError('Job not found');
                    setLoading(false);
                    return;
                }
                
                setJob(foundJob);
                
                // Find company for this job
                const foundCompany = companiesData.companies.find(c => 
                    c.name === foundJob.company
                );
                setCompany(foundCompany || null);
                
                // Get similar jobs (same job type, excluding current)
                const similar = jobsData.jobs
                    .filter(j => j.job_type === foundJob.job_type && j.id !== foundJob.id)
                    .slice(0, 3);
                setSimilarJobs(similar);
                
                // Check if job is saved (localStorage)
                const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
                setIsSaved(savedJobs.includes(foundJob.id));
                
                // Check if already applied (mock - would be API call)
                const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
                setHasApplied(appliedJobs.includes(foundJob.id));
                
            } catch (err) {
                setError('Failed to load job details');
                console.error('Error fetching job:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchJobDetails();
    }, [id]);

    // Get relative posted date
    const getRelativeDate = (date) => {
        const posted = new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today - posted);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    // Format salary
    const formatSalary = (min, max) => {
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    };

    // Handle Apply Now
    const handleApply = async () => {
        if (!isAuthenticated) {
            // Save current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', `/jobs/${id}`);
            toast.error('Please login to apply for this job');
            navigate('/login');
            return;
        }
        
        if (user?.role !== 'job_seeker') {
            toast.error('Only job seekers can apply for jobs');
            return;
        }
        
        if (hasApplied) {
            toast.error('You have already applied for this job');
            return;
        }
        
        setApplying(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Save to localStorage (mock)
            const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            appliedJobs.push(job.id);
            localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
            
            setHasApplied(true);
            toast.success('Application submitted successfully!');
        } catch (err) {
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    // Handle Save Job
    const handleSaveJob = () => {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        
        if (isSaved) {
            const newSavedJobs = savedJobs.filter(j => j !== job.id);
            localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
            setIsSaved(false);
            toast.success('Job removed from saved');
        } else {
            savedJobs.push(job.id);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            setIsSaved(true);
            toast.success('Job saved successfully');
        }
    };

    // Handle Share
    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    // Get job type label
    const getJobTypeLabel = (jobType) => {
        switch(jobType) {
            case 'full-time': return 'Full-time';
            case 'part-time': return 'Part-time';
            case 'remote': return 'Remote';
            case 'contract': return 'Contract';
            case 'internship': return 'Internship';
            default: return jobType;
        }
    };

    // Get job type class for badge
    const getJobTypeClass = (jobType) => {
        switch(jobType) {
            case 'full-time': return 'badge-full-time';
            case 'part-time': return 'badge-part-time';
            case 'remote': return 'badge-remote';
            case 'contract': return 'badge-contract';
            case 'internship': return 'badge-internship';
            default: return '';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="job-details-page">
                <div className="container">
                    <div className="loading-skeleton">
                        <div className="skeleton-header"></div>
                        <div className="skeleton-meta"></div>
                        <div className="skeleton-content"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state - 404
    if (error || !job) {
        return (
            <div className="job-details-page">
                <div className="container">
                    <div className="error-state">
                        <div className="error-icon">🔍</div>
                        <h2>Job Not Found</h2>
                        <p>The job you're looking for doesn't exist or has been removed.</p>
                        <button onClick={() => navigate('/jobs')} className="back-btn">
                            Browse Jobs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="job-details-page">
            <div className="container">
                {/* SmartHire Match Insights - Smart Feature */}
                {isAuthenticated && user?.role === 'job_seeker' && (
                    <div className="match-insights">
                        <div className="match-icon">⭐</div>
                        <div className="match-content">
                            <h4>SmartHire Match Insights</h4>
                            <p>Based on your profile, you are in the top 5% of applicants. Your experience aligns perfectly with this role.</p>
                        </div>
                    </div>
                )}

                {/* Job Header */}
                <div className="job-header">
                    <div className="company-logo-large">
                        {job.company_initials || job.company?.charAt(0) || 'C'}
                    </div>
                    <div className="job-title-section">
                        <h1 className="job-title">{job.title}</h1>
                        <Link to={`/companies/${company?.id || '#'}`} className="company-link">
                            {job.company} · {company?.is_verified && <span className="verified-badge">✓ Verified</span>}
                        </Link>
                        <div className="posted-date">
                            Posted {getRelativeDate(job.posted_date)}
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button 
                            className={`save-btn ${isSaved ? 'saved' : ''}`}
                            onClick={handleSaveJob}
                        >
                            <span className="material-symbols-outlined">
                                {isSaved ? 'favorite' : 'favorite_border'}
                            </span>
                            Save
                        </button>
                        <button className="share-btn" onClick={handleShare}>
                            <span className="material-symbols-outlined">share</span>
                            Share
                        </button>
                    </div>
                </div>

                {/* Apply Button - Prominent */}
                <div className="apply-section">
                    {user?.role === 'employer' && job.company === user?.company_name ? (
                        <div className="employer-note">
                            <span className="material-symbols-outlined">info</span>
                            You are viewing your own job posting
                        </div>
                    ) : (
                        <button 
                            className={`apply-btn ${hasApplied ? 'applied' : ''}`}
                            onClick={handleApply}
                            disabled={hasApplied || applying}
                        >
                            {applying ? (
                                <>
                                    <span className="spinner"></span>
                                    Applying...
                                </>
                            ) : hasApplied ? (
                                <>
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Already Applied
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">send</span>
                                    Apply Now
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Metadata Row */}
                <div className="metadata-grid">
                    <div className="metadata-item">
                        <span className="material-symbols-outlined">location_on</span>
                        <div>
                            <label>Location</label>
                            <p>{job.location || 'Remote'}</p>
                        </div>
                    </div>
                    <div className="metadata-item">
                        <span className="material-symbols-outlined">work</span>
                        <div>
                            <label>Job Type</label>
                            <p className={`job-type-badge ${getJobTypeClass(job.job_type)}`}>
                                {getJobTypeLabel(job.job_type)}
                            </p>
                        </div>
                    </div>
                    <div className="metadata-item">
                        <span className="material-symbols-outlined">attach_money</span>
                        <div>
                            <label>Salary Range</label>
                            <p>{formatSalary(job.salary_min, job.salary_max)}</p>
                        </div>
                    </div>
                    <div className="metadata-item">
                        <span className="material-symbols-outlined">trending_up</span>
                        <div>
                            <label>Experience Level</label>
                            <p>{job.experience || 'Mid Level'}</p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="details-layout">
                    {/* Left Column - Description and Requirements */}
                    <div className="details-main">
                        {/* The Role / Description */}
                        <section className="details-section">
                            <h2>The Role</h2>
                            <p>{job.description || 'We are looking for a talented professional to join our team. You will be responsible for delivering high-quality solutions and collaborating with cross-functional teams.'}</p>
                        </section>

                        {/* Key Responsibilities */}
                        <section className="details-section">
                            <h2>Key Responsibilities</h2>
                            <ul className="responsibilities-list">
                                <li>Lead the development of key features from conception to deployment</li>
                                <li>Collaborate with cross-functional teams to define and implement solutions</li>
                                <li>Mentor junior developers and conduct code reviews</li>
                                <li>Optimize application performance and ensure scalability</li>
                                <li>Stay updated with emerging technologies and industry trends</li>
                            </ul>
                        </section>

                        {/* Requirements */}
                        <section className="details-section">
                            <h2>Requirements</h2>
                            <div className="requirements-grid">
                                <div className="requirement-item">5+ years of experience</div>
                                <div className="requirement-item">Strong problem-solving skills</div>
                                <div className="requirement-item">Excellent communication</div>
                                <div className="requirement-item">Team player mentality</div>
                            </div>
                        </section>

                        {/* Perks & Benefits */}
                        <section className="details-section">
                            <h2>Perks & Benefits</h2>
                            <div className="benefits-grid">
                                <div className="benefit-item">
                                    <span className="material-symbols-outlined">sell</span>
                                    <div>
                                        <strong>Equity Package</strong>
                                        <p>Early stage stock options</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <span className="material-symbols-outlined">beach_access</span>
                                    <div>
                                        <strong>Unlimited PTO</strong>
                                        <p>Take the time you need</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <span className="material-symbols-outlined">home</span>
                                    <div>
                                        <strong>Home Office Stipend</strong>
                                        <p>$2,500 setup budget</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Job Overview & Company */}
                    <div className="details-sidebar">
                        {/* Job Overview */}
                        <div className="info-card">
                            <h3>Job Overview</h3>
                            <div className="info-row">
                                <span className="material-symbols-outlined">event</span>
                                <div>
                                    <label>Date Posted</label>
                                    <p>{getRelativeDate(job.posted_date)}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                <span className="material-symbols-outlined">work</span>
                                <div>
                                    <label>Job Type</label>
                                    <p>{getJobTypeLabel(job.job_type)}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                <span className="material-symbols-outlined">payments</span>
                                <div>
                                    <label>Salary Range</label>
                                    <p>{formatSalary(job.salary_min, job.salary_max)}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                <span className="material-symbols-outlined">calendar_today</span>
                                <div>
                                    <label>Deadline</label>
                                    <p>Oct 24, 2024</p>
                                </div>
                            </div>
                        </div>

                        {/* About the Company */}
                        <div className="info-card company-card">
                            <h3>About the Company</h3>
                            <div className="company-info">
                                <div className="company-logo-small">
                                    {job.company_initials || job.company?.charAt(0) || 'C'}
                                </div>
                                <div className="company-details">
                                    <h4>{job.company}</h4>
                                    <p>{company?.description || 'Leading technology company focused on innovation and excellence.'}</p>
                                    <Link to={`/companies/${company?.id || '#'}`} className="view-profile-link">
                                        View Profile →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Share & Print */}
                        <div className="info-card action-card">
                            <button className="share-link-btn" onClick={handleShare}>
                                <span className="material-symbols-outlined">ios_share</span>
                                Share
                            </button>
                            <button className="print-btn" onClick={() => window.print()}>
                                <span className="material-symbols-outlined">print</span>
                                Print
                            </button>
                        </div>
                    </div>
                </div>

                {/* Similar Opportunities Section */}
                {similarJobs.length > 0 && (
                    <section className="similar-jobs-section">
                        <h2>Similar Opportunities</h2>
                        <div className="similar-jobs-grid">
                            {similarJobs.map(similarJob => (
                                <JobCard key={similarJob.id} job={similarJob} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default JobDetailsPage;