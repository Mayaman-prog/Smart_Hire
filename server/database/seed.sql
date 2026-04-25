-- Smart Hire Seed Data - Complete Version

USE smart_hire;

-- 1. INSERT COMPANIES (3 companies)
INSERT INTO companies (name, description, website, location, email, is_verified) VALUES
('TechCorp Solutions', 'Leading software development company specializing in web and mobile applications', 'https://techcorp.com', 'San Francisco, CA', 'hr@techcorp.com', TRUE),
('DataWorks Inc', 'Big data analytics and AI solutions provider', 'https://dataworks.com', 'New York, NY', 'careers@dataworks.com', TRUE),
('CreativeStudio', 'Digital design and branding agency', 'https://creativestudio.com', 'London, UK', 'jobs@creativestudio.com', FALSE);

-- 2. INSERT JOB CATEGORIES
INSERT INTO job_categories (name, slug, description) VALUES
('Software Development', 'software-development', 'Software development and engineering roles'),
('Data Science', 'data-science', 'Data analysis and machine learning roles'),
('Design', 'design', 'UI/UX and graphic design roles'),
('Marketing', 'marketing', 'Digital marketing and branding roles'),
('Sales', 'sales', 'Sales and business development roles'),
('Customer Service', 'customer-service', 'Customer support and service roles'),
('Human Resources', 'human-resources', 'HR and recruitment roles'),
('Finance', 'finance', 'Accounting and finance roles');

-- 3. INSERT JOB TYPES
INSERT INTO job_types (name, slug) VALUES
('Full-time', 'full-time'),
('Part-time', 'part-time'),
('Contract', 'contract'),
('Internship', 'internship'),
('Remote', 'remote'),
('Freelance', 'freelance');

-- 4. INSERT LOCATIONS
INSERT INTO locations (city, state, country) VALUES
('San Francisco', 'CA', 'USA'),
('New York', 'NY', 'USA'),
('Los Angeles', 'CA', 'USA'),
('Chicago', 'IL', 'USA'),
('London', 'London', 'UK'),
('Remote', NULL, 'Remote');

-- 5. INSERT SKILLS
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('SQL', 'Database'),
('UI Design', 'Design'),
('Project Management', 'Management'),
('Data Analysis', 'Data');

