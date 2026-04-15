import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';
import JobCard from '../../components/jobs/JobCard/JobCard';
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

    // Load saved jobs from localStorage (same key used in dashboard)
    useEffect(() => {
        if (isAuthenticated && user) {
            const savedKey = `saved_jobs_${user.id}`;
            const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
            setIsSaved(saved.includes(parseInt(id)));
        }
    }, [id, isAuthenticated, user]);

    // Check if already applied
    useEffect(() => {
        if (isAuthenticated && user) {
            const appliedKey = `applied_${user.id}`;
            const applied = JSON.parse(localStorage.getItem(appliedKey) || '[]');
            setHasApplied(applied.includes(parseInt(id)));
        }
    }, [id, isAuthenticated, user]);

    // Fetch job details
    useEffect(() => {
        const fetchJobDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await jobAPI.getJobById(id);
                const jobData = response.data.data;
                setJob(jobData);
                // Fetch company details if needed (mock for now)
                setCompany({ name: jobData.company_name, is_verified: true, description: 'Leading company' });
                // Fetch similar jobs
                const similarRes = await jobAPI.getJobs({ similar: true, jobId: id });
                setSimilarJobs(similarRes.data.data.slice(0, 3));
            } catch (err) {
                if (err.response?.status === 404) setError('Job not found');
                else setError('Failed to load job details');
                toast.error(error || 'Failed to load job');
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id]);

    const getRelativeDate = (date) => {
        if (!date) return 'Recently';
        const posted = new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today - posted);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const formatSalary = (min, max) => `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;

    const handleApply = async () => {
        if (!isAuthenticated) {
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
            await applicationAPI.applyForJob(job.id, { cover_letter: '' });
            toast.success('Application submitted successfully!');
            setHasApplied(true);
            // Update local applied list
            const appliedKey = `applied_${user.id}`;
            const applied = JSON.parse(localStorage.getItem(appliedKey) || '[]');
            if (!applied.includes(job.id)) {
                applied.push(job.id);
                localStorage.setItem(appliedKey, JSON.stringify(applied));
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 409) {
                toast.error('You have already applied to this job');
                setHasApplied(true);
            } else {
                toast.error(error.response?.data?.message || 'Failed to apply');
            }
        } finally {
            setApplying(false);
        }
    };

    const handleSaveJob = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const savedKey = `saved_jobs_${user.id}`;
        const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
        if (isSaved) {
            const newSaved = saved.filter(jobId => jobId !== job.id);
            localStorage.setItem(savedKey, JSON.stringify(newSaved));
            setIsSaved(false);
            toast.success('Job removed from saved');
        } else {
            saved.push(job.id);
            localStorage.setItem(savedKey, JSON.stringify(saved));
            setIsSaved(true);
            toast.success('Job saved');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const getJobTypeLabel = (type) => {
        const map = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'remote': 'Remote', 'contract': 'Contract', 'internship': 'Internship' };
        return map[type] || type;
    };

    const getJobTypeClass = (type) => {
        const map = { 'full-time': 'badge-full-time', 'part-time': 'badge-part-time', 'remote': 'badge-remote', 'contract': 'badge-contract', 'internship': 'badge-internship' };
        return map[type] || '';
    };

    if (loading) return <div className="loading-skeleton">Loading...</div>;
    if (error || !job) return (
        <div className="error-state">
            <h2>Job Not Found</h2>
            <button onClick={() => navigate('/jobs')}>Browse Jobs</button>
        </div>
    );

    return (
        <div className="job-details-page">
            <div className="container">
                {isAuthenticated && user?.role === 'job_seeker' && (
                    <div className="match-insights">
                        <div className="match-icon">⭐</div>
                        <div className="match-content">
                            <h4>SmartHire Match Insights</h4>
                            <p>Based on your profile, you are a strong match for this role.</p>
                        </div>
                    </div>
                )}

                <div className="job-header">
                    <div className="company-logo-large">{job.company_name?.charAt(0) || 'C'}</div>
                    <div className="job-title-section">
                        <h1>{job.title}</h1>
                        <Link to={`/companies/${job.company_id || '#'}`} className="company-link">
                            {job.company_name} {company?.is_verified && <span className="verified-badge">✓ Verified</span>}
                        </Link>
                        <div className="posted-date">Posted {getRelativeDate(job.posted_date)}</div>
                    </div>
                    <div className="action-buttons">
                        <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={handleSaveJob}>
                            <span className="material-symbols-outlined">{isSaved ? 'favorite' : 'favorite_border'}</span> Save
                        </button>
                        <button className="share-btn" onClick={handleShare}>
                            <span className="material-symbols-outlined">share</span> Share
                        </button>
                    </div>
                </div>

                <div className="apply-section">
                    {user?.role === 'employer' && job.company_name === user?.company_name ? (
                        <div className="employer-note"><span className="material-symbols-outlined">info</span> You are viewing your own job posting</div>
                    ) : (
                        <button className={`apply-btn ${hasApplied ? 'applied' : ''}`} onClick={handleApply} disabled={hasApplied || applying}>
                            {applying ? (<> <span className="spinner"></span> Applying...</>) : hasApplied ? (<> <span className="material-symbols-outlined">check_circle</span> Already Applied</>) : (<> <span className="material-symbols-outlined">send</span> Apply Now</>)}
                        </button>
                    )}
                </div>

                <div className="metadata-grid">
                    <div className="metadata-item"><span className="material-symbols-outlined">location_on</span><div><label>Location</label><p>{job.location || 'Remote'}</p></div></div>
                    <div className="metadata-item"><span className="material-symbols-outlined">work</span><div><label>Job Type</label><p className={`job-type-badge ${getJobTypeClass(job.job_type)}`}>{getJobTypeLabel(job.job_type)}</p></div></div>
                    <div className="metadata-item"><span className="material-symbols-outlined">attach_money</span><div><label>Salary Range</label><p>{formatSalary(job.salary_min, job.salary_max)}</p></div></div>
                    <div className="metadata-item"><span className="material-symbols-outlined">trending_up</span><div><label>Experience Level</label><p>{job.experience_level || 'Mid Level'}</p></div></div>
                </div>

                <div className="details-layout">
                    <div className="details-main">
                        <section className="details-section"><h2>The Role</h2><p>{job.description || 'We are looking for a talented professional to join our team.'}</p></section>
                        <section className="details-section"><h2>Key Responsibilities</h2><ul className="responsibilities-list"><li>Lead feature development</li><li>Collaborate with teams</li><li>Mentor juniors</li><li>Optimize performance</li></ul></section>
                        <section className="details-section"><h2>Requirements</h2><div className="requirements-grid"><div className="requirement-item">Experience in relevant tech stack</div><div className="requirement-item">Strong problem-solving skills</div></div></section>
                        <section className="details-section"><h2>Perks & Benefits</h2><div className="benefits-grid"><div className="benefit-item"><span className="material-symbols-outlined">sell</span><div><strong>Equity Package</strong><p>Stock options</p></div></div></div></section>
                    </div>
                    <div className="details-sidebar">
                        <div className="info-card"><h3>Job Overview</h3><div className="info-row"><span className="material-symbols-outlined">event</span><div><label>Date Posted</label><p>{getRelativeDate(job.posted_date)}</p></div></div><div className="info-row"><span className="material-symbols-outlined">payments</span><div><label>Salary</label><p>{formatSalary(job.salary_min, job.salary_max)}</p></div></div></div>
                        <div className="info-card company-card"><h3>About the Company</h3><div className="company-info"><div className="company-logo-small">{job.company_name?.charAt(0)}</div><div className="company-details"><h4>{job.company_name}</h4><p>{company?.description || 'Innovative company'}</p><Link to={`/companies/${job.company_id || '#'}`} className="view-profile-link">View Profile →</Link></div></div></div>
                        <div className="info-card action-card"><button className="share-link-btn" onClick={handleShare}><span className="material-symbols-outlined">ios_share</span> Share</button><button className="print-btn" onClick={() => window.print()}><span className="material-symbols-outlined">print</span> Print</button></div>
                    </div>
                </div>

                {similarJobs.length > 0 && (
                    <section className="similar-jobs-section"><h2>Similar Opportunities</h2><div className="similar-jobs-grid">{similarJobs.map(j => <JobCard key={j.id} job={j} />)}</div></section>
                )}
            </div>
        </div>
    );
};

export default JobDetailsPage;