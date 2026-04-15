import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './EmployerDashboard.css';

// Mock data generators
const generateMockJobs = (companyId) => {
  const saved = localStorage.getItem(`mock_employer_jobs_${companyId}`);
  if (saved) return JSON.parse(saved);
  return [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      description: 'Build responsive web applications using React and modern frontend technologies.',
      requirements: '5+ years React, TypeScript, CSS-in-JS',
      responsibilities: 'Lead frontend architecture, mentor juniors',
      salary_min: 120000,
      salary_max: 160000,
      location: 'San Francisco, CA',
      job_type: 'full-time',
      experience_level: 'senior',
      is_active: true,
      created_at: '2025-04-01T10:00:00Z',
      applications_count: 12,
    },
    {
      id: 2,
      title: 'Backend Engineer',
      description: 'Design and maintain scalable backend services.',
      requirements: '3+ years Node.js, PostgreSQL, AWS',
      responsibilities: 'API development, database optimization',
      salary_min: 110000,
      salary_max: 150000,
      location: 'Remote',
      job_type: 'remote',
      experience_level: 'mid',
      is_active: true,
      created_at: '2025-04-05T14:30:00Z',
      applications_count: 8,
    },
  ];
};

const generateMockApplicants = (companyId) => {
  const saved = localStorage.getItem(`mock_employer_applicants_${companyId}`);
  if (saved) return JSON.parse(saved);
  return [
    {
      id: 101,
      job_id: 1,
      job_title: 'Senior Frontend Developer',
      candidate_name: 'Lydia Thorne',
      candidate_email: 'lydia@example.com',
      status: 'reviewed',
      match_score: 94,
      applied_at: '2025-04-10T09:00:00Z',
      skills: ['React', 'TypeScript', 'CSS'],
    },
    {
      id: 102,
      job_id: 2,
      job_title: 'Backend Engineer',
      candidate_name: 'Alex Rivera',
      candidate_email: 'alex@example.com',
      status: 'pending',
      match_score: 91,
      applied_at: '2025-04-11T11:30:00Z',
      skills: ['Node.js', 'Go', 'Rust'],
    },
    {
      id: 103,
      job_id: 1,
      job_title: 'Senior Frontend Developer',
      candidate_name: 'Sasha Volkov',
      candidate_email: 'sasha@example.com',
      status: 'interviewing',
      match_score: 88,
      applied_at: '2025-04-09T14:00:00Z',
      skills: ['React', 'Motion', 'System Design'],
    },
  ];
};

const EmployerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [postingJob, setPostingJob] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Post job form state (multi-step)
  const [postStep, setPostStep] = useState(1);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_min: '',
    salary_max: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'mid',
  });

  // Edit job form state
  const [editJobData, setEditJobData] = useState(null);

  // Read query param on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'post-job') {
      setActiveTab('post-job');
      setPostingJob(true);
    } else if (tab === 'my-jobs') {
      setActiveTab('my-jobs');
    } else if (tab === 'applicants') {
      setActiveTab('applicants');
    } else if (tab === 'overview') {
      setActiveTab('overview');
    }
  }, [location.search]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      setTimeout(() => {
        const companyId = user?.company_id || 1;
        const mockJobs = generateMockJobs(companyId);
        const mockApplicants = generateMockApplicants(companyId);
        setJobs(mockJobs);
        setApplicants(mockApplicants);
        setLoading(false);
      }, 500);
    };
    loadData();
  }, [user?.company_id]);

  // Save jobs to localStorage when changed
  useEffect(() => {
    if (user?.company_id && jobs.length) {
      localStorage.setItem(`mock_employer_jobs_${user.company_id}`, JSON.stringify(jobs));
    }
  }, [jobs, user?.company_id]);

  // Save applicants to localStorage when changed
  useEffect(() => {
    if (user?.company_id && applicants.length) {
      localStorage.setItem(`mock_employer_applicants_${user.company_id}`, JSON.stringify(applicants));
    }
  }, [applicants, user?.company_id]);

  // Stats
  const stats = {
    totalApplicants: applicants.length,
    activeJobs: jobs.filter(j => j.is_active).length,
    interviewsScheduled: applicants.filter(a => a.status === 'interviewing').length,
    pendingOffers: applicants.filter(a => a.status === 'offered').length,
  };

  // Filter applicants by selected job
  const filteredApplicants = selectedJobId
    ? applicants.filter(a => a.job_id === selectedJobId)
    : applicants;

  // Post job handlers
  const handlePostJobChange = (field, value) => {
    setNewJob(prev => ({ ...prev, [field]: value }));
  };

  const handlePostJobNext = () => {
    if (postStep === 1 && (!newJob.title || !newJob.location)) {
      toast.error('Please fill in title and location');
      return;
    }
    if (postStep === 2 && (!newJob.description || !newJob.requirements)) {
      toast.error('Please fill in description and requirements');
      return;
    }
    if (postStep === 3) {
      // Submit
      const jobToAdd = {
        id: Date.now(),
        ...newJob,
        salary_min: parseInt(newJob.salary_min) || 0,
        salary_max: parseInt(newJob.salary_max) || 0,
        is_active: true,
        created_at: new Date().toISOString(),
        applications_count: 0,
      };
      setJobs(prev => [jobToAdd, ...prev]);
      toast.success('Job posted successfully');
      setPostingJob(false);
      setPostStep(1);
      setNewJob({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        salary_min: '',
        salary_max: '',
        location: '',
        job_type: 'full-time',
        experience_level: 'mid',
      });
      setActiveTab('my-jobs');
      navigate('?tab=my-jobs', { replace: true });
    } else {
      setPostStep(postStep + 1);
    }
  };

  const handlePostJobPrev = () => {
    setPostStep(postStep - 1);
  };

  // Edit job
  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditJobData({ ...job });
  };

  const handleUpdateJob = () => {
    setJobs(prev => prev.map(j => j.id === editJobData.id ? editJobData : j));
    toast.success('Job updated successfully');
    setEditingJob(null);
    setEditJobData(null);
  };

  // Delete job
  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      setDeletingId(jobId);
      setTimeout(() => {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        // Also remove applicants for this job
        setApplicants(prev => prev.filter(a => a.job_id !== jobId));
        toast.success('Job deleted');
        setDeletingId(null);
      }, 500);
    }
  };

  // Close job (set inactive)
  const handleCloseJob = (jobId) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_active: false } : j));
    toast.success('Job closed');
  };

  // Update application status
  const handleUpdateStatus = (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    setTimeout(() => {
      setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a));
      toast.success(`Application ${newStatus}`);
      setUpdatingStatus(null);
    }, 500);
  };

  // Tab change handler (updates URL)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'post-job') {
      setPostingJob(true);
      navigate('?tab=post-job', { replace: true });
    } else if (tab === 'my-jobs') {
      navigate('?tab=my-jobs', { replace: true });
    } else if (tab === 'applicants') {
      navigate('?tab=applicants', { replace: true });
    } else {
      navigate('?', { replace: true });
    }
  };

  if (loading) {
    return <div className="employer-dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="employer-dashboard">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="company-info">
            <div className="company-avatar">
              <span className="material-symbols-outlined">business</span>
            </div>
            <h3>{user?.company_name || 'Your Company'}</h3>
            <p>{user?.email}</p>
          </div>
          <nav className="sidebar-nav">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleTabChange('overview')}>
              <span className="material-symbols-outlined">dashboard</span>
              Overview
            </button>
            <button className={activeTab === 'post-job' ? 'active' : ''} onClick={() => handleTabChange('post-job')}>
              <span className="material-symbols-outlined">post_add</span>
              Post a Job
            </button>
            <button className={activeTab === 'my-jobs' ? 'active' : ''} onClick={() => handleTabChange('my-jobs')}>
              <span className="material-symbols-outlined">work</span>
              My Jobs
            </button>
            <button className={activeTab === 'applicants' ? 'active' : ''} onClick={() => handleTabChange('applicants')}>
              <span className="material-symbols-outlined">people</span>
              Applicants
            </button>
          </nav>
          <div className="sidebar-footer">
            <button className="help-btn" onClick={() => toast.info('Help & Support coming soon')}>
              <span className="material-symbols-outlined">help</span>
              Help
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="welcome-header">
                <h1>Welcome back, {user?.name?.split(' ')[0] || 'Employer'}!</h1>
                <p>Here's what's happening with your hiring pipeline today.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.totalApplicants}</span>
                  <span className="stat-label">Total Applicants</span>
                  <span className="stat-change positive">+2 this week</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.activeJobs}</span>
                  <span className="stat-label">Active Jobs</span>
                  <span className="stat-change positive">+4 today</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.interviewsScheduled}</span>
                  <span className="stat-label">Interviews Scheduled</span>
                  <span className="stat-change">85% acceptance</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.pendingOffers}</span>
                  <span className="stat-label">Pending Offers</span>
                  <span className="stat-change">05</span>
                </div>
              </div>

              <div className="hiring-performance">
                <h2>Hiring Performance</h2>
                <div className="chart-container">
                  <div className="chart-labels">
                    <span>Job views vs. applications (Last 30 days)</span>
                  </div>
                  <div className="bar-chart">
                    <div className="bar-item">
                      <div className="bar-label">Mon</div>
                      <div className="bar views" style={{ height: '60px' }}></div>
                      <div className="bar applications" style={{ height: '40px' }}></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Tue</div>
                      <div className="bar views" style={{ height: '75px' }}></div>
                      <div className="bar applications" style={{ height: '55px' }}></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Wed</div>
                      <div className="bar views" style={{ height: '50px' }}></div>
                      <div className="bar applications" style={{ height: '35px' }}></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Thu</div>
                      <div className="bar views" style={{ height: '80px' }}></div>
                      <div className="bar applications" style={{ height: '65px' }}></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Fri</div>
                      <div className="bar views" style={{ height: '70px' }}></div>
                      <div className="bar applications" style={{ height: '50px' }}></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Sat</div>
                      <div className="bar views" style={{ height: '30px' }}></div>
                      <div className="bar applications" style={{ height: '20px' }}></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Sun</div>
                      <div className="bar views" style={{ height: '25px' }}></div>
                      <div className="bar applications" style={{ height: '15px' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ai-matches">
                <div className="section-header">
                  <h2>AI High-Score Matches</h2>
                  <button className="view-all">View All Matches</button>
                </div>
                <div className="matches-grid">
                  {applicants.slice(0, 3).map(applicant => (
                    <div key={applicant.id} className="match-card">
                      <div className="match-header">
                        <h4>{applicant.candidate_name}</h4>
                        <span className="match-score">{applicant.match_score}%</span>
                      </div>
                      <p>{applicant.job_title}</p>
                      <div className="match-skills">
                        {applicant.skills?.slice(0, 2).map(skill => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <div className="activity-details">
                      <strong>Marcus Chen</strong>
                      <p>Moved to Final Interview by HR Team</p>
                      <span className="time">2h ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="activity-details">
                      <strong>Elena Rodriguez</strong>
                      <p>Applied for Senior Product Designer</p>
                      <span className="time">5h ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div className="activity-details">
                      <strong>Jordan Smith</strong>
                      <p>Offer Accepted for Frontend Engineer</p>
                      <span className="time">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recruiter-tip">
                <div className="tip-icon">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div className="tip-content">
                  <h4>Recruiter Tip</h4>
                  <p>Candidate responses are 45% faster on Tuesday afternoons. Consider scheduling your interview invites today for optimal engagement.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'post-job' && postingJob && (
            <div className="post-job-tab">
              <h2>Post a New Job</h2>
              <div className="multi-step-form">
                <div className="step-indicator">
                  <div className={`step ${postStep >= 1 ? 'active' : ''}`}>1. Basic Info</div>
                  <div className={`step ${postStep >= 2 ? 'active' : ''}`}>2. Details</div>
                  <div className={`step ${postStep >= 3 ? 'active' : ''}`}>3. Review</div>
                </div>

                {postStep === 1 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label>Job Title *</label>
                      <input type="text" value={newJob.title} onChange={(e) => handlePostJobChange('title', e.target.value)} placeholder="e.g., Senior Frontend Developer" />
                    </div>
                    <div className="form-group">
                      <label>Location *</label>
                      <input type="text" value={newJob.location} onChange={(e) => handlePostJobChange('location', e.target.value)} placeholder="e.g., San Francisco, CA or Remote" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Salary Min</label>
                        <input type="number" value={newJob.salary_min} onChange={(e) => handlePostJobChange('salary_min', e.target.value)} placeholder="e.g., 80000" />
                      </div>
                      <div className="form-group">
                        <label>Salary Max</label>
                        <input type="number" value={newJob.salary_max} onChange={(e) => handlePostJobChange('salary_max', e.target.value)} placeholder="e.g., 120000" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Job Type</label>
                        <select value={newJob.job_type} onChange={(e) => handlePostJobChange('job_type', e.target.value)}>
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="remote">Remote</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Experience Level</label>
                        <select value={newJob.experience_level} onChange={(e) => handlePostJobChange('experience_level', e.target.value)}>
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid Level</option>
                          <option value="senior">Senior Level</option>
                          <option value="lead">Lead</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {postStep === 2 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label>Job Description *</label>
                      <textarea rows="4" value={newJob.description} onChange={(e) => handlePostJobChange('description', e.target.value)} placeholder="Describe the role and responsibilities..."></textarea>
                    </div>
                    <div className="form-group">
                      <label>Requirements *</label>
                      <textarea rows="4" value={newJob.requirements} onChange={(e) => handlePostJobChange('requirements', e.target.value)} placeholder="List required skills, experience, education..."></textarea>
                    </div>
                    <div className="form-group">
                      <label>Responsibilities (Optional)</label>
                      <textarea rows="3" value={newJob.responsibilities} onChange={(e) => handlePostJobChange('responsibilities', e.target.value)} placeholder="Key responsibilities..."></textarea>
                    </div>
                  </div>
                )}

                {postStep === 3 && (
                  <div className="form-step review-step">
                    <h3>Review Your Job Post</h3>
                    <div className="review-card">
                      <p><strong>Title:</strong> {newJob.title}</p>
                      <p><strong>Location:</strong> {newJob.location}</p>
                      <p><strong>Salary:</strong> {newJob.salary_min} - {newJob.salary_max}</p>
                      <p><strong>Type:</strong> {newJob.job_type}</p>
                      <p><strong>Experience:</strong> {newJob.experience_level}</p>
                      <p><strong>Description:</strong> {newJob.description}</p>
                      <p><strong>Requirements:</strong> {newJob.requirements}</p>
                      <p><strong>Responsibilities:</strong> {newJob.responsibilities || 'Not specified'}</p>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  {postStep > 1 && <button onClick={handlePostJobPrev}>Previous</button>}
                  <button onClick={handlePostJobNext}>{postStep === 3 ? 'Post Job' : 'Next'}</button>
                  <button onClick={() => { setPostingJob(false); setActiveTab('overview'); navigate('?', { replace: true }); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-jobs' && (
            <div className="my-jobs-tab">
              <h2>My Jobs</h2>
              {jobs.length === 0 ? (
                <p>No jobs posted yet. Click "Post a Job" to create your first listing.</p>
              ) : (
                <div className="jobs-list">
                  {jobs.map(job => (
                    <div key={job.id} className="job-card">
                      <div className="job-header">
                        <h3>{job.title}</h3>
                        <span className={`status-badge ${job.is_active ? 'active' : 'closed'}`}>
                          {job.is_active ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      <p className="job-location">{job.location}</p>
                      <p className="job-salary">${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</p>
                      <p className="job-applicants">{job.applications_count || 0} applicants</p>
                      <div className="job-actions">
                        <button onClick={() => handleEditJob(job)}>Edit</button>
                        {job.is_active && <button onClick={() => handleCloseJob(job.id)}>Close</button>}
                        <button className="delete" onClick={() => handleDeleteJob(job.id)} disabled={deletingId === job.id}>
                          {deletingId === job.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applicants' && (
            <div className="applicants-tab">
              <h2>Applicants</h2>
              <div className="filter-bar">
                <label>Filter by Job:</label>
                <select value={selectedJobId || ''} onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              {filteredApplicants.length === 0 ? (
                <p>No applicants for the selected job.</p>
              ) : (
                <div className="applicants-list">
                  {filteredApplicants.map(applicant => (
                    <div key={applicant.id} className="applicant-card">
                      <div className="applicant-info">
                        <h4>{applicant.candidate_name}</h4>
                        <p>{applicant.job_title}</p>
                        <p>Applied: {new Date(applicant.applied_at).toLocaleDateString()}</p>
                        <span className={`status-badge status-${applicant.status}`}>{applicant.status}</span>
                      </div>
                      <div className="applicant-actions">
                        <button onClick={() => handleUpdateStatus(applicant.id, 'reviewed')} disabled={updatingStatus === applicant.id}>Review</button>
                        <button onClick={() => handleUpdateStatus(applicant.id, 'shortlisted')} disabled={updatingStatus === applicant.id}>Shortlist</button>
                        <button onClick={() => handleUpdateStatus(applicant.id, 'rejected')} disabled={updatingStatus === applicant.id}>Reject</button>
                        <button onClick={() => handleUpdateStatus(applicant.id, 'hired')} disabled={updatingStatus === applicant.id}>Hire</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Job Modal */}
          {editingJob && (
            <div className="modal-overlay" onClick={() => setEditingJob(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Job</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={editJobData.title} onChange={(e) => setEditJobData({ ...editJobData, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" value={editJobData.location} onChange={(e) => setEditJobData({ ...editJobData, location: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Salary Min</label>
                    <input type="number" value={editJobData.salary_min} onChange={(e) => setEditJobData({ ...editJobData, salary_min: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>Salary Max</label>
                    <input type="number" value={editJobData.salary_max} onChange={(e) => setEditJobData({ ...editJobData, salary_max: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={editJobData.description} onChange={(e) => setEditJobData({ ...editJobData, description: e.target.value })} rows="4" />
                </div>
                <div className="form-group">
                  <label>Requirements</label>
                  <textarea value={editJobData.requirements} onChange={(e) => setEditJobData({ ...editJobData, requirements: e.target.value })} rows="4" />
                </div>
                <div className="modal-actions">
                  <button onClick={handleUpdateJob}>Save</button>
                  <button onClick={() => setEditingJob(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployerDashboard;