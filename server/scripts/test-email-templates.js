require('dotenv').config();
const { sendTemplatedEmail } = require('../src/services/emailService');

const testEmails = async () => {
  const to = process.env.ADMIN_EMAIL;

  // Application confirmation
  await sendTemplatedEmail(to, 'application-confirmation', {
    user_name: 'Test Job Seeker',
    job_title: 'Frontend Developer',
    company_name: 'TechCorp',
    job_location: 'Remote',
    job_type: 'Full-time',
    salary_range: '$80k - $110k',
    dashboard_url: 'https://example.com/dashboard',
  }, 'Test: Application Confirmation');

  // Status change
  await sendTemplatedEmail(to, 'status-change', {
    user_name: 'Test Job Seeker',
    job_title: 'Backend Engineer',
    company_name: 'DataSys',
    new_status: 'SHORTLISTED',
    status_color: '#8b5cf6',
    status_message: 'Congratulations! You have been shortlisted.',
    dashboard_url: 'https://example.com/dashboard',
  }, 'Test: Status Update');

  // New job alert
  await sendTemplatedEmail(to, 'new-job-alert', {
    user_name: 'Test Job Seeker',
    saved_search_name: 'React Developer',
    job_title: 'Senior React Developer',
    company_name: 'Innovate Inc',
    job_location: 'San Francisco, CA',
    job_type: 'Remote',
    salary_range: '$120k - $160k',
    job_summary: 'Exciting opportunity to build modern web apps...',
    job_url: 'https://example.com/jobs/123',
    manage_alerts_url: 'https://example.com/alerts',
  }, 'Test: New Job Alert');

  // New applicant notification
  await sendTemplatedEmail(to, 'new-applicant', {
    company_name: 'TechCorp',
    job_title: 'Frontend Developer',
    applicant_name: 'Jane Applicant',
    applicant_email: 'jane@example.com',
    applied_date: new Date().toLocaleDateString(),
    cover_letter_preview: 'I am very interested in this role...',
    applicants_url: 'https://example.com/employer/applicants',
  }, 'Test: New Applicant');

  // Account verification
  await sendTemplatedEmail(to, 'account-verification', {
    user_name: 'Test User',
    verification_url: 'https://example.com/verify?token=123456',
  }, 'Test: Verify Your Email');

  console.log('All test emails sent.');
};

testEmails().catch(console.error);