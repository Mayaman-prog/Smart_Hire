# Smart_Hire - Smart Job Portal System

![GitHub repo size](https://img.shields.io/github/repo-size/Mayaman-prog/Smart_Hire)
![GitHub stars](https://img.shields.io/github/stars/Mayaman-prog/Smart_Hire?style=social)
![GitHub forks](https://img.shields.io/github/forks/Mayaman-prog/Smart_Hire?style=social)
![GitHub issues](https://img.shields.io/github/issues/Mayaman-prog/Smart_Hire)
![License](https://img.shields.io/badge/license-MIT-blue)

SmartHire is a full-stack job portal web application connecting job seekers, employers, and administrators. It is designed to be scalable, SEO-friendly, and production-ready.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Client Setup](#client-setup)
  - [Server Setup](#server-setup)
  - [Database Setup](#database-setup)
  - [Email Service Setup](#email-service-setup)
  - [Email Templates](#email-templates)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Job Routes](#job-routes)
  - [Application Routes](#application-routes)
  - [Saved Jobs Routes](#saved-jobs-routes)
  - [Saved Searches Routes](#saved-searches-routes)
  - [Company Routes](#company-routes)
  - [Admin Routes](#admin-routes)
- [Components Implemented](#components-implemented)
  - [Navbar Component](#navbar-component)
  - [Footer Component](#footer-component)
  - [HomePage Component](#homepage-component)
  - [JobsPage Component](#jobspage-component)
  - [JobDetailsPage Component](#jobdetailspage-component)
  - [CompaniesPage Component](#companiespage-component)
  - [CompanyDetailsPage Component](#companyetailspage-component)
  - [JobCard Component](#jobcard-component)
  - [CompanyCard Component](#companycard-component)
  - [Button Component](#button-component)
  - [Input Component](#input-component)
  - [Tag Component](#tag-component)
  - [TagGroup Component](#taggroup-component)
  - [LoginPage Component](#loginpage-component)
  - [RegisterPage Component](#registerpage-component)
  - [JobSeekerDashboard Component](#jobseekerdashboard-component)
  - [EmployerDashboard Component](#employerdashboard-component)
  - [AdminDashboard Component](#admindashboard-component)
  - [ProtectedRoute Component](#protectedroute-component)
  - [ScrollToTop Component](#scrolltotop-component)
  - [NotFoundPage Component](#notfoundpage-component)
- [Routing System](#routing-system)
- [Validation Utilities](#validation-utilities)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Goal](#goal)

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
- Email validation with real-time error messages
- Password show/hide toggle
- Remember me functionality (30 days session)
- Role-based redirects after login
- JWT token storage in localStorage/sessionStorage
- Success and error toast notifications
- Social login buttons (Google & LinkedIn - UI ready)

### Backend Features
- JWT authentication (register, login, profile)
- Password hashing with bcrypt (10 rounds)
- Input validation with express-validator
- Rate limiting (5 login attempts per 15 minutes)
- MySQL database with 16+ tables
- Transaction support for registration
- CORS configured for frontend
- Helmet.js for security headers
- Morgan for request logging

### Saved Searches Feature
- Job seekers can create, read, update, and delete saved search criteria.
- Table **`saved_searches`** stores search name, keyword, location, job type, salary range, alert frequency, and active status.
- Secured API endpoints (JWT‑protected) – users can only manage their own saved searches.
- Integrated with the job alert system: when a new job is posted, matching saved searches trigger email notifications to the respective job seekers.

### Email Service Features
- **Welcome email** sent automatically after user registration.
- **Application status update email** sent to job seekers when an employer changes the status of their application.
- Configurable via environment variables (SMTP host, port, user, password).
- Graceful error handling – email failures do not break the flow of registration or status updates.
- Test script to verify SMTP configuration (`server/scripts/test-email.js`).
- Uses **Resend** (or any SMTP provider) – high deliverability and free tier (3,000 emails/month).

#### Email Templates
Five responsive HTML email templates are used for different notifications. All templates are stored in `server/src/email-templates/`. Each template uses inline CSS for email client compatibility, includes a plain‑text fallback, and contains a clear call‑to‑action button.

| Template File                   | Purpose                                                       | Key Placeholders                                                                                                                                                                                 | CTA Button           |
| ------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `application-confirmation.html` | Sent to job seeker after applying                             | `{{user_name}}`, `{{job_title}}`, `{{company_name}}`, `{{job_location}}`, `{{job_type}}`, `{{salary_range}}`, `{{dashboard_url}}`                                                                | View My Applications |
| `status-change.html`            | Sent to job seeker when application status changes            | `{{user_name}}`, `{{job_title}}`, `{{company_name}}`, `{{new_status}}`, `{{status_color}}`, `{{status_message}}`, `{{dashboard_url}}`                                                            | View Details         |
| `new-job-alert.html`            | Sent to job seekers when a new job matches their saved search | `{{user_name}}`, `{{saved_search_name}}`, `{{job_title}}`, `{{company_name}}`, `{{job_location}}`, `{{job_type}}`, `{{salary_range}}`, `{{job_summary}}`, `{{job_url}}`, `{{manage_alerts_url}}` | View & Apply         |
| `new-applicant.html`            | Sent to employer when a job seeker applies                    | `{{company_name}}`, `{{job_title}}`, `{{applicant_name}}`, `{{applicant_email}}`, `{{applied_date}}`, `{{cover_letter_preview}}`, `{{applicants_url}}`                                           | Review Applicant     |
| `account-verification.html`     | Sent to new users for email confirmation (future feature)     | `{{user_name}}`, `{{verification_url}}`                                                                                                                                                          | Verify Email Address |


**Email Integration Flow:**

| Trigger                                | Template Called                                | Recipient            |
| -------------------------------------- | ---------------------------------------------- | -------------------- |
| User registers                         | `account-verification.html` (or welcome email) | New user             |
| Job seeker applies to a job            | `application-confirmation.html`                | Job seeker           |
| Job seeker applies to a job            | `new-applicant.html`                           | Employer             |
| Employer updates application status    | `status-change.html`                           | Job seeker           |
| New job posted (matching saved search) | `new-job-alert.html`                           | Matching job seekers |


All emails are sent asynchronously; failures are logged but do not break the main functionality.

### Component Features

#### Navbar

**Features:**
- Role-based navigation (Job Seeker, Employer, Admin, Guest)
- Active route highlighting with visual feedback
- User avatar dropdown menu with logout
- Mobile hamburger menu with slide-out drawer
- CSS modules styling with responsive breakpoints

#### Footer

**Features:**
- Responsive layout (4 columns desktop, 2 columns tablet, 1 column mobile)
- Quick links sections (Platform, For Employers, Support)
- Newsletter signup with email validation
- Toast notification for "Feature coming soon"
- Social media icons (LinkedIn, GitHub, Twitter, Facebook)
- Dynamic copyright year (auto-updates)
- Sticky to bottom using flexbox
- Dark theme background with white text

#### HomePage

**Features:**
- Hero section with gradient background and wave effect
- Call-to-action buttons (Search Jobs, Post a Job) with authentication check
- Search bar with keyword and location inputs using Google Material Icons
- Featured jobs section fetching from backend/API data
- Loading skeleton animation while fetching data
- Empty state when no featured jobs available
- Error state with retry button
- "How It Works" section with 3 steps and icons
- Fully responsive design (mobile, tablet, desktop)
- CSS variables for consistent theming
- Google Material Icons throughout

#### JobsPage

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
- Backend-driven filtering, sorting, and pagination

#### JobDetailsPage

**Features:**
- Dynamic job details fetching using URL parameters (useParams)
- Job header with title, company name (clickable), company logo, and relative posted date
- Metadata row displaying location, job type badge, salary range
- Detailed job description and requirements sections
- Job Overview card with date posted, job type, and salary
- About the Company card with description and view profile link
- SmartHire Match Insights for authenticated job seekers
- Apply Now button with authentication check (redirects to login if not logged in)
- Apply Now button disabled if already applied, shows loading state during submission
- Success toast notification on successful application
- Hide apply button if employer is viewing their own job
- Save Job button with heart icon toggle
- Share button that copies current job URL to clipboard with toast notification
- Similar Jobs section displaying related jobs based on job type
- Loading skeleton animation while fetching data
- Error state with 404 page for invalid job IDs
- Fully responsive design (mobile, tablet, desktop)
- CSS variables for consistent theming
- Google Material Icons throughout

#### CompaniesPage

**Features:**
- Company directory page displaying all registered companies
- Search bar to filter companies by name (real-time filtering)
- Clear search button to reset search
- Displays job count for each company (number of open positions)
- Responsive grid layout (4 columns desktop, 3 columns large tablet, 2 columns tablet, 1 column mobile)
- Company cards with logo, name, location, job count, and verified badge
- Click on any company card to navigate to company details page (`/companies/${id}`)
- Loading skeleton animation (8 cards) while fetching data
- Empty state when no companies match search
- Error state with retry button if API fails
- Fully responsive design for all screen sizes
- CSS variables for consistent theming
- Google Material Icons throughout

#### CompaniesDetailsPage

**Features:**
- Dynamic company details using useParams
- Company banner with gradient fallback
- Company logo, name, verified badge, location
- SmartHire Match Insights (skill alignment)
- Tabs: Open Positions and About
- Open Positions tab shows jobs using JobCard
- About tab with description and contact info
- Contact info: website, email, phone, address
- Map placeholder
- Loading skeleton and 404 error state

#### JobCard

**Features:**
- Displays job title, company name, and company logo (initials fallback)
- Location with pin icon
- Salary range formatting
- Colored job type tags
- Featured badge for premium jobs
- Save to wishlist functionality (heart icon)
- Click navigation to job details page (`/jobs/${id}`)
- Hover effects: scale transform (1.02), shadow increase, border color change

#### CompanyCard

**Features:**
- Company logo with initials fallback
- Company name, location, open jobs count
- Verified badge for verified companies
- Hover effects: scale transform (1.02), shadow increase, border color change
- Click navigation to company details page (`/companies/${id}`)

#### Button

**Features:**
- 5 variants: primary, secondary, danger, outline, ghost
- 3 sizes: sm, md, lg
- States: default, hover, active, disabled, loading (with spinner animation)
- Full width option
- Smooth transitions and focus rings

#### Input

**Features:**
- Supported types: text, email, password, number, textarea, select
- Label with required asterisk
- Placeholder support
- States: default, focus (blue border), error (red border + message), disabled, filled
- Password input with custom eye icon show/hide toggle
- Browser's native password eye icon hidden
- Textarea with min-height 100px

### Tag

**Features:**
- 6 color variants for different job types
- Removable option with X button
- Customizable text
- Rounded pill style
- Responsive design

### TagGroup

**Features:**
- Displays limited tags by default (configurable maxDisplay)
- "+X more" button to expand
- "Show less" button to collapse
- Responsive wrapping

#### LoginPage

**Features:**
- Email field with validation (required, valid email format)
- Password field with show/hide toggle (required, minimum 6 characters)
- "Remember Me" checkbox (30 days session persistence)
- Forgot password link (placeholder for future implementation)
- Registration link redirecting to `/register`
- Social login buttons (Google & LinkedIn) with "coming soon" toast notifications
- Submit button with loading state and spinner animation
- Role-based redirects after successful login
- JWT token storage in localStorage (remember me) or sessionStorage
- Success toast notification on login
- Error handling for 401, 403, 500 errors
- Validation errors displayed below fields
- Root error display for API errors
- Responsive design (desktop, tablet, mobile)
- Hero section with platform statistics (50k+ users, 10k+ companies, 95% match rate)
- Gradient background with animation
- Terms of Service and Privacy Policy links

#### RegisterPage

**Features:**
- Full name field with validation (required, min 2 characters, letters/spaces/hyphens/apostrophes only)
- Email field with validation (required, valid format)
- Password field (required, min 6 characters, must contain at least one number) – no show/hide toggle
- Confirm password field (required, must match password)
- Role dropdown (Job Seeker / Employer)
- Conditional Company Name field (appears only when Employer role is selected, required)
- Submit button with loading state and spinner animation
- Login link redirecting to `/login`
- On successful registration: success toast, redirect to `/login`
- Error handling:
  - 409 – "Email already exists"
  - 400 – Validation errors from API
- Validation errors displayed below each field
- Responsive design (desktop, tablet, mobile)
- Same hero section and styling as Login page
- Gradient background with animation
- Terms of Service and Privacy Policy links

#### JobSeekerDashboard

**Features:**
- Sidebar navigation with tabs: Overview, Applied Jobs, Saved Jobs, Profile
- Overview dashboard with:
  - Welcome message and profile strength statistic
  - Stats cards: Profile Strength, Applied, Interviewing, Offers
  - Recommended jobs section with AI‑matched job cards
  - Recent activity feed (interview invitations, status updates, profile views)
- Applied Jobs tab:
  - List of user’s job applications with status badges (pending, reviewed, interviewing, offered, rejected, hired)
  - Withdraw button for pending applications (with confirmation modal)
- Saved Jobs tab:
  - Display saved jobs with Apply Now and Remove buttons
- Profile tab:
  - Edit profile form (name, email, password change with current password verification)
  - Resume upload (PDF, DOC, DOCX)
- Fully integrated with backend APIs for applications, saved jobs, profile updates, recommended jobs, and notifications
- Loading skeletons and error toasts
- Responsive design (mobile, tablet, desktop)

#### EmployerDashboard

**Features:**
- Sidebar navigation with tabs: Overview, Post a Job, My Jobs, Applicants
- Overview dashboard with:
  - Stats cards: Total Applicants, Active Jobs, Interviews Scheduled, Pending Offers
  - Hiring Performance chart (job views vs. applications)
  - AI High‑Score Matches (top candidates with match percentage)
  - Recent activity feed
  - Recruiter tip section
- Post a Job multi‑step form:
  - Step 1: Basic Info (title, location, salary, job type, experience level)
  - Step 2: Details (description, requirements, responsibilities)
  - Step 3: Review and submit
- My Jobs tab:
  - List of all jobs with status (Active/Closed)
  - Edit, Close, Delete buttons
  - Edit job modal (pre‑filled form, update via PUT)
  - Delete with confirmation modal
  - Close job (set `is_active = false`)
- Applicants tab:
  - Filter applicants by job
  - Status badges (pending, reviewed, shortlisted, interviewing, offered, rejected, hired)
  - Status update buttons: Review, Shortlist, Reject, Hire (calls PUT to update status)
- Fully integrated with backend APIs for job CRUD and applicant management
- Loading skeletons and error toasts
- Responsive design (mobile, tablet, desktop)

#### AdminDashboard

**Features:**
- Sidebar navigation with tabs: Overview, User Management, Company Verifications, Job Moderation, Settings
- Overview dashboard with:
  - Stats cards: System Health, Monthly Recurring Revenue
  - Ecosystem Growth chart (User Registrations vs Job Postings)
  - Action Required card (pending company verifications)
  - System Health metrics (server load, API latency)
  - Critical System Events feed (real‑time platform activities)
  - Download Reports button
- User Management tab:
  - Search, filter, pagination for users
  - Ban/Unban user (PUT `/api/admin/users/:id/ban` / `/unban`)
  - Delete user (with confirmation modal)
- Company Verifications tab:
  - Search, pagination for companies
  - Verify company (PUT `/api/admin/companies/:id/verify`)
  - Delete company (with confirmation modal)
- Job Moderation tab:
  - Search, pagination for jobs
  - Feature/Unfeature job (PUT `/api/admin/jobs/:id/feature`)
  - Delete job (with confirmation modal)
- Settings tab (placeholder)
- Fully integrated with backend APIs
- Loading skeletons and success/error toasts
- Responsive design (mobile, tablet, desktop)

### ProtectedRoute Features

**Features:**
- Authentication guard for protected routes
- Role-based access control
- Redirects to login if not authenticated
- Redirects to home if role not authorized

### ScrollToTop Features

**Features:**
- Automatically scrolls to top of page on route change
- Improves user experience during navigation

### NotFoundPage Features

**Features:**
- 404 error page for unknown routes
- Friendly error message
- Link to return home

## Tech Stack
### Client
- **React 18.2.0** - UI Library
- **Vite 5.0.8** - Build tool and development server
- **React Router DOM 6.20.0** - Client-side routing
- **Axios 1.6.2** - HTTP client for API requests
- **React Hook Form 7.48.2** - Form handling and validation
- **React Hot Toast 2.4.1** Toast notifications
- **CSS3** - Custom styling with CSS variables
- **Google Fonts Icons** - Icon system
- **Recharts** - Charting library for admin dashboard

### Server
- Node.js 18.x
- Express.js 4.18.2
- JWT Authentication (jsonwebtoken)
- bcryptjs for password hashing
- express-rate-limit for rate limiting
- CORS, Helmet, Morgan
- MySQL2
- Nodemailer for email sending

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
│   │   │   │   ├── Toast
│   │   │   │   │   ├── Toast.jsx
│   │   │   │   │   └── Toast.css
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
│   │   │   │   ├── JobDetailsPage.jsx
│   │   │   │   └── JobDetailsPage.css
│   │   │   ├── CompaniesPage/
│   │   │   │   ├── CompaniesPage.jsx
│   │   │   │   └── CompaniesPage.css
│   │   │   ├── CompanyDetailsPage/
│   │   │   │   ├── CompanyDetailsPage.jsx
│   │   │   │   └── CompanyDetailsPage.css
│   │   │   ├── LoginPage/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── LoginPage.css
│   │   │   ├── RegisterPage/
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── RegisterPage.css
│   │   │   ├── dashboard/
│   │   │   │   ├── jobseeker/
│   │   │   │   │   ├── JobSeekerDashboard.jsx
│   │   │   │   │   └── JobSeekerDashboard.css
│   │   │   │   └── employer/
│   │   │   │       ├── EmployerDashboard.jsx
│   │   │   │       └── EmployerDashboard.css
│   │   │   └── NotFoundPage/
│   │   │       ├── NotFoundPage.jsx
│   │   │       └── NotFoundPage.css
│   │   ├── services
│   │   │   └── api.js
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
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── email.js             # Nodemailer transporter setup
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── applicationController.js
│   │   │   ├── authController.js
│   │   │   ├── companyController.js
│   │   │   ├── employerController.js
│   │   │   ├── jobController.js
│   │   │   ├── notificationController.js
│   │   │   ├── savedJobsController.js
│   │   │   ├── savedSearchController.js
│   │   │   └── userController.js
│   │   ├── email-templates/
│   │   │   ├── account-verification.html
│   │   │   ├── application-confirmation.html
│   │   │   ├── new-applicant.html
│   │   │   ├── new-job-alert.html
│   │   │   ├── status-change.html
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── employerRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── savedJobsRoutesjs
│   │   │   ├── savedSearchRoutes.js
│   │   │   └── userRoutes.js
│   │   └── utils/
│   │       └── generateToken.js
│   ├── upload/
│   │   └── resume
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── scripts/
│   │   ├── setup-db.js
│   │   └── test-email.js          # Test email script
│   │   └── test-email-templates.js
│   │   └── test-saved-searches.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── docs/
├── ExampleCodeFiles/                # Reference code examples
|   ├── ComponentTestPage
|   |   ├── ComponentTestPage.jsx
|   |   └── ComponentTestPage.css
|   ├── TagTestPage
|   |   ├── TagTestPage.jsx
|   |   └── TagTestPage.css
|   ├── TestCardsPage
|   |   ├── TestCardsPage.jsx
|   |   └── TestCardsPage.css
└── README.md

## Setup Instructions

Follow these steps to run the project locally in under 15 minutes:

### Clone the Repository
- git clone https://github.com/Mayaman-prog/Smart_Hire.git
- cd Smart_Hire

### Client Setup
- cd client
- npm install
- npm run dev

#### Client will run on: `http://localhost:5173`

## Server Setup

### Open a new terminal:
- cd server
- npm install
- npm run dev

#### Server will run on: `http://localhost:5000`

## Database Setup (MySQL)
- Start MySQL (via XAMPP Control Panel)
- Create database:
`CREATE DATABASE smart_hire;`
`USE smart_hire;`

- Run Database Setup Script
`cd server`
`npm run setup-db`
- This creates all tables and inserts seed data.

## Email Service Setup

SmartHire uses **Nodemailer** with **Resend** (or any SMTP provider) to send transactional emails:

- **Welcome emails** on user registration.
- **Application status update emails** to job seekers.

### Configure email credentials

Add the following variables to your `server/.env` file:

**.env**
#### Email configuration (Resend example)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_YourApiKeyHere
EMAIL_FROM=onboarding@resend.dev
ADMIN_EMAIL=your-email@example.com   # for test script

- You can use any SMTP provider (e.g., Gmail, SendGrid, Brevo). For development, Ethereal (fake SMTP) or Resend is recommended.

### Test Email Service

After configuring .env, run:
- cd server
- node scripts/test-email.js

- If successful, you will see (Test email sent successfully.) and the email will be delivered (or captured in Ethereal/Mailtrap).

- Email sending is integrated into the registration and application status update flows. Failure to send an email does not break the main operation – errors are logged only.

## Email Templates

Five responsive HTML email templates are used for different notifications. ALl templates are stored in `server/src/email-templates/`.

| Template                        | Trigger                              | Recipient  |
| ------------------------------- | ------------------------------------ | ---------- |
| `application-confirmation.html` | Job seeker applies to job            | Job seeker |
| `status-change.html`            | Employer updates application status  | Job seeker |
| `new-job-alert.html`            | New job posted matching saved search | Job seeker |
| `new-applicant.html`            | Job seeker applies to job            | Employer   |
| `account-verification.html`     | User registers (future)              | New user   |

Each template uses inline CSS, is responsive, includes a plain‑text fallback, and contains a clear call‑to‑action button.

## Environment Variables

### Frontend .env (create in client/ folder)
**VITE_API_URL=** `http://localhost:5000/api`
**VITE_USE_MOCK_API=false**

### Backend .env (create in server/ folder)
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_hire
DB_PORT=3306

JWT_SECRET=super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

FRONTEND_URL=`http://localhost:5173`

# Email configuration – use your own SMTP credentials

SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_YourApiKeyHere
EMAIL_FROM=onboarding@resend.dev
ADMIN_EMAIL=your-email@example.com   # for test script only

## API Endpoints

### Authentication Routes (/api/auth)
| Method | Endpoint    | Description                                  | Access  |
| ------ | ----------- | -------------------------------------------- | ------- |
| POST   | `/register` | Register a new user (job_seeker or employer) | Public  |
| POST   | `/login`    | Login user, returns JWT token                | Public  |
| GET    | `/profile`  | Get current user profile (requires JWT)      | Private |

### Register (Job Seeker)
**POST** `/api/auth/register`
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "job_seeker"
}

### Register (Employer)
**POST** `/api/auth/register`
Content-Type: application/json
{
  "name": "Jane Smith",
  "email": "company@example.com",
  "password": "password123",
  "role": "employer",
  "companyName": "Tech Corp"
}

### Login
**POST** `/api/auth/login`
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "password123"
}

### Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "job_seeker",
      "company_id": null,
      "is_active": 1
    }
  }
}

### Get Profile (Authenticated)

**GET** `/api/auth/profile`
**Headers:** `Authorized: Bearer <token>`
**Response** (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "job_seeker",
      "company_id": null,
      "is_active": 1
    }
  }
}

### Error Response
- **400** – Validation failed (invalid input)
- **401** – Invalid email or password
- **403** – Account disabled
- **409** – Email already exists
- **429** – Too many login attempts (rate limit)
- **500** – Internal server error

## Run the Project
### Start server (Terminal 1)
- cd server
- npm run dev

### Start client (Terminal 2)
- cd client
- npm run dev

### Open browser at: `http://localhost:5173`

## API Endpoints

**Job Routes (/api/jobs)**
| Method | Endpoint            | Description                                | Access         |
| ------ | ------------------- | ------------------------------------------ | -------------- |
| GET    | `/jobs`             | Get jobs with filters, sorting, pagination | Public         |
| GET    | `/jobs/:id`         | Get single job details                     | Public         |
| GET    | `/jobs/me`          | Get employer jobs                          | Employer       |
| GET    | `/jobs/recommended` | Get recommended jobs                       | Job Seeker     |
| POST   | `/jobs`             | Create a new job                           | Employer       |
| PUT    | `/jobs/:id`         | Update a job                               | Employer/Admin |
| DELETE | `/jobs/:id`         | Delete a job                               | Employer/Admin |

**Application Routes (/api/applications)**
| Method | Endpoint                   | Description               | Access     |
| ------ | -------------------------- | ------------------------- | ---------- |
| GET    | `/applications/me`         | Get user applications     | Job Seeker |
| GET    | `/applications/employer`   | Get employer applicants   | Employer   |
| POST   | `/applications`            | Submit job application    | Job Seeker |
| PUT    | `/applications/:id/status` | Update application status | Employer   |
| DELETE | `/applications/:id`        | Withdraw application      | Job Seeker |

**Saved Jobs Routes (/api/saved-jobs)**
| Method | Endpoint             | Description      | Access     |
| ------ | -------------------- | ---------------- | ---------- |
| GET    | `/saved-jobs`        | Fetch saved jobs | Job Seeker |
| POST   | `/saved-jobs`        | Save a job       | Job Seeker |
| DELETE | `/saved-jobs/:jobId` | Remove saved job | Job Seeker |

**Saved Searches Routes (`/api/saved-searches`)**
| Method | Endpoint            | Description                     | Access     |
| ------ | ------------------- | ------------------------------- | ---------- |
| GET    | /saved-searches     | Get all saved searches for user | Job Seeker |
| POST   | /saved-searches     | Create a new saved search       | Job Seeker |
| PUT    | /saved-searches/:id | Update a saved search           | Job Seeker |
| DELETE | /saved-searches/:id | Delete a saved search           | Job Seeker |

**Create saved search**
**POST** `/api/saved-searches`
**Authorization:** `Bearer <token>`
**Content-Type:** `application/json`

{
  "name": "Remote React Jobs",
  "keyword": "React",
  "location": "Remote",
  "job_type": "full-time",
  "salary_min": 80000,
  "alert_frequency": "daily"
}

**Company Routes (/api/companies)**
| Method | Endpoint         | Description                  | Access |
| ------ | ---------------- | ---------------------------- | ------ |
| GET    | `/companies`     | Fetch all companies          | Public |
| GET    | `/companies/:id` | Fetch single company details | Public |

**Admin Routes (/api/admin)**
| Method | Endpoint                  | Description               | Access |
| ------ | ------------------------- | ------------------------- | ------ |
| GET    | `/admin/users`            | Fetch all users           | Admin  |
| PATCH  | `/admin/users/:id/toggle` | Toggle user active status | Admin  |
| GET    | `/admin/jobs`             | Fetch all jobs            | Admin  |
| DELETE | `/admin/jobs/:id`         | Delete job                | Admin  |
| GET    | `/admin/companies`        | Fetch all companies       | Admin  |
| GET    | `/admin/stats/overview`   | Fetch dashboard analytics | Admin  |

## Components Implemented

### Navbar Implementation
**Location:** `client/src/components/common/Navbar.jsx`

# Role-Based Navigation
| User Role      | Menu Items                                 |
| ---------------| -------------------------------------------|
| **Job Seeker** | Home, Jobs, Companies, Dashboard           |
| **Employer**   | Home, Jobs, Companies, Dashboard, Post Job |
| **Admin**      | Home, Jobs, Companies, Admin Panel         |
| **Guest**      | Home, Jobs, Companies, Login, Register     |

## Footer Implementation
**Location:** `client/src/components/common/Footer/Footer.jsx`

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
**Location:** `client/src/pages/HomePage/HomePage.jsx`

**File Structure:**
client/src/pages/HomePage/
├── HomePage.jsx
└── HomePage.css

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

**File Structure:**
client/src/pages/JobsPage/
├── JobsPage.jsx
└── JobsPage.css

**Filter Sidebar:**
- Job Type: Full-time, Part-time, Remote, Contract, Internship (colored buttons)
- Location: Text input with placeholder
- Salary Range: Min/Max number inputs with visual progress bar

**Mobile Features:**
- Filter button above job cards
- Slide-in filter drawer
- Full-width job cards
- Stacked search bar

#### JobDetailsPage Component
**Location:** `client/src/pages/JobDetailsPage/JobDetailsPage.jsx`

**File Structure:**
client/src/pages/JobDetailsPage/
├── JobDetailsPage.jsx
└── JobDetailsPage.css

**Smart Features:**
- SmartHire Match Insights: Shows match percentage and personalized feedback for job seekers
- Job recommendations based on similar job types
- Local storage persistence for saved jobs and applied jobs tracking

**Authentication Integration:**
- Unauthenticated users clicking "Apply Now" are redirected to login page
- Apply button disabled for employers viewing their own jobs
- Save job functionality works for all users (localStorage fallback)

**API Integration (Mock - Ready for Backend):**
- GET `/api/jobs/:id` - Fetch single job details
- POST `/api/applications` - Submit job application
- GET `/api/jobs?similar=true&jobId={id}` - Fetch similar jobs

**Responsive Breakpoints:**
| Screen Size               | Layout                               |
| --------------------------|--------------------------------------|
| **Desktop (>1024px)**     | Two columns (main content + sidebar) |
| **Tablet (768px–1024px)** | Two columns, adjusted spacing        |
| **Mobile (<768px) **      | Single column, stacked layout        |


**Page Sections:**
| Section        | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| Match Insights | SmartHire AI match percentage (visible only to job seekers) |
| Job Header     | Title, company, logo, posted date, action buttons           |
| Apply Section  | Prominent Apply Now button with states                      |
| Metadata Grid  | Location, job type, salary, experience level                |
| Main Content   | The Role, Key Responsibilities, Requirements, Benefits      |
| Sidebar        | Job Overview, About Company, Share/Print actions            |
| Similar Jobs   | 3 related job cards                                         |

**Action Buttons:**
| Button    | Function               | State                                          |
| --------- | ---------------------- | ---------------------------------------------- |
| Save Job  | Toggle save/unsave job | Heart outline (unsaved) / filled heart (saved) |
| Share     | Copy URL to clipboard  | Shows toast "Link copied!"                     |
| Print     | Print job details      | Browser print dialog                           |
| Apply Now | Submit application     | Default / Loading / Disabled (applied)         |

**Error Handling:**
- 404 page when job ID is invalid
- Loading skeleton while fetching data
- Error message with retry option
- Toast notifications for user actions

#### CompaniesPage Component
**Location:** `client/src/pages/CompaniesPage/CompaniesPage.jsx`

**File Structure:**
client/src/pages/CompaniesPage/
├── CompaniesPage.jsx
└── CompaniesPage.css

**Search Functionality:**
- Real-time filtering as user types
- Case-insensitive search
- Shows number of companies found
- Clear button to reset search

**Responsive Breakpoints:**
| Screen Size                     | Columns   |
| --------------------------------| ----------|
| **Desktop (>1200px)**           | 4 columns |
| **Large Tablet (992px–1200px)** | 3 columns |
| **Tablet (768px–992px)**        | 2 columns |
| **Mobile (<768px)**             | 1 column  |

**API Integration (Mock - Ready for Backend):**
- GET `/api/companies` - Fetch all companies
- GET `/api/companies/:id` - Fetch single company details
- GET `/api/jobs?companyId={id}` - Fetch jobs for specific company

## CompaniesDetailsPage Component
**Location:** `client/src/pages/CompanyDetailsPage/CompanyDetailsPage.jsx`

**File Structure:**
client/src/pages/CompanyDetailsPage/
├── CompanyDetailsPage.jsx
└── CompanyDetailsPage.css

**Smart Features:**
- SmartHire Match Insights: Shows skill alignment percentage based on user profile

**API Integration (Mock - Ready for Backend):**
- GET `/api/companies/:id` - Fetch single company details
- GET `/api/jobs?companyId={id}&isActive=true` - Fetch jobs for specific company

**Responsive Breakpoints:**
| Screen Size               | Layout                                          |
| --------------------------| ------------------------------------------------|
| **Desktop (>1024px)**     | Full width with tabs                            |
| **Tablet (768px–1024px)** | Adjusted spacing, 2 columns for contact grid    |
| **Mobile (<768px)**       | Stacked layout, smaller logo, 1 column for jobs |

**Page Sections:**
| Section        | Description                                             |
| -------------- | ------------------------------------------------------- |
| Match Insights | SmartHire AI skill alignment (visible to job seekers)   |
| Banner         | Company banner image with gradient placeholder          |
| Header         | Company logo, name, verified badge, location, job count |
| Tabs           | Open Positions and About tabs                           |
| Open Positions | Job cards grid showing all active jobs                  |
| About          | Company description, contact information, map           |

## JobCard Component
**Location:** `client/src/components/jobs/JobCard/JobCard.jsx`

**File Structure:**
client/src/components/jobs/JobCard/
├── JobCard.jsx
└── JobCard.css

**Job Type Colors:**
| Job Type   | Color  | CSS Class             |
| ---------- | ------ | --------------------- |
| Full-time  | Green  | `job-type-full-time`  |
| Part-time  | Yellow | `job-type-part-time`  |
| Remote     | Blue   | `job-type-remote`     |
| Contract   | Purple | `job-type-contract`   |
| Internship | Orange | `job-type-internship` |


## CompanyCard Component
**Location:** `client/src/components/companies/CompanyCard/CompanyCard.jsx`

**File Structure:**
client/src/components/companies/CompanyCard/
├── CompanyCard.jsx
└── CompanyCard.css

**Props:**
| Prop      | Type   | Default  | Description                                                                           |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------- |
| `company` | object | required | Company object with `id`, `name`, `initials`, `location`, `jobs_count`, `is_verified` |


## Button Component
**Location**: `client/src/components/common/Button/Button.jsx`

**File Structure:**
client/src/components/common/Button/
├── Button.jsx
└── Button.css

**Variants:**
- `primary` - Blue background, white text
- `secondary` - Gray background, white text
- `danger` - Red background, white text
- `outline` - Transparent background, blue border, blue text
- `ghost` - Transparent background, gray text

**Sizes:**
- `sm` - Small (padding: 6px 12px, font-size: 12px)
- `md` - Medium (padding: 8px 16px, font-size: 14px)
- `lg` - Large (padding: 12px 24px, font-size: 16px)

**States:**
- `default` - Normal state
- `hover` - Darker background on hover
- `active` - Scale transform on click
- `disabled` - Opacity 0.5, cursor not-allowed
- `loading` - Shows spinner animation, text "Loading..."

**Props:**
| Prop        | Type     | Default   | Description                               |
| ----------- | -------- | --------- | ----------------------------------------- |
| `variant`   | string   | `primary` | Button style variant                      |
| `size`      | string   | `md`      | Button size                               |
| `isLoading` | boolean  | `false`   | Shows loading spinner                     |
| `disabled`  | boolean  | `false`   | Disables button                           |
| `onClick`   | function | —         | Click handler                             |
| `type`      | string   | `button`  | Button type (`button`, `submit`, `reset`) |
| `fullWidth` | boolean  | `false`   | Makes button take full width              |
| `children`  | node     | —         | Button content (text, icon, etc.)         |

## Input Component

**Location:** `client/src/components/common/Input.jsx`

**File Structure:**
client/src/components/common/Input/
├── Input.jsx
└── Input.css

**Supported Types:**
- `text` - Text input
- `email` - Email input with validation
- `password` - Password input with eye icon toggle
- `number` - Number input
- `textarea` - Multi-line text input
- `select` - Dropdown select

**States:**
- `default` - Normal state (gray border)
- `focus` - Blue border with shadow
- `error` - Red border with error message
- `disabled` - Gray background, opacity 0.7
- `filled` - Green border when value exists

**Props:**
| Prop                 | Type     | Default | Description                              |
| -------------------- | -------- | ------- | ---------------------------------------- |
| `label`              | string   | —       | Input label text                         |
| `type`               | string   | `text`  | Input type                               |
| `name`               | string   | —       | Input name attribute                     |
| `value`              | any      | —       | Input value                              |
| `onChange`           | function | —       | Change handler                           |
| `error`              | string   | —       | Error message                            |
| `placeholder`        | string   | —       | Placeholder text                         |
| `required`           | boolean  | `false` | Shows required asterisk                  |
| `disabled`           | boolean  | `false` | Disables input                           |
| `rows`               | number   | `4`     | Number of rows (for textarea)            |
| `options`            | array    | `[]`    | Options for select dropdown              |
| `showPasswordToggle` | boolean  | `true`  | Shows/hides eye icon for password fields |

## Tag Component
**Location:** `client/src/components/common/Tag/Tag.jsx`

**File Structure:**
client/src/components/common/Tag/
├── Tag.jsx
└── Tag.css

**Color Variants:**

| Type       | Color  | CSS Class        |
| ---------- | ------ | ---------------- |
| full-time  | Green  | `tag-full-time`  |
| part-time  | Yellow | `tag-part-time`  |
| remote     | Blue   | `tag-remote`     |
| contract   | Purple | `tag-contract`   |
| internship | Orange | `tag-internship` |
| featured   | Gold   | `tag-featured`   |

**Props:**
| Prop        | Type     | Default | Description                  |
| ----------- | -------- | ------- | ---------------------------- |
| `type`      | string   | —       | Tag type (determines color)  |
| `children`  | node     | —       | Tag content                  |
| `removable` | boolean  | `false` | Shows remove (✕) button      
| `onRemove`  | function | —       | Handler for removing the tag |

## TagGroup Component
**Location:** `client/src/components/common/TagGroup/TagGroup.jsx`

**File Structure:**
client/src/components/common/TagGroup/
├── TagGroup.jsx
└── TagGroup.css

**Props:**
| Prop         | Type    | Default  | Description                        |
| ------------ | ------- | -------- | ---------------------------------- |
| `tags`       | array   | required | Array of tag objects               |
| `maxDisplay` | number  | `3`      | Max tags to show before collapsing |
| `showExpand` | boolean | `true`   | Shows expand/collapse button       |

### LoginPage Component
**Location:** `client/src/pages/LoginPage/LoginPage.jsx`

**File Structure:**
client/src/pages/LoginPage/
├── LoginPage.jsx
└── LoginPage.css

**Form Validation:**
| Field    | Validation Rules               | Error Message                                                     |
| -------- | ------------------------------ | ----------------------------------------------------------------- |
| Email    | Required, valid email format   | "Email is required" / "Please enter a valid email address"        |
| Password | Required, minimum 6 characters | "Password is required" / "Password must be at least 6 characters" |

**Responsive Breakpoints:**
| Screen Size              | Hero Section | Form Layout  | Social Buttons |
| ------------------------ | ------------ | ------------ | -------------- |
| **Desktop (>968px)**     | Visible      | Side by side | Horizontal     |
| **Tablet (768px–968px)** | Visible      | Stacked      | Horizontal     |
| **Mobile (<768px)**      | Hidden       | Full width   | Vertical       |

**Test Credentials:**
| Role       | Email                                                 | Password    | Dashboard             |
| ---------- | ----------------------------------------------------- | ----------- | --------------------- |
| Job Seeker | [jobseeker@example.com](mailto:jobseeker@example.com) | password123 | `/dashboard/seeker`   |
| Employer   | [employer@example.com](mailto:employer@example.com)   | password123 | `/dashboard/employer` |
| Admin      | [admin@example.com](mailto:admin@example.com)         | password123 | `/dashboard/admin`    |

### RegisterPage Component
**Location:** `client/src/pages/RegisterPage/RegisterPage.jsx`

**File Structure:**
client/src/pages/RegisterPage/
├── RegisterPage.jsx
└── RegisterPage.css

**Form Validation:**
| Field            | Validation Rules                                                          | Error Message                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Full Name        | Required, min 2 chars, letters/spaces/hyphens/apostrophes only            | "Full name is required" / "Name must be at least 2 characters" / "Name can only contain letters, spaces, hyphens, and apostrophes" |
| Email            | Required, valid email format                                              | "Email is required" / "Invalid email address"                                                                                      |
| Password         | Required, min 6 chars, at least 1 number                                  | "Password is required" / "Password must be at least 6 characters" / "Password must contain at least one number"                    |
| Confirm Password | Required, must match password                                             | "Please confirm your password" / "Passwords do not match"                                                                          |
| Company Name     | Required only if role = employer                                          | "Company name is required for employers"                                                                                           |

**Conditional Logic:**
- Company Name field appears only when Employer role is selected
- Field is removed when switching back to Job Seeker

**Responsive Breakpoints:**
| Screen Size              | Hero Section | Form Layout |
| ------------------------ | ------------ | ----------- |
| **Desktop (>968px)**     | Visible      | Side by side|
| **Tablet (768px–968px)** | Visible      | Stacked     |
| **Mobile (<768px)**      | Hidden       | Full width  |

**API Integration (Live Backend):**
- POST `/api/auth/register` - Register new user
- Returns success toast and redirects to `/login`

### JobSeekerDashboard Component

**Location:** `client/src/pages/dashboard/jobseeker/JobSeekerDashboard.jsx`

**File Structure:**
client/src/pages/dashboard/jobseeker/
├── JobSeekerDashboard.jsx
└── JobSeekerDashboard.css

**Stats Cards:**
| Stat              | Description                          |
| ----------------- | ------------------------------------ |
| Profile Strength  | Percentage of profile completeness   |
| Applied           | Total number of applications         |
| Interviewing      | Applications in interviewing stage   |
| Offers            | Applications that received an offer  |

**Application Status Badges:**
| Status        | Color   | CSS Class           |
| ------------- | ------- | ------------------- |
| pending       | Yellow  | `status-pending`    |
| reviewed      | Blue    | `status-reviewed`   |
| offered       | Green   | `status-offered`    |
| rejected      | Red     | `status-rejected`   |
| hired         | Green   | `status-hired`      |

**LocalStorage Keys Used:**
- `applied_{userId}` – stores applied job IDs (used by JobDetailsPage and dashboard)
- `saved_jobs_{userId}` – stores saved job IDs (used by JobDetailsPage and dashboard)
- `user` – stores user object (name, email, role)

**API Integration (Live Backend):**
- `GET /api/applications/me` – fetch user’s applications
- `DELETE /api/applications/:id` – withdraw application
- `GET /api/saved-jobs` – fetch saved jobs
- `DELETE /api/saved-jobs/:jobId` – remove saved job
- `GET /api/saved-searches` – fetch saved searches
- `POST /api/saved-searches` – create saved search
- `PUT /api/saved-searches/:id` – update saved search
- `DELETE /api/saved-searches/:id` – delete saved search
- `PUT /api/users/profile` – update profile
- `POST /api/users/resume` – upload resume
- GET `/api/jobs/recommended` – fetch recommended jobs
- GET `/api/notifications` – fetch notifications

**Responsive Breakpoints:**
| Screen Size              | Layout                         |
| ------------------------ | ------------------------------ |
| **Desktop (>1024px)**    | Sidebar + main content (2‑col) |
| **Tablet (768px–1024px)**| Sidebar collapses, full width  |
| **Mobile (<768px)**      | Stacked layout                 |

### EmployerDashboard Component
**Location:** `client/src/pages/dashboard/employer/EmployerDashboard.jsx`

**File Structure:**
client/src/pages/dashboard/employer/
├── EmployerDashboard.jsx
└── EmployerDashboard.css

**Stats Cards:**
| Stat                 | Description                        |
| -------------------- | ---------------------------------- |
| Total Applicants     | All applications received          |
| Active Jobs          | Number of currently active jobs    |
| Interviews Scheduled | Applications in interviewing stage |
| Pending Offers       | Applications with offers sent      |

**Application Status Badges**
| Status       | Color  | CSS Class             |
| ------------ | ------ | --------------------- |
| pending      | Yellow | `status-pending`      |
| reviewed     | Blue   | `status-reviewed`     |
| shortlisted  | Green  | `status-shortlisted`  |
| rejected     | Red    | `status-rejected`     |
| hired        | Green  | `status-hired`        |

**LocalStorage Keys Used:**
- `mock_employer_jobs_{companyId}` – stores employer’s jobs
- `mock_employer_applicants_{companyId}` – stores applicants for the company’s jobs
- `user` – stores user object (name, email, role, company_name)

**API Integration (Live Backend):**
- `GET /api/jobs/me` – fetch employer’s jobs
- `POST /api/jobs` – create a new job
- `PUT /api/jobs/:id` – update job
- `DELETE /api/jobs/:id` – delete job
- `GET /api/applications/employer` – fetch applicants
- `PUT /api/applications/:id/status` – update application status

**Responsive Breakpoints:**
| Screen Size               | Layout                         |
| ------------------------- | ------------------------------ |
| **Desktop (>1024px)**     | Sidebar + main content (2-col) |
| **Tablet (768px–1024px)** | Sidebar collapses, full width  |
| **Mobile (<768px)**       | Stacked layout                 |


### AdminDashboard Component

**Location:** `client/src/pages/dashboard/admin/AdminDashboard.jsx`

**File Structure:**
client/src/pages/dashboard/admin/
├── AdminDashboard.jsx
└── AdminDashboard.css

**Stats Cards (Overview):**
| Stat           | Description                |
| -------------- | -------------------------- |
| Total Users    | Total registered users     |
| Active Users   | Users currently active     |
| Total Jobs     | Total jobs in the platform |
| Active Jobs    | Jobs currently active      |
| Companies      | Total registered companies |
| Inactive Users | Users currently inactive   |


**Status Badges (Tables):**
| Type     | Color | CSS Class               |
| -------- | ----- | ----------------------- |
| Active   | Green | `status-badge active`   |
| Inactive | Red   | `status-badge inactive` |


**LocalStorage Keys Used:**
- `mock_admin_users` – stores all platform users
- `mock_admin_companies` – stores all companies
- `mock_admin_jobs` – stores all jobs

**API Integration (Live Backend):**
- GET `/api/admin/users` – fetch all users
- PATCH `/api/admin/users/:id/toggle` – toggle user active status
- GET `/api/admin/jobs` – fetch all jobs
- DELETE `/api/admin/jobs/:id` – delete job
- GET `/api/admin/companies` – fetch all companies
- GET `/api/admin/stats/overview` – fetch dashboard analytics

**Responsive Breakpoints:**
| Screen Size               | Layout                                     |
| ------------------------- | ------------------------------------------ |
| **Desktop (>1024px)**     | Sidebar + main content (2‑col)             |
| **Tablet (768px–1024px)** | Sidebar collapses, full width              |
| **Mobile (<768px)**       | Stacked layout, tables scroll horizontally |

### ProtectedRoute Component

**Location:** `client/src/components/auth/ProtectedRoute.jsx`

**File Structure:**
client/src/components/auth/
└── ProtectedRoute.jsx

**Props:**
| Prop           | Type  | Default  | Description                                |
| -------------- | ----- | -------- | ------------------------------------------ |
| `children`     | node  | required | Components to render if authorized         |
| `allowedRoles` | array | `[]`     | Array of roles allowed to access the route |

### ScrollToTop Component

**Location:** `client/src/components/common/ScrollToTop.jsx`

**File Structure:**
client/src/components/common/
└── ScrollToTop.jsx

**Purpose:** Automatically scrolls to top of page on route change.

### NotFoundPage Component

**Location:** `client/src/pages/NotFoundPage/NotFoundPage.jsx`

**File Structure:**
client/src/pages/NotFoundPage/
├── NotFoundPage.jsx
└── NotFoundPage.css

**Purpose:** 404 page displayed when user navigates to non-existent route.

## Routing System
**Location:** `client/src/App.jsx`

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
**Location:** `client/src/utils/validators.js`

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
|---------------------------|-----------------------------------------------|---------|
| **companies**              | Company profiles                              | 3       |
| **users**                  | User accounts (job seekers, employers, admin) | 5       |
| **jobs**                   | Job postings                                  | 5       |
| **applications**           | Job applications                              | 5       |
| **saved_jobs**             | Jobs saved by users                           | 3       |
| **saved_searches**         | Saved job search criteria with alerts         | 3       |
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

| Issue                                     | Solution                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Navbar items squished                     | Restart Vite: `rm -rf node_modules/.vite && npm run dev`                |
| CSS not applying                          | Check import paths in component files                                   |
| JobCard not showing                       | Verify API response shape and component props                           |
| Footer not sticky                         | Ensure layout uses `min-height: 100vh` and `flex-direction: column`     |
| Form validation not working               | Check `validators.js` path in imports                                   |
| HomePage featured jobs not showing        | Ensure featured jobs exist in database                                  |
| Search redirect not working               | Check AuthContext and route guards                                      |
| Icons not showing                         | Ensure Google Fonts link is added in `index.html`                       |
| Filters not working                       | Check URL query params, backend filters, and state management           |
| Mobile filter drawer not showing          | Verify CSS media queries are working                                    |
| Apply button not working                  | Check authentication status and user role                               |
| Similar jobs not showing                  | Verify similar jobs backend query                                       |
| Company search not working                | Ensure companies endpoint returns valid data                            |
| Company cards not showing                 | Check CompanyCard component import                                      |
| Company details not showing               | Verify company ID in URL and companies endpoint                         |
| Database connection error                 | Start MySQL in XAMPP and check `.env` configuration                     |
| Protected route redirecting               | Check AuthContext and token storage                                     |
| 404 page not showing                      | Ensure `*` route is last in Routes                                      |
| Login not working                         | Ensure correct test credentials are used                                |
| Toast notifications not showing           | Verify `react-hot-toast` is installed and `<Toaster />` is in `App.jsx` |
| 500 Internal Server Error                 | Check server terminal for detailed error; verify database tables exist  |
| JWT_SECRET missing                        | Add `JWT_SECRET` to `.env` (minimum 32 characters)                      |
| Rate limit exceeded                       | Wait 15 minutes or restart server                                       |
| Apply button stays enabled after applying | Verify application status is returned correctly from backend            |
| Saved jobs not appearing in dashboard     | Verify `saved_jobs` routes and API response shape                       |
| Charts not loading                        | Verify Recharts is installed and `/api/admin/stats/overview` works      |
| Email not sending                         | Check SMTP credentials in `.env`; run `node scripts/test-email.js`      |
| Email configuration error                 | Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are correct   |

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

SmartHire Sprint 1-2 progress - Currently In Progress:

**Completed So Far:**

- React + Vite + CSS frontend environment
- Responsive Navbar with role-based navigation and mobile drawer
- Responsive Footer with newsletter and social links
- Complete Homepage with hero section, search bar, featured jobs, and "How It Works"
- Complete Jobs Page with debounced search, URL query sync, filters, pagination, clear filters, sorting, and backend integration
- Complete Job Details Page with apply flow, duplicate prevention, save flow, similar jobs, and live backend integration
- Complete Companies Page with search, responsive grid, and company cards
- Complete Company Details Page with tabs, open positions, and about section
- Complete Login Page with email/password validation, remember me, and role-based redirects
- Complete Register Page with full name, email, password, confirm password, role dropdown, conditional company name, and validation
- Complete Backend JWT Authentication (register, login, profile) with bcrypt, express-validator, and rate limiting
- Complete Job Seeker Dashboard with overview, applied jobs, saved jobs, profile edit, resume upload, and notifications using live backend APIs
- Complete Employer Dashboard with overview, job creation, edit/delete, activate/deactivate, and applicant management using live backend APIs
- Complete Admin Dashboard with users, jobs, companies, filters, pagination, and analytics charts using live backend APIs
- Email service integration – automated welcome emails and application status updates using Nodemailer + Resend
- Five fully responsive HTML email templates (application confirmation, status change, new job alert, new applicant, account verification)
- Saved searches CRUD API with JWT‑protected endpoints, integrated with job alert system
- Reusable components: Button, Input, Tag, TagGroup, JobCard, CompanyCard
- Complete routing system with protected routes and 404 page
- MySQL database schema with 16+ tables and seed data
- Authentication context with JWT structure
- CSS variables for consistent theming
- Google Material Icons integration
- Admin analytics charts using Recharts

**Frontend–Backend Integration Completed:**

- Authentication APIs
- Job CRUD APIs
- Application APIs
- Saved Jobs APIs
- Saved Searches APIs
- Company APIs
- Admin APIs
- Dashboard analytics APIs
- Backend-driven filtering, sorting, and pagination

**Current Setup Time:** Any developer can clone and run the frontend with mock data in under 10 minutes.