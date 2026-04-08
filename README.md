# Smart_Hire - Smart Job Portal System

SmartHire is a modern full-stack job portal web application connecting job seekers, employers, and administrators. It is designed to be scalable, SEO-friendly, and production-ready.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Components Implemented](#components-implemented)
  - [Navbar Component](#navbar-component)
  - [Footer Component](#footer-component)
  - [JobCard Component](#jobcard-component)
  - [Button Component](#button-component)
  - [Input Component](#input-component)
- [Validation Utilities](#validation-utilities)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Future Improvements](#future-improvements)
- [License](#license)

## Project Overview
SmartHire enables seamless interaction between job seekers, employers, and admins.

| Role           | Capabilities                                                                |
| -------------- | --------------------------------------------------------------------------- |
| **Job Seeker** | Search & apply for jobs, view companies, manage profile, track applications |
| **Employer**   | Post jobs, manage listings, view applications, manage company profile       |
| **Admin**      | Monitor users, manage jobs, generate reports, oversee the system            |

## Features

### Core Features
- Role-based navigation for Job Seeker, Employer, Admin, Guest
- Responsive design (Desktop & Mobile)
- Active route highlighting
- Login/Logout functionality
- User avatar dropdown menu
- Mobile hamburger menu
- Job listing with cards
- Reusable form components with validation
- SEO-friendly & scalable

### Component Features

#### Navbar
- Role-based menu items
- Active route highlighting
- User avatar dropdown
- Mobile responsive hamburger menu
- Tailwind CSS styling

#### Footer
- Responsive grid layout (4/2/1 columns)
- Quick links sections
- Newsletter signup with toast notification
- Social media icons (24px)
- Dynamic copyright year
- Sticky to bottom

#### JobCard
- Job title, company, location, salary display
- Featured badge for premium jobs
- Save to wishlist (heart icon)
- Colored job type tags
- Hover effects (scale 1.05, shadow increase)
- Click navigation to job details
- Company logo with fallback

#### Button Component
- 5 variants (primary, secondary, danger, outline, ghost)
- 3 sizes (sm, md, lg)
- States: default, hover, active, disabled, loading (with spinner)
- Full width option
- Smooth transitions and focus rings

#### Input Component
- Supported types: text, email, password, number, textarea, select
- Label with required asterisk
- Placeholder support
- Border radius and consistent padding
- States: default, focus (blue border), error (red border + message), disabled, filled
- Password input with eye icon show/hide toggle
- Textarea with min-height 100px

## Tech Stack
### Client
- React (Vite)
- Tailwind CSS
- Axios
- React Router DOM

### Server
- Node.js + Express.js
- JWT Authentication
- bcrypt for password hashing
- CORS

### Database
- MySQL (via XAMPP)

## Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Git
- XAMPP (for MySQL)

## Project Structure
SmartHire/
├── client/ # React (Vite) frontend
│ ├── src/
│ │ ├── components/
│ │ │ ├── common/
│ │ │ │ ├── Navbar.jsx
│ │ │ │ ├── Footer.jsx
│ │ │ │ ├── Button.jsx
│ │ │ │ ├── Input.jsx
│ │ │ │ └── FormExample.jsx
│ │ │ └── jobs/
│ │ │ ├── JobCard.jsx
│ │ │ └── JobListing.jsx
│ │ ├── contexts/
│ │ │ └── AuthContext.jsx
│ │ ├── utils/
│ │ │ └── validators.js
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── index.html
│ └── package.json
│
├── server/ # Node.js + Express backend
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── config/
│ ├── database/
│ │ └── schema.sql
│ └── app.js
│
├── README.md
└── .gitignore

## Setup Instructions

Follow these steps to run the project locally in under 15 minutes:

### Clone the Repository
- git clone https://github.com/Mayaman-prog/Smart_Hire.git
- cd Smart_Hire

### Client Setup
- cd client
- npm install
- npm run dev

### Client will run on: http://localhost:5173

## Server Setup

### Open a new terminal:
- cd server
- npm install
- npm run dev

### Server will run on: http://localhost:5000

## Database Setup (MySQL)
### Open MySQL via XAMPP or terminal
- mysql -u root -p

### Create database
- CREATE DATABASE smarthire;

### Import schema from server/database/schema.sql
- USE smarthire;
- SOURCE server/database/schema.sql;

## Environment Variables

- Create a .env file inside the server folder.

### Server
PORT=5000

### Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smarthire

### JWT
JWT_SECRET=c/h6cJrSVDF3p0ZSTu56NdgphRT8L4Gb6EGPKdUy/fg=

### Client URL
CLIENT_URL=http://localhost:5173

## Run the Project
### Start server (Terminal 1)
- cd server
- npm run dev

### Start client (Terminal 2)
- cd client
- npm run dev

### Open browser at: http://localhost:5173

## Components Implemented

### Navbar Implementation

#### Location: client/src/components/common/Navbar.jsx

# Features
- Role-based navigation (Job Seeker, Employer, Admin, Guest)
- Active route highlighting with visual feedback
- User avatar dropdown menu with logout
- Mobile hamburger menu with smooth toggle
- Tailwind CSS styling with responsive breakpoints

# Role-Based Navigation
| User Role  | Menu Items                                             |
| ---------- | ------------------------------------------------------ |
| Job Seeker | Home, Jobs, Companies, My Applications, Profile        |
| Employer   | Home, Jobs, Companies, Post Job, My Jobs, Applications |
| Admin      | Home, Jobs, Companies, Users, Manage Jobs, Reports     |
| Guest      | Home, Jobs, Companies, Login, Register                 |

## Footer Implementation

### Features
- Responsive layout (4 columns desktop, 2 columns tablet, 1 column mobile)
- Quick links sections (Platform, For Employers, Support)
- Newsletter signup with email validation
- Toast notification for "Feature coming soon"
- Social media icons (LinkedIn, GitHub, Twitter, Facebook) - 24px each
- Dynamic copyright year (auto-updates)
- Sticky to bottom using flexbox (mt-auto)
- Dark theme background (bg-gray-900) with white text
- Hover effects on all links and icons

### Footer Sections
| Section           | Links                                                         |
|-------------------|---------------------------------------------------------------|
| **Brand**         | SmartHire logo, tagline, emojis                               |
| **Platform**      | Find Jobs, Browse Companies, Salaries, Career Advice          |
| **For Employers** | Post a Job, Hiring Solutions, Pricing, Resources              |
| **Support**       | Help Center, Privacy Policy, Terms of Service, Cookie Policy  |

# Responsive Breakpoints
| Screen Size              | Layout     |
|--------------------------|------------|
| **Desktop (>1024px)**    | 4 columns  |
| **Tablet (768px-1024px)**| 2 columns  |
| **Mobile (<768px)**      | 1 column   |

## JobCard Component

- Location: client/src/components/jobs/JobCard.jsx

### Features:
- Displays job title, company name, and company logo
- Location with pin icon
- Salary range formatting
- Colored job type tags (Full-time, Part-time, - Remote, Contract, Internship, Freelance)
- Featured badge for premium jobs (⭐ Featured)
- Save to wishlist functionality (heart icon)
- Click navigation to job details page (/jobs/${id})
- Hover effects: scale transform (1.05), shadow increase, border color change
- Border radius, padding, white background, box shadow
- Company logo fallback (first letter in gradient circle)

### Job Type Colors:
| Job Type    | Color  |
|-------------|--------|
| Full-time   | Green  |
| Part-time   | Blue   |
| Contract    | Orange |
| Remote      | Purple |
| Internship  | Yellow |
| Freelance   | Pink   |

## Button Component
### Location: client/src/components/common/Button.jsx

### Features:
- 5 variants: primary, secondary, danger, outline, ghost
- 3 sizes: sm, md, lg
- States: default, hover, active, disabled, loading (with spinner animation)
- Full width option
- Smooth transitions and focus rings

## Input Component

### Location: client/src/components/common/Input.jsx

### Features:
- Supported types: text, email, password, number, textarea, select
- Label with required asterisk
- Placeholder support
- Border radius and consistent padding
- States: default, focus (blue border), error (red border + message), disabled, filled
- Password input with eye icon show/hide toggle
- Textarea with min-height 100px

## Validation Utilities
### Location: client/src/utils/validators.js

### Available Validators:
| Function                                   | Description                             | Example                             |
|--------------------------------------------|-----------------------------------------|-------------------------------------|
| `validateEmail(email)`                     | Validates email format                  | `validateEmail("test@example.com")` |
| `validatePassword(password)`               | Minimum 6 characters, at least 1 number | `validatePassword("pass123")`       |
| `validateRequired(value, fieldName)`       | Checks if a field is empty              | `validateRequired(name, "Name")`    |
| `validateMatch(password, confirmPassword)` | Checks if passwords match               | `validateMatch(pwd, confirmPwd)`    |

###  Database Schema
# Tables & Relationships
| Table            | Description                    |
| ---------------- | ------------------------------ |
| **users**        | Job seekers, employers, admins |
| **companies**    | Company profiles               |
| **jobs**         | Job postings                   |
| **applications** | Job applications               |

### Table Structures
#### users
- id (Primary Key)
- name, email (unique), password_hash
- role (job_seeker/employer/admin)
- company_id (Foreign Key to companies)
- is_active, created_at, updated_at

#### companies
- id (Primary Key)
- name, logo_url, description, website
- location, email, phone
- is_verified, created_at, updated_at

#### jobs
- id (Primary Key)
- title, description, requirements
- salary_min, salary_max, location
- job_type, experience_level
- company_id (Foreign Key), posted_by (Foreign Key)
- is_active, is_featured, deadline

#### applications
- id (Primary Key)
- job_id (Foreign Key), user_id (Foreign Key)
- status (pending/reviewed/shortlisted/rejected/hired)
- cover_letter, resume_url
- applied_at, updated_at

## Indexes
- users: email, role, is_active
- jobs: job_type, location, is_active, is_featured
- applications: status, applied_at

## Foreign Keys
- users.company_id → companies.id
- jobs.company_id → companies.id
- jobs.posted_by → users.id
- applications.job_id → jobs.id
- applications.user_id → users.id

## Seed Data
- 5 users (2 employers, 2 job seekers, 1 admin)
- 3 companies
- 5 jobs
- 5 applications

## Troubleshooting

### Common Issue
| Issue                         | Solution                                                  |
|-------------------------------|-----------------------------------------------------------|
| Navbar items squished         | Restart Vite: `rm -rf node_modules/.vite && npm run dev`  |
| Tailwind CSS not applying     | Check `tailwind.config.js` content paths                  |
| JobCard not showing           | Verify route in `App.jsx` points to `JobListing`          |
| Footer not sticky             | Ensure layout uses `min-h-screen flex flex-col`           |
| Form validation not working   | Check `validators.js` path and exports                    |
| react-hook-form error         | Run `npm install react-hook-form`                         |

## Contributing
    Create a new branch:
    git switch -c branch-name

    Commit your changes:
    git commit -m "add new feature"

    Push to repository:
    git push origin branch-name

## Future Improvements
- Add Docker support
- Cloud deployment (Vercel + Render)
- Notification system
- Advanced search filters
- Email verification
- Password reset functionality
- Chat between employers and job seekers
- CompanyCard component
- Job application tracking
- Resume upload functionality
- Dark mode support

## License

This project is for educational purposes.

## Goal

Make onboarding so easy that any developer can run SmartHire locally in under 15 minutes.