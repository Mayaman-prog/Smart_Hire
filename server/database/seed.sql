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