-- 6. INSERT USERS (2 job seekers, 2 employers, 1 admin)
INSERT INTO users (name, email, password_hash, role, is_active) VALUES
('John Seeker', 'john@example.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'job_seeker', TRUE),
('Jane Applicant', 'jane@example.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'job_seeker', TRUE),
('TechCorp HR', 'hr@techcorp.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'employer', TRUE),
('DataWorks Recruiter', 'careers@dataworks.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'employer', TRUE),
('Admin User', 'admin@smarthire.com', '$2b$10$kISi1QW8X9RNqQtXWYSuqOTCNGPxbcu1XK6LkRdpU6hu1eo2wzgka', 'admin', TRUE);

-- Update employers with company_id
UPDATE users SET company_id = 1 WHERE email = 'hr@techcorp.com';
UPDATE users SET company_id = 2 WHERE email = 'careers@dataworks.com';

-- 7. INSERT JOBS (5 jobs)
INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, job_type, experience_level, company_id, posted_by, is_featured) VALUES
('Senior Full Stack Developer', 
 'Looking for an experienced Full Stack Developer to join our team.',
 '5+ years React, Node.js, SQL experience',
 120000, 180000, 'San Francisco, CA', 'full-time', 'senior', 1, 3, TRUE),

('Frontend Developer',
 'Join our frontend team to build amazing UIs.',
 '3+ years React, Tailwind CSS experience',
 80000, 110000, 'Remote', 'remote', 'mid', 1, 3, FALSE),

('Data Analyst',
 'Help us make data-driven decisions.',
 'SQL, Python, data visualization experience',
 70000, 95000, 'New York, NY', 'full-time', 'entry', 2, 4, FALSE),

('Machine Learning Engineer',
 'Build cutting-edge ML solutions.',
 'TensorFlow/PyTorch, 3+ years experience',
 150000, 200000, 'New York, NY', 'full-time', 'senior', 2, 4, TRUE),

('UI/UX Designer',
 'Creative designer for our digital agency.',
 'Figma, Adobe Creative Suite, portfolio required',
 65000, 85000, 'London, UK', 'contract', 'mid', 3, 5, FALSE);

-- 8. INSERT JOB SEEKER SKILLS
INSERT INTO job_seeker_skills (user_id, skill_id, proficiency_level, years_of_experience) VALUES
(1, 1, 'expert', 5.0),
(1, 3, 'expert', 4.0),
(1, 4, 'advanced', 3.0),
(2, 2, 'advanced', 3.0),
(2, 5, 'advanced', 4.0),
(2, 8, 'intermediate', 2.0);

-- 9. INSERT APPLICATIONS (5 applications)
INSERT INTO applications (job_id, user_id, status, cover_letter) VALUES
(1, 1, 'pending', 'Very interested in this Senior Full Stack position.'),
(2, 1, 'reviewed', 'Extensive React experience, would love to join.'),
(3, 1, 'shortlisted', 'Data analysis skills would be a great fit.'),
(1, 2, 'reviewed', '4 years of full stack experience, excited about this role.'),
(4, 2, 'pending', 'Passionate about machine learning.');

-- 10. INSERT RESUMES
INSERT INTO resumes (user_id, title, file_path, is_primary) VALUES
(1, 'John_Seeker_Resume.pdf', '/uploads/resumes/john_seeker_resume.pdf', TRUE),
(2, 'Jane_Applicant_Resume.pdf', '/uploads/resumes/jane_applicant_resume.pdf', TRUE);

-- 11. INSERT SAVED JOBS
INSERT INTO saved_jobs (user_id, job_id) VALUES
(1, 3),
(1, 4),
(2, 1);

-- 12. INSERT NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type) VALUES
(1, 'Application Received', 'Your application for Senior Full Stack Developer has been received.', 'application'),
(1, 'Application Reviewed', 'Your application for Frontend Developer is being reviewed.', 'application'),
(2, 'New Job Match', 'New Machine Learning Engineer position matches your profile.', 'job');

-- 13. INSERT SHORTLISTED CANDIDATES
INSERT INTO shortlisted_candidates (job_id, user_id, employer_id, notes) VALUES
(1, 2, 3, 'Great experience, moving to interview stage'),
(2, 1, 3, 'Strong portfolio, schedule technical interview');

-- 14. INSERT JOB REQUIRED SKILLS
INSERT INTO job_required_skills (job_id, skill_id, is_mandatory) VALUES
(1, 1, TRUE),
(1, 3, TRUE),
(1, 4, TRUE),
(2, 3, TRUE),
(2, 1, TRUE),
(3, 5, TRUE),
(3, 2, TRUE);

-- 15. INSERT ACTIVITY LOGS
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address) VALUES
(1, 'login', 'user', 1, '192.168.1.1'),
(1, 'apply', 'job', 1, '192.168.1.1'),
(2, 'login', 'user', 2, '192.168.1.2'),
(3, 'post_job', 'job', 1, '192.168.1.3');

-- 16. INSERT CONTACT MESSAGES
INSERT INTO contact_messages (name, email, subject, message, status) VALUES
('John Seeker', 'john@example.com', 'Question about application', 'I applied for a job but have not heard back.', 'unread'),
('TechCorp HR', 'hr@techcorp.com', 'Partnership Inquiry', 'We would like to partner with you.', 'read');

-- Verify all data
SELECT 'Companies' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM companies;
SELECT 'Job Categories' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM job_categories;
SELECT 'Job Types' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM job_types;
SELECT 'Locations' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM locations;
SELECT 'Skills' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM skills;
SELECT 'Users' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM users;
SELECT 'Jobs' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM jobs;
SELECT 'Job Seeker Skills' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM job_seeker_skills;
SELECT 'Applications' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM applications;
SELECT 'Resumes' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM resumes;
SELECT 'Saved Jobs' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM saved_jobs;
SELECT 'Notifications' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM notifications;
SELECT 'Shortlisted Candidates' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM shortlisted_candidates;
SELECT 'Job Required Skills' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM job_required_skills;
SELECT 'Activity Logs' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM activity_logs;
SELECT 'Contact Messages' AS Table_Name; SELECT COUNT(*) AS Record_Count FROM contact_messages;

SELECT 'All seed data inserted successfully' AS Status;