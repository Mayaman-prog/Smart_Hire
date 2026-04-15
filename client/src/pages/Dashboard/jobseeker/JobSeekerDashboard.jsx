import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './JobSeekerDashboard.css';

const JobSeekerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [removingSaved, setRemovingSaved] = useState(null);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Load applications from localStorage (mock)
  useEffect(() => {
    if (user?.id) {
      const appliedKey = `applied_${user.id}`;
      const appliedJobIds = JSON.parse(localStorage.getItem(appliedKey) || '[]');
      // For demo, convert IDs to mock application objects
      const mockApps = appliedJobIds.map((jobId, idx) => ({
        id: idx + 100,
        job_id: jobId,
        job_title: `Job ${jobId}`,
        company_name: 'Sample Company',
        status: 'pending',
        applied_at: new Date().toISOString(),
      }));
      setApplications(mockApps);
    }
  }, [user?.id]);

  // Load saved jobs from localStorage (same key as used in JobDetailsPage)
  useEffect(() => {
    const loadSavedJobs = () => {
      if (user?.id) {
        const savedKey = `saved_jobs_${user.id}`;
        const savedJobIds = JSON.parse(localStorage.getItem(savedKey) || '[]');
        // In a real app, you'd fetch full job details from API. For demo, create mock jobs.
        const mockSavedJobs = savedJobIds.map(id => ({
          id,
          title: `Job ${id}`,
          company_name: 'Company Name',
          location: 'Remote',
          salary_min: 80000,
          salary_max: 120000,
          job_type: 'full-time',
        }));
        setSavedJobs(mockSavedJobs);
      }
    };
    loadSavedJobs();
  }, [user?.id]);

  // Save applications when changed (optional)
  useEffect(() => {
    if (user?.id && applications.length) {
      // In real app, you'd sync with backend; for mock, we can store applied IDs again
      const appliedIds = applications.map(a => a.job_id);
      localStorage.setItem(`applied_${user.id}`, JSON.stringify(appliedIds));
    }
  }, [applications, user?.id]);

  // Save saved jobs when changed
  useEffect(() => {
    if (user?.id && savedJobs.length) {
      const savedIds = savedJobs.map(j => j.id);
      localStorage.setItem(`saved_jobs_${user.id}`, JSON.stringify(savedIds));
    }
  }, [savedJobs, user?.id]);

  const stats = {
    profileStrength: 85,
    applied: applications.length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offers: applications.filter(a => a.status === 'offered').length,
  };

  const handleWithdraw = (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      setWithdrawing(applicationId);
      setTimeout(() => {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        toast.success('Application withdrawn');
        setWithdrawing(null);
      }, 500);
    }
  };

  const handleRemoveSaved = (jobId) => {
    setRemovingSaved(jobId);
    setTimeout(() => {
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job removed from saved');
      setRemovingSaved(null);
    }, 500);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setUpdatingProfile(true);
    setTimeout(() => {
      const updatedUser = { ...user, name: profile.name, email: profile.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setUpdatingProfile(false);
    }, 800);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.success(`Resume "${file.name}" uploaded successfully`);
  };

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;

  return (
    <div className="seeker-dashboard">
      <div className="dashboard-container">
        {/* Sidebar - unchanged */}
        <aside className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
          <nav className="sidebar-nav">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><span className="material-symbols-outlined">dashboard</span> Overview</button>
            <button className={activeTab === 'applied' ? 'active' : ''} onClick={() => setActiveTab('applied')}><span className="material-symbols-outlined">assignment</span> Applied Jobs</button>
            <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}><span className="material-symbols-outlined">bookmarks</span> Saved Jobs</button>
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}><span className="material-symbols-outlined">person</span> Profile</button>
          </nav>
          <div className="sidebar-footer">
            <button className="help-btn" onClick={() => toast.info('Help & Support coming soon')}><span className="material-symbols-outlined">help</span> Help</button>
            <button className="logout-btn" onClick={logout}><span className="material-symbols-outlined">logout</span> Logout</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="welcome-header"><h1>Welcome back, {user?.name?.split(' ')[0]}!</h1><p>Your profile is outperforming {stats.profileStrength}% of other applicants in your field. 3 new companies viewed your resume today.</p></div>
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-value">{stats.profileStrength}%</span><span className="stat-label">Profile Strength</span></div>
                <div className="stat-card"><span className="stat-value">{stats.applied}</span><span className="stat-label">Applied</span></div>
                <div className="stat-card"><span className="stat-value">{stats.interviewing}</span><span className="stat-label">Interviewing</span></div>
                <div className="stat-card"><span className="stat-value">{stats.offers}</span><span className="stat-label">Offers</span></div>
              </div>
              <div className="recommended-section"><div className="section-header"><h2>Recommended for You</h2><span className="ai-badge">AI-MATCHED</span><button className="view-all">View all roles</button></div>
              <div className="recommended-jobs"><div className="job-card"><h4>Senior UX Designer</h4><p>Stripe · San Francisco, CA · Remote</p><p>$160k - $210k</p><button>Apply Now</button><span className="match-score">98% Match Score</span></div>
              <div className="job-card"><h4>Lead Product Architect</h4><p>Linear · New York, NY · On-site</p><p>$185k - $240k</p><button>Apply Now</button><span className="match-score">92% Match Score</span></div>
              <div className="job-card"><h4>Visual Systems Designer</h4><p>Spotify · London, UK · Hybrid</p><p>£90k - £120k</p><button>Apply Now</button><span className="match-score">89% Match Score</span></div></div></div>
              <div className="activity-section"><h2>Recent Activity</h2><div className="activity-list"><div className="activity-item"><span className="material-symbols-outlined">event</span><div><strong>New Interview Invitation</strong><p>Stripe has invited you for a "Senior UX Designer" cultural fit interview on Monday, Oct 24th at 2:00 PM PST.</p><div className="activity-actions"><button>Confirm Attendance</button><button>Reschedule</button></div></div><span className="time">2 Hours Ago</span></div>
              <div className="activity-item"><span className="material-symbols-outlined">assignment_turned_in</span><div><strong>Application Status Updated</strong><p>Your application for Airbnb has moved to the "Technical Review" stage.</p></div><span className="time">Yesterday</span></div>
              <div className="activity-item"><span className="material-symbols-outlined">visibility</span><div><strong>Profile Viewed</strong><p>A recruiter from Meta viewed your profile and downloaded your resume.</p></div><span className="time">Oct 20, 2023</span></div></div></div>
            </div>
          )}

          {activeTab === 'applied' && (
            <div className="applied-tab"><h2>Applied Jobs</h2>
              {applications.length === 0 ? <p>You haven't applied to any jobs yet.</p> : (
                <div className="applications-list">{applications.map(app => (
                  <div key={app.id} className="application-card"><div className="app-info"><h3>{app.job_title}</h3><p>{app.company_name}</p><span className={`status-badge status-${app.status}`}>{app.status}</span><p>Applied: {new Date(app.applied_at).toLocaleDateString()}</p></div>{app.status === 'pending' && <button className="withdraw-btn" onClick={() => handleWithdraw(app.id)} disabled={withdrawing === app.id}>{withdrawing === app.id ? 'Withdrawing...' : 'Withdraw'}</button>}</div>
                ))}</div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="saved-tab"><h2>Saved Jobs</h2>
              {savedJobs.length === 0 ? <p>No saved jobs. Browse jobs and click the heart icon to save them.</p> : (
                <div className="saved-jobs-grid">{savedJobs.map(job => (
                  <div key={job.id} className="saved-job-card"><h3>{job.title}</h3><p>{job.company_name}</p><p>{job.location}</p><div className="job-actions"><button className="apply-btn" onClick={() => window.location.href = `/jobs/${job.id}`}>Apply Now</button><button className="remove-btn" onClick={() => handleRemoveSaved(job.id)} disabled={removingSaved === job.id}>{removingSaved === job.id ? 'Removing...' : 'Remove'}</button></div></div>
                ))}</div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-tab"><h2>Edit Profile</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group"><label>Full Name</label><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></div>
                <div className="form-group"><label>Email</label><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required /></div>
                <div className="form-group"><label>Current Password (required to change password)</label><input type="password" value={profile.currentPassword} onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })} /></div>
                <div className="form-group"><label>New Password</label><input type="password" value={profile.newPassword} onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })} /></div>
                <div className="form-group"><label>Confirm New Password</label><input type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} /></div>
                <div className="form-group"><label>Resume (PDF, DOC)</label><input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} /></div>
                <button type="submit" disabled={updatingProfile}>{updatingProfile ? 'Updating...' : 'Update Profile'}</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;