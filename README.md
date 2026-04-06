# Smart_Hire - Smart Job Portal System

SmartHire is a modern full-stack job portal web application connecting job seekers, employers, and administrators. It is designed to be scalable, SEO-friendly, and production-ready.

Table of Contents
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
- Role-based navigation for Job Seeker, Employer, Admin, Guest
- Responsive design (Desktop & Mobile)
- Active route highlighting
- Login/Logout functionality
- User avatar dropdown menu
- Mobile hamburger menu
- SEO-friendly & scalable

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
│ │ │ │ └── Footer.jsx
│ │ │ └── jobs/
│ │ │ ├── JobCard.jsx
│ │ │ ├── JobListing.jsx
│ │ │ ├── JobFilters.jsx
│ │ │ ├── JobDetails.jsx
│ │ │ └── SearchBar.jsx
│ │ ├── contexts/
│ │ │ └── AuthContext.jsx
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

# Clone the Repository
    git clone https://github.com/Mayaman-prog/Smart_Hire.git
    cd Smart_Hire

# Client Setup
    cd client
    npm install
    npm run dev

Client will run on: http://localhost:5173

# Server Setup

Open a new terminal:
    cd server
    npm install
    npm run dev

Server will run on: http://localhost:5000

# Database Setup (MySQL)
### Open MySQL via XAMPP or terminal
- mysql -u root -p

### Create database
- CREATE DATABASE smarthire;

### Import schema from server/database/schema.sql
- USE smarthire;
- SOURCE server/database/schema.sql;

## Environment Variables

Create a .env file inside the server folder.

# Server
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smarthire

# JWT
JWT_SECRET=c/h6cJrSVDF3p0ZSTu56NdgphRT8L4Gb6EGPKdUy/fg=

# Client URL
CLIENT_URL=http://localhost:5173

### Run the Project
# Start server (Terminal 1)
    cd server
    npm run dev

# Start client (Terminal 2)
    cd client
    npm run dev

## Open browser at: http://localhost:5173

### Navbar Implementation

# Features
    Role-based navigation (Job Seeker, Employer, Admin, Guest)
    Active route highlighting
    User avatar dropdown menu
    Mobile hamburger menu
    Tailwind CSS styling

# Role-Based Navigation
| User Role  | Menu Items                                             |
| ---------- | ------------------------------------------------------ |
| Job Seeker | Home, Jobs, Companies, My Applications, Profile        |
| Employer   | Home, Jobs, Companies, Post Job, My Jobs, Applications |
| Admin      | Home, Jobs, Companies, Users, Manage Jobs, Reports     |
| Guest      | Home, Jobs, Companies, Login, Register                 |

###  Database Schema
# Tables & Relationships
| Table            | Description                    |
| ---------------- | ------------------------------ |
| **users**        | Job seekers, employers, admins |
| **companies**    | Company profiles               |
| **jobs**         | Job postings                   |
| **applications** | Job applications               |

### Table Structures
# Indexes
    users: email, role, is_active
    jobs: job_type, location, is_active, is_featured
    applications: status, applied_at

# Foreign Keys
    users.company_id → companies.id
    jobs.company_id → companies.id
    jobs.posted_by → users.id
    applications.job_id → jobs.id
    applications.user_id → users.id

## Seed Data
    5 users (2 employers, 2 job seekers, 1 admin)
    3 companies
    5 jobs
    5 applications

### Footer Implementation

# Features
- Responsive layout (4 columns desktop, 2 columns tablet, 1 column mobile)
- Quick links sections (Platform, For Employers, Support)
- Newsletter signup with email validation
- Toast notification for "Feature coming soon"
- Social media icons (LinkedIn, GitHub, Twitter, Facebook) - 24px each
- Dynamic copyright year (auto-updates)
- Sticky to bottom using flexbox (mt-auto)
- Dark theme background (bg-gray-900) with white text
- Hover effects on all links and icons

# Footer Sections
| Section        | Links                                                                 |
|----------------|----------------------------------------------------------------------|
| **Brand**      | SmartHire logo, tagline, emojis                                |
| **Platform**   | Find Jobs, Browse Companies, Salaries, Career Advice                 |
| **For Employers** | Post a Job, Hiring Solutions, Pricing, Resources                  |
| **Support**    | Help Center, Privacy Policy, Terms of Service, Cookie Policy         |

# Responsive Breakpoints
| Screen Size              | Layout     |
|--------------------------|------------|
| **Desktop (>1024px)**    | 4 columns  |
| **Tablet (768px-1024px)**| 2 columns  |
| **Mobile (<768px)**      | 1 column   |

## JobCard Component

- Location: client/src/components/jobs/JobCard.jsx

# Features:
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

# Job Type Colors:
| Job Type    | Color  |
|-------------|--------|
| Full-time   | Green  |
| Part-time   | Blue   |
| Contract    | Orange |
| Remote      | Purple |
| Internship  | Yellow |
| Freelance   | Pink   |



### Contributing
    Create a new branch:
    git switch -c branch-name

    Commit your changes:
    git commit -m "add new feature"

    Push to repository:
    git push origin branch-name

### Future Improvements
    Docker support
    Cloud deployment (Vercel + Render)
    Notification system
    Advanced search filters

### License

This project is for educational purposes.

### Goal

Make onboarding so easy that any developer can run SmartHire locally in under 15 minutes.