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
  - [HomePage Component](#homepage-component)
  - [JobsPage Component](#jobspage-component)
  - [JobCard Component](#jobcard-component)
  - [CompanyCard Component](#companycard-component)
  - [Button Component](#button-component)
  - [Input Component](#input-component)
  - [Tag Component](#tag-component)
  - [TagGroup Component](#taggroup-component)
- [Routing System](#routing-system)
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
- Company directory with cards
- Advanced job search with filters (job type, location, salary range)
- Sorting options (Most recent, Salary high to low, Salary low to high)
- Pagination for job listings
- Loading skeleton animations
- Reusable form components with validation
- Protected routes with role-based access
- 404 page for unknown routes
- Scroll restoration on route change
- CSS variables for consistent theming
- Google Material Icons integration
- SEO-friendly & scalable

### Component Features

#### Navbar
- Role-based menu items (Guest, Job Seeker, Employer, Admin)
- Active route highlighting with visual feedback
- User avatar dropdown with logout
- Mobile responsive hamburger menu with slide-out drawer
- CSS modules styling

#### Footer
- Responsive grid layout (4 columns desktop, 2 tablet, 1 mobile)
- Quick links sections (Platform, For Employers, Support)
- Newsletter signup with toast notification
- Social media icons (LinkedIn, GitHub, Twitter, Facebook)
- Dynamic copyright year
- Sticky to bottom using flexbox

#### HomePage Component
**Location:** `client/src/pages/HomePage/HomePage.jsx`

**Features:**
- Hero section with gradient background and wave effect
- Call-to-action buttons (Search Jobs, Post a Job) with authentication check
- Search bar with keyword and location inputs using Google Material Icons
- Featured jobs section fetching from JSON data
- Loading skeleton animation while fetching data
- Empty state when no featured jobs available
- Error state with retry button
- "How It Works" section with 3 steps and icons
- Fully responsive design (mobile, tablet, desktop)
- CSS variables for consistent theming
- Google Material Icons throughout

**Responsive Breakpoints:**

| Screen Size          | Layout                       |
|----------------------|------------------------------|
| Desktop (>1200px)    | 3 column grid for jobs       |
| Tablet (768px-992px) | 2 column grid                |
| Mobile (<768px)      | 1 column, stacked search bar |

**Authentication Integration:**
- Unauthenticated users clicking "Search Jobs" or "Post a Job" are redirected to login
- Search queries are saved to sessionStorage and restored after login

#### JobsPage Component
**Location:** client/src/pages/JobsPage/JobsPage.jsx

**Features:**
- Complete job listing page with search and filters
- Search bar with keyword and location inputs (debounced search - 300ms)
- Filter sidebar with job type checkboxes (colored like job cards)
- Location input filter
- Salary range filter with min/max inputs and visual bar
- Active filters display with individual remove buttons
- "Clear all filters" button
- Sorting options (Most recent, Salary high to low, Salary low to high)
- Responsive job cards grid (3 columns desktop, 2 tablet, 1 mobile)
- Pagination with Previous/Next buttons and page numbers
- Results count display
- Loading skeleton (6 cards with shimmer animation)
- Empty state with friendly message and clear filters button
- Mobile filter drawer (slide-in panel)
- URL query params sync (filters persist after page refresh)
- CSS variables for consistent theming

**Filter Sidebar:**
- Job Type: Full-time, Part-time, Remote, Contract, Internship (colored buttons)
- Location: Text input with placeholder
- Salary Range: Min/Max number inputs with visual progress bar

**Mobile Features:**
- Filter button above job cards
- Slide-in filter drawer
- Full-width job cards
- Stacked search bar

#### JobCard Component
**Location:** `client/src/components/jobs/JobCard/JobCard.jsx`

**Features:**
- Displays job title, company name, and company logo (initials fallback)
- Location with pin icon
- Salary range formatting
- Colored job type tags
- Featured badge for premium jobs
- Save to wishlist functionality (heart icon)
- Click navigation to job details page (`/jobs/${id}`)
- Hover effects: scale transform (1.02), shadow increase, border color change

**Job Type Colors:**

| Job Type    | Color  |
|-------------|--------|
| Full-time   | Green  |
| Part-time   | Yellow |
| Contract    | Purple |
| Remote      | Blue   |
| Internship  | Orange |

#### CompanyCard Component
**Location:** `client/src/components/companies/CompanyCard/CompanyCard.jsx`

**Features:**
- Company logo with initials fallback
- Company name, location, open jobs count
- Verified badge for verified companies
- Hover effects: scale transform (1.02), shadow increase, border color change
- Click navigation to company details page (`/companies/${id}`)

#### Button Component
**Location:** `client/src/components/common/Button/Button.jsx`

**Features:**
- 5 variants: primary, secondary, danger, outline, ghost
- 3 sizes: sm, md, lg
- States: default, hover, active, disabled, loading (with spinner animation)
- Full width option
- Smooth transitions and focus rings

#### Input Component
**Location:** `client/src/components/common/Input/Input.jsx`

**Features:**
- Supported types: text, email, password, number, textarea, select
- Label with required asterisk
- Placeholder support
- States: default, focus (blue border), error (red border + message), disabled, filled
- Password input with custom eye icon show/hide toggle
- Browser's native password eye icon hidden
- Textarea with min-height 100px

### Tag Component
**Location:** `client/src/components/common/Tag/Tag.jsx`

**Features:**
- 6 color variants for different job types
- Removable option with X button
- Customizable text
- Rounded pill style
- Responsive design

### TagGroup Component
**Location:** `client/src/components/common/TagGroup/TagGroup.jsx`

**Features:**
- Displays limited tags by default (configurable maxDisplay)
- "+X more" button to expand
- "Show less" button to collapse
- Responsive wrapping

## Tech Stack
### Client
- React 18.2.0
- Vite 5.0.8
- React Router DOM 6.20.0
- Axios 1.6.2
- React Hook Form 7.48.2
- React Hot Toast 2.4.1
- Google Fonts Icons (Material Symbols)

### Server
- Node.js 18.x
- Express.js 4.18.2
- JWT Authentication
- bcryptjs for password hashing
- CORS
- MySQL2

### Database
- MySQL 8.0 (via XAMPP)

## Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Git
- XAMPP (for MySQL)

## Project Structure
SmartHire/
├── client/                           # React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar/
│   │   │   │   │   ├── Navbar.jsx
│   │   │   │   │   └── Navbar.css
│   │   │   │   ├── Footer/
│   │   │   │   │   ├── Footer.jsx
│   │   │   │   │   └── Footer.css
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   └── Button.css
│   │   │   │   ├── Input/
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   └── Input.css
│   │   │   │   ├── Tag/
│   │   │   │   │   ├── Tag.jsx
│   │   │   │   │   └── Tag.css
│   │   │   │   ├── TagGroup/
│   │   │   │   │   ├── TagGroup.jsx
│   │   │   │   │   └── TagGroup.css
│   │   │   │   └── ScrollToTop.jsx
│   │   │   ├── jobs/
│   │   │   │   └── JobCard/
│   │   │   │       ├── JobCard.jsx
│   │   │   │       └── JobCard.css
│   │   │   ├── companies/
│   │   │   │   └── CompanyCard/
│   │   │   │       ├── CompanyCard.jsx
│   │   │   │       └── CompanyCard.css
│   │   │   └── auth/
│   │   │       └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── HomePage/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   └── HomePage.css
│   │   │   ├── JobsPage/
│   │   │   │   ├── JobsPage.jsx
│   │   │   │   └── JobsPage.css
│   │   │   ├── JobDetailsPage/
│   │   │   ├── CompaniesPage/
│   │   │   ├── CompanyDetailsPage/
│   │   │   ├── LoginPage/
│   │   │   ├── RegisterPage/
│   │   │   └── NotFoundPage/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── data/
│   │   │   ├── jobs.json
│   │   │   └── companies.json
│   │   ├── utils/
│   │   │   └── validators.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── variables.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── scripts/
│   │   └── setup-db.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── examplecodefiles/                # Reference code examples
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

#### Client will run on: http://localhost:5173

## Server Setup

### Open a new terminal:
- cd server
- npm install
- npm run dev

#### Server will run on: http://localhost:5000

## Database Setup (MySQL)
### Start MySQL
- Open XAMPP Control Panel
- Click Start button next to MySQL

### Create database
#### Open MySQL command line:
- mysql -u root -p
**Then run:**
- CREATE DATABASE smart_hire;
- USE smart_hire;
- EXIT;

### Run Database Setup Script
- cd server
- npm run setup-db

## Environment Variables

### Frontend .env (create in client/ folder)
**VITE_API_URL=** http://localhost:5000/api

### Backend .env (create in server/ folder)
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_hire
DB_PORT=3306

JWT_SECRET=super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173

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
**Location:** client/src/components/common/Navbar.jsx

**Features**
- Role-based navigation (Job Seeker, Employer, Admin, Guest)
- Active route highlighting with visual feedback
- User avatar dropdown menu with logout
- Mobile hamburger menu with slide-out drawer
- CSS modules styling with responsive breakpoints

# Role-Based Navigation
| User Role      | Menu Items                                 |
| ---------------| -------------------------------------------|
| **Job Seeker** | Home, Jobs, Companies, Dashboard           |
| **Employer**   | Home, Jobs, Companies, Dashboard, Post Job |
| **Admin**      | Home, Jobs, Companies, Admin Panel         |
| **Guest**      | Home, Jobs, Companies, Login, Register     |

## Footer Implementation
**Location:** client/src/components/common/Footer/Footer.jsx

**Features**
- Responsive layout (4 columns desktop, 2 columns tablet, 1 column mobile)
- Quick links sections (Platform, For Employers, Support)
- Newsletter signup with email validation
- Toast notification for "Feature coming soon"
- Social media icons (LinkedIn, GitHub, Twitter, Facebook)
- Dynamic copyright year (auto-updates)
- Sticky to bottom using flexbox
- Dark theme background with white text

### Footer Sections
| Section           | Links                                                         |
|-------------------|---------------------------------------------------------------|
| **Brand**         | SmartHire logo, tagline                                       |
| **Platform**      | Find Jobs, Browse Companies, Salaries, Career Advice          |
| **For Employers** | Post a Job, Hiring Solutions, Pricing, Resources              |
| **Support**       | Help Center, Privacy Policy, Terms of Service, Cookie Policy  |

### Responsive Breakpoints
| Screen Size              | Layout     |
|--------------------------|------------|
| **Desktop (>1024px)**    | 4 columns  |
| **Tablet (768px-1024px)**| 2 columns  |
| **Mobile (<768px)**      | 1 column   |

## HomePage Component
**Location:** client/src/pages/HomePage/HomePage.jsx

**Features:**
- Hero section with gradient background and wave effect
- Call-to-action buttons (Search Jobs, Post a Job) with authentication check
- Search bar with keyword and location inputs
- Featured jobs section fetching from JSON data
- Loading skeleton animation while fetching data
- Empty state when no featured jobs available
- Error state with retry button
- "How It Works" section with 3 steps
- Fully responsive design
- CSS variables for consistent theming
- Google Material Icons throughout

### Authentication Integration:
- Unauthenticated users are redirected to login when clicking action buttons
- Search queries are saved to sessionStorage and restored after login

### Responsive Breakpoints:
| Screen Size              | Job Cards Layout | Search Bar Layout |
| ------------------------ | ---------------- | ----------------- |
| **Desktop (>992px)**     | 3 columns        | Horizontal        |
| **Tablet (768px–992px)** | 2 columns        | Horizontal        |
| **Mobile (<768px)**      | 1 column         | Vertical stacked  |

## JobsPage Component
**Location:** `client/src/pages/JobsPage/JobsPage.jsx`

**Features:**
- Complete job listing page with search and filters
- Search bar with keyword and location inputs (debounced search - 300ms)
- Filter sidebar with job type checkboxes (colored like job cards)
- Location input filter
- Salary range filter with min/max inputs and visual bar
- Active filters display with individual remove buttons
- Sorting options (Most recent, Salary high to low, Salary low to high)
- Responsive job cards grid (3 columns desktop, 2 tablet, 1 mobile)
- Pagination with Previous/Next buttons and page numbers
- Loading skeleton (6 cards with shimmer animation)

- Empty state with friendly message
- Mobile filter drawer (slide-in panel)
- URL query params sync (filters persist after page refresh)

## JobCard Component
**Location:** client/src/components/jobs/JobCard/JobCard.jsx

**Features:**
- Displays job title, company name, and company logo (initials fallback)
- Location with pin icon
- Salary range formatting
- Colored job type tags
- Featured badge for premium jobs
- Save to wishlist functionality (heart icon)
- Click navigation to job details page (/jobs/${id})
- Hover effects: scale transform (1.02), shadow increase, border color change

## CompanyCard Component
**Location:** client/src/components/companies/CompanyCard/CompanyCard.jsx

**Features:**
- Company logo with initials fallback
- Company name, location, open jobs count
- Verified badge for verified companies
- Hover effects: scale transform (1.02), shadow increase, border color change
- Click navigation to company details page (/companies/${id})

## Button Component
**Location**: client/src/components/common/Button/Button.jsx

**Features:**
- 5 variants: primary, secondary, danger, outline, ghost
- 3 sizes: sm, md, lg
- States: default, hover, active, disabled, loading (with spinner animation)
- Full width option
- Smooth transitions and focus rings

## Input Component

**Location:** client/src/components/common/Input.jsx

**Features:**
- Supported types: text, email, password, number, textarea, select
- Label with required asterisk
- Placeholder support
- States: default, focus (blue border), error (red border + message), disabled, filled
- Password input with custom eye icon show/hide toggle
- Browser's native password eye icon hidden
- Textarea with min-height 100px

## Tag Component
**Location:** client/src/components/common/Tag/Tag.jsx

**Features:**
- 6 color variants for different job types
- Removable option with X button
- Customizable text
- Rounded pill style
- Responsive design

## TagGroup Component
**Location:** client/src/components/common/TagGroup/TagGroup.jsx

**Features:**
- Displays limited tags by default (configurable maxDisplay)
- "+X more" button to expand
- "Show less" button to collapse
- Responsive wrapping

## Routing System
**Location:** client/src/App.jsx

### Routes Configured:
| Route                   | Component          | Access          |
| ----------------------- | ------------------ | --------------- |
| **/**                   | HomePage           | Public          |
| **/jobs**               | JobsPage           | Public          |
| **/jobs/:id**           | JobDetailsPage     | Public          |
| **/companies**          | CompaniesPage      | Public          |
| **/companies/:id**      | CompanyDetailsPage | Public          |
| **/login**              | LoginPage          | Public          |
| **/register**           | RegisterPage       | Public          |
| **/dashboard/seeker**   | JobSeekerDashboard | Job Seeker only |
| **/dashboard/employer** | EmployerDashboard  | Employer only   |
| **/dashboard/admin**    | AdminDashboard     | Admin only      |
|  *                      | NotFoundPage       | Public          |

**Features:**
- Protected routes with role-based access control
- Scroll restoration on route change
- 404 page for unknown routes
- Browser back/forward button support


## Validation Utilities
**Location:** client/src/utils/validators.js

| Function                                     | Description                             | Example                                                          |
| -------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| **validateEmail(email)**                     | Validates email format                  | **validateEmail("[test@example.com](mailto:test@example.com)")** |
| **validatePassword(password)**               | Minimum 6 characters, at least 1 number | **validatePassword("pass123")**                                  |
| **validateRequired(value, fieldName)**       | Checks if a field is empty              | **validateRequired(name, "Name")**                               |
| **validateMatch(password, confirmPassword)** | Checks if passwords match               | **validateMatch(pwd, confirmPwd)**                               |
| **validateName(name)**                       | Checks if name has min 2 characters     | **validateName("John")**                                         |
| **validatePhone(phone)**                     | Validates 10-digit phone number         | **validatePhone("1234567890")**                                  |

###  Database Schema
#### Tables Created
| Table                      | Description                                   | Records |
| -------------------------- | --------------------------------------------- | ------- |
| **companies**              | Company profiles                              | 3       |
| **users**                  | User accounts (job seekers, employers, admin) | 5       |
| **jobs**                   | Job postings                                  | 5       |
| **applications**           | Job applications                              | 5       |
| **saved_jobs**             | Jobs saved by users                           | 3       |
| **notifications**          | User notifications                            | 3       |
| **job_categories**         | Job categories                                | 8       |
| **job_types**              | Job types                                     | 6       |
| **locations**              | Location master                               | 6       |
| **skills**                 | Skills master                                 | 8       |
| **job_seeker_skills**      | User skills mapping                           | 6       |
| **job_required_skills**    | Job requirements mapping                      | 7       |
| **resumes**                | Stored resumes                                | 2       |
| **shortlisted_candidates** | Shortlisted candidates                        | 2       |
| **activity_logs**          | System activity tracking                      | 4       |
| **contact_messages**       | Contact form submissions                      | 2       |

## Troubleshooting

| Issue                              | Solution                                                            |
| ---------------------------------- | ------------------------------------------------------------------- |
| Navbar items squished              | Restart Vite: `rm -rf node_modules/.vite && npm run dev`            |
| CSS not applying                   | Check import paths in component files                               |
| JobCard not showing                | Verify data in `client/src/data/jobs.json`                          |
| Footer not sticky                  | Ensure layout uses `min-height: 100vh` and `flex-direction: column` |
| Form validation not working        | Check `validators.js` path in imports                               |
| HomePage featured jobs not showing | Check `jobs.json` has `is_featured: true` jobs                      |
| Search redirect not working        | Check AuthContext and localStorage                                  |
| Icons not showing                  | Ensure Google Fonts link in `index.html`                            |
| Filters not working                | Check URL query params and state management                         |
| Mobile filter drawer not showing   | Verify CSS media queries are working                                |
| Database connection error          | Start MySQL in XAMPP, check `.env` settings                         |
| Protected route redirecting        | Check AuthContext and localStorage for token                        |
| 404 page not showing               | Ensure `*` route is last in Routes                                  |

## Contributing
**Create a new branch:**
- git checkout -b branch-name

**Commit your changes:**
- git add .
- git commit -m "add new feature"

**Push to repository:**
- git push origin branch-name

## Future Improvements
- Add Docker support
- Cloud deployment (Vercel + Render)
- Real-time notification system
- Advanced search filters with debouncing
- Email verification
- Password reset functionality
- Chat between employers and job seekers
- Resume upload functionality
- Job application tracking with timeline
- Dark mode support
- AI-powered job recommendations
- Smart matching score between candidate and job
- Interview scheduling system
- Mobile native apps (React Native)

## License

This project is for educational purposes.

## Goal

SmartHire Sprint 1 progress (Week 1-4) - Currently In Progress:

**Completed So Far:**

- React + Vite + Tailwind CSS frontend environment
- Responsive Navbar with role-based navigation and mobile drawer
- Responsive Footer with newsletter and social links
- Complete Homepage with hero section, search bar, featured jobs, and "How It Works"
- Reusable components: Button, Input, Tag, TagGroup, JobCard, CompanyCard
- Complete routing system with protected routes and 404 page
- MySQL database schema with 16+ tables and seed data
- Authentication context with JWT structure
- CSS variables for consistent theming
- Google Material Icons integration

**In Progress (Sprint 1 remaining tasks):**
- Jobs Listing Page integration with JobCard
- Job Details Page with similar jobs
- Companies Page with CompanyCard
- Login and Register page functionality
- Backend API development

**Current Setup Time:** Any developer can clone and run the frontend with mock data in under 10 minutes. Full backend integration will be completed by Sprint 2.