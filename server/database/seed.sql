-- Smart Hire Seed Data
-- INSERT COMPANIES (3 companies)
INSERT INTO companies (name, description, website, location, email, is_verified) VALUES
('TechCorp Solutions', 'Leading software development company', 'https://techcorp.com', 'San Francisco, CA', 'hr@techcorp.com', TRUE),
('DataWorks Inc', 'Big data analytics and AI solutions', 'https://dataworks.com', 'New York, NY', 'careers@dataworks.com', TRUE),
('CreativeStudio', 'Digital design and branding agency', 'https://creativestudio.com', 'London, UK', 'jobs@creativestudio.com', FALSE);

-- INSERT USERS (2 job seekers, 2 employers, 1 admin)

INSERT INTO users (name, email, password_hash, role, is_active) VALUES
('John Seeker', 'john@example.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'job_seeker', TRUE),
('Jane Applicant', 'jane@example.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'job_seeker', TRUE),
('TechCorp HR', 'hr@techcorp.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'employer', TRUE),
('DataWorks Recruiter', 'careers@dataworks.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'employer', TRUE),
('Admin User', 'admin@smarthire.com', '$2a$10$rQKJqQxKJqQxKJqQxKJqQu', 'admin', TRUE);

-- Update employers with company_id
UPDATE users SET company_id = 1 WHERE email = 'hr@techcorp.com';
UPDATE users SET company_id = 2 WHERE email = 'careers@dataworks.com';

-- INSERT JOBS (5 jobs)

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

-- INSERT APPLICATIONS (5 applications)

INSERT INTO applications (job_id, user_id, status, cover_letter) VALUES
(1, 1, 'pending', 'Very interested in this Senior Full Stack position.'),
(2, 1, 'reviewed', 'Extensive React experience, would love to join.'),
(3, 1, 'shortlisted', 'Data analysis skills would be a great fit.'),
(1, 2, 'reviewed', '4 years of full stack experience, excited about this role.'),
(4, 2, 'pending', 'Passionate about machine learning.');

-- INSERT JOB CATEGORIES
INSERT INTO job_categories (name, slug, description) VALUES
('Software Development', 'software-development', 'Software development and engineering roles'),
('Data Science', 'data-science', 'Data analysis and machine learning roles'),
('Design', 'design', 'UI/UX and graphic design roles'),
('Marketing', 'marketing', 'Digital marketing and branding roles'),
('Sales', 'sales', 'Sales and business development roles'),
('Customer Service', 'customer-service', 'Customer support and service roles'),
('Human Resources', 'human-resources', 'HR and recruitment roles'),
('Finance', 'finance', 'Accounting and finance roles');

-- INSERT JOB TYPES
INSERT INTO job_types (name, slug) VALUES
('Full-time', 'full-time'),
('Part-time', 'part-time'),
('Contract', 'contract'),
('Internship', 'internship'),
('Remote', 'remote'),
('Freelance', 'freelance');

-- INSERT LOCATIONS
INSERT INTO locations (city, state, country) VALUES
('San Francisco', 'CA', 'USA'),
('New York', 'NY', 'USA'),
('Los Angeles', 'CA', 'USA'),
('Chicago', 'IL', 'USA'),
('London', 'London', 'UK'),
('Remote', NULL, 'Remote');

-- INSERT SKILLS
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('SQL', 'Database'),
('UI Design', 'Design'),
('Project Management', 'Management'),
('Data Analysis', 'Data');

-- INSERT SAVED JOBS (John Seeker saved some jobs)
INSERT INTO saved_jobs (user_id, job_id) VALUES
(1, 3),
(1, 4),
(2, 1);

-- INSERT NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type) VALUES
(1, 'Application Received', 'Your application for Senior Full Stack Developer has been received.', 'application'),
(1, 'Application Reviewed', 'Your application for Frontend Developer is being reviewed.', 'application'),
(2, 'New Job Match', 'New Machine Learning Engineer position matches your profile.', 'job');

-- INSERT SHORTLISTED CANDIDATES
INSERT INTO shortlisted_candidates (job_id, user_id, employer_id, notes) VALUES
(1, 2, 3, 'Great experience, moving to interview stage'),
(2, 1, 3, 'Strong portfolio, schedule technical interview');