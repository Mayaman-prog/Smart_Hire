# Smart_Hire - Smart Job Portal System

SmartHire is a modern full-stack job portal web application connecting job seekers, employers, and administrators. It is designed to be scalable, SEO-friendly, and production-ready.

Table of Contents
Project Overview
Features
Tech Stack
Prerequisites
Project Structure
Setup Instructions
Navbar Implementation
Database Schema
Seed Data
Contributing
Future Improvements
License

## Project Overview
SmartHire enables seamless interaction between job seekers, employers, and admins.

| Role           | Capabilities                                                                |
| -------------- | --------------------------------------------------------------------------- |
| **Job Seeker** | Search & apply for jobs, view companies, manage profile, track applications |
| **Employer**   | Post jobs, manage listings, view applications, manage company profile       |
| **Admin**      | Monitor users, manage jobs, generate reports, oversee the system            |

## Features
Role-based navigation for Job Seeker, Employer, Admin, Guest
Responsive design (Desktop & Mobile)
Active route highlighting
Login/Logout functionality
User avatar dropdown menu
Mobile hamburger menu
SEO-friendly & scalable

## Tech Stack
### Client
    React (Vite)
    Tailwind CSS
    Axios
    React Router DOM

### Server
    Node.js + Express.js
    JWT Authentication
    bcrypt for password hashing
    CORS

### Database
    MySQL (via XAMPP)

## Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Git
- XAMPP (for MySQL)

## Project Structure
SmartHire/
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── common/      # Navbar.jsx
│   │   ├── contexts/        # AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                  # Node.js + Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── database/
│   │   └── schema.sql
│   └── server.js
│
├── README.md
└── .gitignore

## Setup Instructions

Follow these steps to run the project locally in under 15 minutes:

### Clone the Repository
    git clone https://github.com/Mayaman-prog/Smart_Hire.git
    cd Smart_Hire

### Client Setup
    cd client
    npm install
    npm run dev

Client will run on: http://localhost:5173

### Server Setup

Open a new terminal:
    cd server
    npm install
    npm run dev

Server will run on: http://localhost:5000

### Database Setup (MySQL)
#### Open MySQL via XAMPP or terminal

#### Create database
    CREATE DATABASE smarthire;

#### Import schema from server/database/schema.sql

### Environment Variables

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

License

This project is for educational purposes.

Goal

Make onboarding so easy that any developer can run SmartHire locally in under 15 minutes.