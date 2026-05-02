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
  - [Core Features](#core-features)
  - [Backend Features](#backend-features)
    - [Cover Letters](#cover-letters)
    - [FULLTEXT Search](#fulltext-search)
    - [Typo Tolerance & Autocomplete](#typo-tolerance--autocomplete)
    - [Resume Parsing & CRUD](#resume-parsing-crud)
    - [Admin Reports Queue UI](#admin-reports-queue-ui)
  - [Saved Searches Feature](#saved-searches-feature)
  - [Background Email Queue](#background-email-queue)
  - [Email Rate Limiting & Retry Logic](#email-rate-limiting--retry-logic)
  - [Email Service Features](#email-service-features)
  - [Daily Job Alert Cron Job](#daily-job-alert-cron-job)
  - [Notify Reporter on Resolution](#notify-reporter-on-resolution)
  - [ResumeUpload Component](#resumeupload-component)
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
  - [Cover Letters Routes](#cover-letters-routes)
  - [Company Routes](#company-routes)
  - [Admin Routes](#admin-routes)
  - [Reports Routes](#reports-routes)
  - [Search Suggestions](#search-suggestions)
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
  - [ReportsTable Component](#reportstable-component)
  - [ProtectedRoute Component](#protectedroute-component)
  - [ScrollToTop Component](#scrolltotop-component)
  - [NotFoundPage Component](#notfoundpage-component)
  - [SaveSearchModal Component](#savesearchmodal-component)
  - [ResumeUpload Component](#resumeupload-component)
  - [Daily Job Alert Cron](#daily-job-alert-cron)(#savesearchmodal-component)
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
- Advanced job search with filters (job type, location, salary range) and FULLTEXT keyword search with relevance scoring
- Typo tolerance and autocomplete suggestions – corrects common typos (e.g., "reac" = "React") and shows suggestions as you type.
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
- Save this search button on jobs listing page to store current search filters with a name and alert frequency
- Drag-and-drop resume upload on profile with progress indicator, file validation, and delete functionality
- Automatic resume parsing (PDF/DOCX) and auto‑filling of profile fields extracted data is stored in the `parsed_data` column of the `resumes` table and can be retrieved to pre‑fill the user's profile form.
- Cover Letters – Create, edit, delete, and set default cover letter templates directly in the Job Seeker Dashboard using a built-in rich text editor (bold, italic, bullet points, links). The default cover letter is automatically selected when applying to a job.
- Admin Reports Queue UI – Dedicated moderation panel with status filters, action buttons (Approve, Remove, Dismiss, Ban Employer), confirmation modal with resolution notes, and automated email notification to the reporter via background queue.

### Backend Features
- JWT authentication (register, login, profile)
- Password hashing with bcrypt (10 rounds)
- Input validation with express-validator
- Rate limiting (5 login attempts per 15 minutes)
- MySQL database with 27 tables
- Transaction support for registration
- CORS configured for frontend
- Helmet.js for security headers
- Morgan for request logging
- Job reporting with Redis rate limiting (5 reports per user per 24h)
- Admin analytics API endpoints (overview, timeline, popular, retention, KPI)
- Typo tolerance and autocomplete suggestions – SOUNDEX‑based term matching and prefix suggestions from `search_logs`.

#### Cover Letters
- **Table:** `cover_letters` (user_id, name, content, is_default, timestamps)
- **CRUD Endpoints** (JWT‑protected):
  - `GET /api/cover-letters` – Get all cover letters for the authenticated user.
  - `POST /api/cover-letters` – Create a new cover letter (name and content required).
  - `PUT /api/cover-letters/:id` – Update name and/or content (owner only).
  - `DELETE /api/cover-letters/:id` – Delete a cover letter (owner only).
  - `PUT /api/cover-letters/:id/default` – Set a cover letter as default (unsets others for the same user).
- **Business Rules:**
  - The first cover letter created is automatically set as default.
  - If the default cover letter is deleted, the most recently updated one becomes the new default.
  - The default cover letter is automatically selected when a job seeker applies to a job (frontend integration pending).

#### FULLTEXT Search
- **Index:** `ft_search` on `jobs(title, description, requirements)` for fast, relevant searching.
- **Search parameter:** `?search=React` – uses `MATCH() AGAINST()` in natural language mode.
- **Relevance scoring:** `relevance_score` column available in results when `search` is provided.
- **Sort by relevance:** `?sort=relevance` – orders results by relevance score descending.
- **Backward compatibility:** Legacy `keyword` parameter still works via `LIKE` queries.
- **Seamless integration:** Works with all existing filters (location, job type, salary range) and pagination.

#### Resume Parsing & CRUD
- **Parsing Libraries:** `pdf-parse-fork` (PDF) and `mammoth` (DOCX) extract structured text from uploaded resumes.
- **Extracted Fields:** Full name, email, phone number, skills list, work experience (title, company, dates, description), education (degree, institution, year).
- **Database Storage:** Parsed data is stored as a JSON object in the `parsed_data` column of the `resumes` table.
- **Full CRUD Endpoints** (all protected with JWT):
  - `POST /api/users/resume` – Upload, parse, and save a resume (automatically sets as primary).
  - `GET /api/users/resume` – Retrieve all resumes for the authenticated user.
  - `GET /api/users/resume/primary` – Get the primary resume’s parsed data.
  - `GET /api/users/resume/:id` – Get a single resume by ID.
  - `PUT /api/users/resume/:id` – Update resume metadata (`title`, `is_primary`).
  - `DELETE /api/users/resume/:id` – Delete a resume (and its file) – if primary, promotes the most recent resume.
  - `PUT /api/users/resume/:id/primary` – Set a specific resume as primary (unsets others).
- **File Storage:** Uploaded resumes are stored in `uploads/resumes/` with unique filenames.
- **Error Handling:** Graceful failure with user‑friendly error messages; malformed files are rejected.

#### Admin Reports Queue UI
- **Frontend:** Located entirely inside `AdminDashboard.jsx` (Reports tab, table, filters, action buttons, and confirmation modal) – no separate `ReportsTable.jsx` component needed.
- **Backend:** `PUT /api/admin/reports/:id/status` – Admin‑only endpoint to resolve job reports.
- **Workflow:**
  - Admin Dashboard → “Reports” section with a dedicated table.
  - Table filters: **Status** (Pending, Approved, Removed, Dismissed), **Reason** (Spam, Fraud, Inappropriate, Duplicate, Other), and **Date range**.
  - Each row displays: Job Title, Reporter, Reason, Status, and Action buttons.
  - Action buttons: **Approve** (keep job), **Remove** (soft‑delete job), **Dismiss** (no action), **Ban Employer** (bans the employer + removes all their active jobs).
  - **Confirmation Modal:** Opens when an action is clicked, includes an optional `resolution_notes` text field.
  - Upon confirmation, report status is updated in DB and job `is_active` toggled if necessary.
- **Email Notification:** After resolution, a background email is queued via Bull + Redis to notify the reporter using the `report-resolution.html` template.
- **Audit Logging:** All resolution actions are logged in the `audit_logs` table for compliance.
- **Rate Limiting:** 5 reports per user per 24 hours (Redis).
- **Duplicate Check:** One report per user per job.

### Saved Searches Feature
- Job seekers can create, read, update, and delete saved search criteria.
- Table `saved_searches` stores search name, keyword, location, job type, salary range, alert frequency, and active status.
- Secured API endpoints (JWT‑protected) – users can only manage their own saved searches.
- Integrated with the job alert system: when a new job is posted, matching saved searches trigger email notifications to the respective job seekers.

### Background Email Queue
All transactional emails are now queued and processed asynchronously using Bull and Redis.  
Email sending no longer blocks API responses – the server just enqueues a job and returns immediately.

| Component    | Technology / File        | Purpose                                                        |
| ------------ | ------------------------ | -------------------------------------------------------------- |
| Queue        | Bull + Redis             | Holds email jobs and processes them in the background          |
| Worker       | `workers/emailWorker.js` | Standalone Node.js process that picks up jobs and sends emails |
| Job logging  | `email_logs` table       | Stores job lifecycle (queued, processing, sent, failed)        |
| Queue helper | `addEmailJob(data)`      | Enqueues a job and inserts an initial log entry                |

**Key benefits:**
- API endpoints return instantly – email delivery does not delay the response.
- All email sending is retryable and logged.
- Worker runs independently from the Express server (no shared memory).

### Email Rate Limiting & Retry Logic
To avoid spam and improve reliability, the email queue has built‑in rate limiting and automatic retries.

- **Rate limiting (per user):**  
  Tracks the number of emails triggered by a user within a 60‑second window using Redis.  
  If a user exceeds 10 emails in that window, the request is rejected with a **429 Too Many Requests** response and the message *“Too many emails. Limit is 10 per minute.”*  
  The limit resets automatically after 60 seconds.

- **Retry & dead‑letter handling:**  
  When an email delivery fails, Bull automatically retries the job up to **3 times** with a custom backoff:
  - 1st retry after **1 minute**
  - 2nd retry after **5 minutes**
  - 3rd retry after **15 minutes**  
  If all attempts fail, the job is marked as permanently **failed**, and an alert email is sent to the administrator.

- **Logging:**  
  Every attempt is recorded in the `email_logs` table (`user_id`, `status`, `attempts`, `error_message`), so the full lifecycle of each email can be audited.

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
| Admin resolves a job report            | ``report-resolution.html``                     | Reporter             |

All emails are sent asynchronously; failures are logged but do not break the main functionality.

### Daily Job Alert Cron Job

**Features:**
- Node‑cron job scheduled every day at 8 AM.
- Scans all active saved searches with alert_frequency = 'daily'.
- Queries jobs created since the last run that match each search's criteria (keyword, location, job type, salary range).
- Builds a digest email with up to 20 matching jobs and sends it via the background email queue.
- Each email includes an unsubscribe link (unique token per saved search) that deactivates the search permanently.
- Stores the *ast‑run timestamp in the cron_state table to avoid duplicate alerts.

### Notify Reporter on Resolution

**Feature:**  
- When an admin resolves a job report (status changes to `approved`, `removed`, or `dismissed`), the reporter receives an automated email notification with the resolution outcome.

**How it works:**
- **Table:** `job_reports` (resolution fields: `resolved_at`, `resolved_by`, `resolution_notes`)
- **API Endpoint:** `PUT /api/admin/reports/:id/status` (admin‑only, JWT protected)
- **Status options:** `approved` (no action taken), `removed` (job soft‑deleted), `dismissed` (no violation found)
- **Side effect:** When `removed` is chosen, the job’s `is_active` flag is set to `0` (soft‑delete)
- **Email:** Queued via Bull + Redis using the `report-resolution.html` template, containing:
  - Reporter name
  - Job title
  - Reason for the report
  - Resolution label (e.g., "Job Removed")
  - Admin note (optional)
  - Dashboard link

**Email Template (`report-resolution.html`):**  
Five‑section responsive email with a clear resolution badge and a "Go to Dashboard" call‑to‑action. The email is queued asynchronously, respecting the user’s email rate limit (10 per minute). All resolution actions are logged in the `audit_logs` table.

**Admin UI Integration:**  
The `ReportsTable` component (used in Admin Dashboard) displays pending reports and provides **Resolve** buttons (Approve, Remove, Dismiss). When an admin takes action, the reporter is notified immediately via the background email queue.

**Benefits:**
- Transparency – reporters know that their report was reviewed and what action was taken.
- Reduces unnecessary follow‑up questions.
- Builds trust in the moderation system.

### Resume Upload 

**Features:**
- Drag‑and‑drop zone and click‑to‑browse file input (`.pdf`, `.doc`, `.docx`, max 5 MB).
- Client‑side validation: file type and size with toast error messages.
- Real‑time upload progress bar (simulated until backend integration).
- **Backend integration:** Sends file to `POST /api/users/resume` using `multipart/form-data`.
- On success, the backend parses the resume and stores the JSON in the `parsed_data` column of the `resumes` table.
- The primary resume’s parsed data can be retrieved via `GET /api/users/resume/primary` to auto‑fill the profile form.
- Delete Resume button removes the file from storage and clears the database record.
- Dynamic Profile Strength update when a resume is uploaded or deleted.
- Keyboard accessible (Enter/Space on dropzone triggers file picker).
- Responsive design with media queries.

### Navbar

**Features:**
- Role-based navigation (Job Seeker, Employer, Admin, Guest)
- Active route highlighting with visual feedback
- User avatar dropdown menu with logout
- Mobile hamburger menu with slide-out drawer
- CSS modules styling with responsive breakpoints

### Footer

**Features:**
- Responsive layout (4 columns desktop, 2 columns tablet, 1 column mobile)
- Quick links sections (Platform, For Employers, Support)
- Newsletter signup with email validation
- Toast notification for "Feature coming soon"
- Social media icons (LinkedIn, GitHub, Twitter, Facebook)
- Dynamic copyright year (auto-updates)
- Sticky to bottom using flexbox
- Dark theme background with white text

### HomePage

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

### JobsPage

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
- Save this search" button next to the search bar that opens a modal to save current filters (name pre‑filled with date, frequency Daily/Weekly), calls `POST /api/saved-searches`, and shows success/error toasts

### JobDetailsPage

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
- Report Job button (flag icon) – opens a modal to report the job (Spam, Fraud, Inappropriate, Duplicate, Other). Rate‑limited to 5 reports per user per 24 hrs duplicates prevented.
- Similar Jobs section displaying related jobs based on job type
- Dynamic job details fetching using URL parameters (useParams)
- Cover Letter Selection – When applying, a modal allows users to select from their saved cover letter templates, preview the HTML content, and edit it inline using a rich text editor before submitting the application with the final content.
- Loading skeleton animation while fetching data
- Error state with 404 page for invalid job IDs
- Fully responsive design (mobile, tablet, desktop)
- CSS variables for consistent theming
- Google Material Icons throughout

### CompaniesPage

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

### CompaniesDetailsPage

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

### JobCard

**Features:**
- Displays job title, company name, and company logo (initials fallback)
- Location with pin icon
- Salary range formatting
- Colored job type tags
- Featured badge for premium jobs
- Save to wishlist functionality (heart icon)
- Click navigation to job details page (`/jobs/${id}`)
- Hover effects: scale transform (1.02), shadow increase, border color change

### CompanyCard

**Features:**
- Company logo with initials fallback
- Company name, location, open jobs count
- Verified badge for verified companies
- Hover effects: scale transform (1.02), shadow increase, border color change
- Click navigation to company details page (`/companies/${id}`)

### Button

**Features:**
- 5 variants: primary, secondary, danger, outline, ghost
- 3 sizes: sm, md, lg
- States: default, hover, active, disabled, loading (with spinner animation)
- Full width option
- Smooth transitions and focus rings

### Input

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

### LoginPage

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

### RegisterPage

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

### JobSeekerDashboard

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
  - Drag‑and‑drop resume upload with real‑time progress bar, client‑side validation (PDF, DOC, DOCX, max 5 MB), delete functionality, and dynamic profile strength update
  - Auto‑fill profile fields from the parsed resume data after upload, the system extracts full name, email, phone, skills, work experience, and education, and pre‑populates the form for the user to review and save.
    - Cover Letters – A fully integrated section to manage cover letter templates: create, edit, delete, and set default using a rich text editor (bold, italic, bullet points, links). All operations are reflected instantly and sync with the backend via a dedicated API.
- Fully integrated with backend APIs for applications, saved jobs, profile updates, recommended jobs, and notifications
- Loading skeletons and error toasts
- Responsive design (mobile, tablet, desktop)

### EmployerDashboard

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

### AdminDashboard

**Features:**
- Sidebar navigation with tabs: Overview, User Management, Company Verifications, Job Moderation, Settings
- Overview dashboard with:
  - KPI cards displaying Total Users, Active Jobs, Applications, Pending Reports – each with percent change vs previous week (e.g., +12.5%) and color-coded badges
  - Line chart showing user growth over the last 30 days (new users per day) with hover tooltips
  - Bar chart showing jobs posted per day over the last 30 days with hover tooltips
  - Pie chart displaying job type distribution (Full‑time, Part‑time, Remote, Contract, Internship)
  - All charts built with Recharts and fully responsive (desktop, tablet, mobile)
  - Reports Table – A dedicated section to view and resolve job reports (see [Notify Reporter on Resolution](#notify-reporter-on-resolution) for details).
  - Date Range Picker: Presets (7/30/90 days) + custom range with date inputs – updates all charts on change.
  - Export CSV: Buttons for each chart (User Growth, Jobs/Day, Job Types) and each table (Users, Jobs, Companies, Reports).
  - Auto-Refresh: Toggle (off by default) with 5-minute interval and last refresh timestamp.
- User Management tab:
  - Search users by name or email
  - Filter users by role (Job Seeker, Employer, Admin) and status (Active / Inactive)
  - Pagination (6 users per page) with Previous/Next controls
  - Ban/Unban user (PUT /api/admin/users/:id/ban / /unban)
  - Delete user (with confirmation modal)
- Company Verifications tab:
  - Search companies by name or location
  - Pagination (6 companies per page) with Previous/Next controls
  - Verify company (PUT /api/admin/companies/:id/verify)
  - Delete company (with confirmation modal)
- Job Moderation tab:
  - Search jobs by title, company name, or location
  - Filter jobs by status (Active / Inactive) and job type (Full‑time, Part‑time, Remote, Contract, Internship)
  - Pagination (6 jobs per page) with Previous/Next controls
  - Feature/Unfeature job (PUT /api/admin/jobs/:id/feature)
  - Delete job (with confirmation modal)
- Reports Tab – Dedicated reports queue with filters (status, reason), action buttons (Approve, Remove, Dismiss, Ban Employer), confirmation modal with resolution notes, and email notification to reporter.
- Settings tab (placeholder for future features)
- Fully integrated with live backend APIs
- Loading skeletons and success/error toast notifications
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
- **Recharts** - Charting library for admin dashboard (line, bar, pie charts)

### Server
- **Node.js 18.x**
- **Express.js 4.18.2**
- **JWT Authentication** (jsonwebtoken)
- **bcryptjs** for password hashing
- **express-rate-limit** for rate limiting
- **CORS, Helmet, Morgan**
- **MySQL2**
- **Nodemailer** for email sending
- **Bull** (background job queue)
- **Redis** (message broker for Bull)
- **pdf-parse-fork** – PDF text extraction
- **mammoth** – DOCX text extraction

### Database
- MySQL 8.0 (via XAMPP)

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **MySQL** (v8 or higher)
- **Git**
- **XAMPP** (for MySQL)
- **Redis** (for the email queue)

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
│   │   │   │   ├── ResumeUpload/
│   │   │   │   │   ├── ResumeUpload.jsx
│   │   │   │   │   └── ResumeUpload.css
│   │   │   │   └── ScrollToTop.jsx
│   │   │   ├── jobs/
│   │   │   │   └── JobCard/
│   │   │   │       ├── JobCard.jsx
│   │   │   │       └── JobCard.css
│   │   │   ├── companies/
│   │   │   │   └── CompanyCard/
│   │   │   │       ├── CompanyCard.jsx
│   │   │   │       └── CompanyCard.css
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── SaveSearchModal/
│   │   │       ├── SaveSearchModal.jsx
│   │   │       └── SaveSearchModal.css
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
│   │   │   │   ├──employer/
│   │   │   │   |   ├── EmployerDashboard.jsx
│   │   │   │   |   └── EmployerDashboard.css
│   │   │   │   └── admin/
│   │   │   │       ├── AdminDashboard.jsx
│   │   │   │       └── AdminDashboard.css
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
│   │   │   └── email.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── applicationController.js
│   │   │   ├── authController.js
│   │   │   ├── companyController.js
│   │   │   ├── coverLetterController.js
│   │   │   ├── employerController.js
│   │   │   ├── jobController.js
│   │   │   ├── notificationController.js
│   │   │   ├── resumeController.js 
│   │   │   ├── savedJobsController.js
│   │   │   ├── searchSuggestionController.js
│   │   │   ├── savedSearchController.js
│   │   │   └── userController.js
│   │   ├── email-templates/
│   │   │   ├── account-verification.html
│   │   │   ├── application-confirmation.html
│   │   │   ├── new-applicant.html
│   │   │   ├── new-job-alert.html
│   │   │   ├── status-change.html
│   │   │   └── report-resolution.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── coverLetterRoutes.js
│   │   │   ├── employerRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── searchSuggestionRoutes.js
│   │   │   ├── savedJobsRoutesjs
│   │   │   ├── savedSearchRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── queues/
│   │   │   └── emailQueue.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── resumeParser.js
│   │   ├── cron/
│   │   │   └── dailyJobAlert.js
│   │   └── utils/
│   │       └── generateToken.js
│   ├── upload/
│   │   └── resume
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── scripts/
│   │   ├── setup-db.js
│   │   ├── test-email.js
│   │   ├── test-email-templates.js
│   │   ├── test-saved-searches.js
│   │   ├── test-email-queue-response-time.js
│   │   ├── test-reports.js
│   │   ├── test-KPI.js
│   │   ├── test-insert-resume.js
│   │   ├── test-parser-fork.js
│   │   ├── test-fulltext-search.js
│   │   ├── test-suggestions.js
│   │   ├── test-update-resume.js
│   │   ├── test-analytics.js
│   │   ├── test-report-resolution.js
│   │   └── test-cover-letters.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── Worker/
|   ├── emailWorker.js
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
- **Report resolution emails** to reporters.

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
| `report-resolution.html`        | Admin resolves a job report          | Reporter   |

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
| Method | Endpoint                           | Description                     | Access     |
| ------ | ---------------------------------- | ------------------------------- | ---------- |
| GET    | /saved-searches                    | Get all saved searches for user | Job Seeker |
| POST   | /saved-searches                    | Create a new saved search       | Job Seeker |
| PUT    | /saved-searches/:id                | Update a saved search           | Job Seeker |
| DELETE | /saved-searches/:id                | Delete a saved search           | Job Seeker |
| GET    | /saved-searches/unsubscribe/:token | Deactivate search by token      | Public     |

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

**Cover Letters Routes (/api/cover-letters)**
| Method | Endpoint                      | Description                                             | Access     |
| ------ | ----------------------------- | ------------------------------------------------------- | ---------- |
| GET    | /cover-letters                | Get all cover letters for the authenticated user        | Job Seeker |
| POST   | /cover-letters                | Create a new cover letter (name and content required)   | Job Seeker |
| PUT    | /cover-letters/:id            | Update name and/or content (owner only)                 | Job Seeker |
| DELETE | /cover-letters/:id            | Delete a cover letter (owner only)                      | Job Seeker |
| PUT    | /cover-letters/:id/default    | Set a cover letter as default (unsets others)           | Job Seeker |

**Create cover letter**
**POST** `/api/cover-letters`
**Authorization:** `Bearer <token>`
**Content-Type:** `application/json`

{
  "name": "My Cover Letter",
  "content": "Dear Hiring Manager,\n\nI am a passionate developer..."
}

**Company Routes (/api/companies)**
| Method | Endpoint         | Description                  | Access |
| ------ | ---------------- | ---------------------------- | ------ |
| GET    | `/companies`     | Fetch all companies          | Public |
| GET    | `/companies/:id` | Fetch single company details | Public |

**Admin Routes (/api/admin)**
| Method | Endpoint                     | Description                                                                             | Access |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------- | ------ |
| GET    | `/admin/users`               | Fetch all users                                                                         | Admin  |
| PATCH  | `/admin/users/:id/toggle`    | Toggle user active status                                                               | Admin  |
| GET    | `/admin/jobs`                | Fetch all jobs                                                                          | Admin  |
| DELETE | `/admin/jobs/:id`            | Delete job                                                                              | Admin  |
| GET    | `/admin/companies`           | Fetch all companies                                                                     | Admin  |
| GET    | `/admin/stats/overview`      | Fetch dashboard analytics                                                               | Admin  |
| GET    | `/admin/analytics/overview`  | Fetch overview totals (users, jobs, etc.)                                               | Admin  |
| GET    | `/admin/analytics/timeline`  | Daily counts (users, jobs, applications) last N days                                    | Admin  |
| GET    | `/admin/analytics/popular`   | Top job types, locations, categories                                                    | Admin  |
| GET    | `/admin/analytics/retention` | Retention data and weekly cohorts                                                       | Admin  |
| GET    | `/admin/analytics/kpi`       | KPI cards with percent change (Total Users, Active Jobs, Applications, Pending Reports) | Admin  |
| GET    | `/admin/reports`             | Fetch job reports (with filters & pagination)                                           | Admin  |
| GET    | `/admin/reports/stats`       | Get report statistics (pending, approved, removed, dismissed)                           | Admin  |
| GET    | `/admin/reports/:id`         | Get single report details                                                               | Admin  |
| PUT    | `/admin/reports/:id/status`  | Update report status (approved / removed / dismissed) + notify reporter                 | Admin  |

**Reports Routes (/api/reports)**
| Method | Endpoint    | Description                | Access         |
| POST   | `/reports`  | Submit a report for a job  | Authenticated  |

#### Analytics Endpoints (Admin‑only)
These endpoints are part of the admin routes (`/api/admin/analytics/…`). They require a valid admin JWT token.

- **overview** – returns total users, jobs, active jobs, applications, companies, and verified companies.
- **timeline** – accepts `?days=7` (or any number) and returns daily new users, jobs, and applications.
- **popular** – returns top 10 active job types, locations, and categories.
- **retention** – returns active/inactive users and weekly new‑user cohorts for the last 12 weeks.
- **kpi** – returns an array of 4 KPI objects: `{ label, value, change }` where `change` is percentage vs previous week.

#### Search Suggestions (`/api/search/suggest`)
| Method | Endpoint          | Description                                                               | Access |
| ------ | ----------------- | ------------------------------------------------------------------------- | ------ |
| GET    | `/search/suggest` | Get autocomplete suggestions based on partial input (with typo tolerance) | Public |

**Example request**
GET /api/search/suggest?q=rea

**Example response**
{
  "success": true,
  "data": ["react", "react developer"]
}

### Resume Routes (`/api/users/resume`)
| Method | Endpoint              | Description                                                              | Access     |
| ------ | --------------------- | ------------------------------------------------------------------------ | ---------- |
| POST   | `/resume`             | Upload, parse, and save a resume (automatically sets as primary)         | Job Seeker |
| GET    | `/resume`             | Retrieve all resumes for the authenticated user                          | Job Seeker |
| GET    | `/resume/primary`     | Get the primary resume's parsed data (for auto-filling profile)          | Job Seeker |
| GET    | `/resume/:id`         | Get a single resume by ID                                                | Job Seeker |
| PUT    | `/resume/:id`         | Update resume metadata (`title`, `is_primary`)                           | Job Seeker |
| DELETE | `/resume/:id`         | Delete a resume and its file; promotes most recent if primary is deleted | Job Seeker |
| PUT    | `/resume/:id/primary` | Set a specific resume as primary (unsets others)                         | Job Seeker |


**Reports Routes (/api/reports)**
| Method  | Endpoint   | Description               | Access         |
| ------- | ---------- | ------------------------- | -------------- |
| POST    | `/reports` | Submit a report for a job | Authenticated  |

**Create report**
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": 22,
  "reason": "spam",
  "description": "This job looks suspicious."
}

**Valid reasons:** `spam, fraud, inappropriate, duplicate, other`
**Rate limit:** 5 reports per user per 24 hours
**Duplicate check:** One report per user per job

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

**Save Search Feature:**
- "Save this search" button next to the search bar (on the same row on desktop, stacks on mobile)
- Opens a modal with a pre‑filled name (Search on YYYY-MM-DD) and alert frequency (Daily/Weekly)
- On submit, sends a `POST /api/saved-searches` request with the current filters
- Shows a success toast on save, or an error toast if the maximum (10) saved searches has been reached

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

**Cover Letters Integration (Backend complete – frontend pending in B14):**
- The API endpoints for managing cover letters are fully implemented and tested.
- The frontend will add a "Cover Letters" section in the Job Seeker Dashboard in a future sprint.

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
- GET `/admin/analytics/kpi` – KPI cards with percentage
- GET `/admin/analytics/timeline?days=30` – Daily user / job counts (Line + Bar charts)
- GET `/admin/analytics/popular?type=job_types` – Job type distribution (Pie chart)

**Responsive Breakpoints:**
| Screen Size               | Layout                                     |
| ------------------------- | ------------------------------------------ |
| **Desktop (>1024px)**     | Sidebar + main content (2‑col)             |
| **Tablet (768px–1024px)** | Sidebar collapses, full width              |
| **Mobile (<768px)**       | Stacked layout, tables scroll horizontally |

### ReportsTable Component

**Location:** `client/src/components/Admin/ReportsTable.jsx`

- Fetches pending reports from `GET /api/admin/reports` (with mock data fallback if endpoint is missing).
- Displays: Job Title, Reporter, Reason, Description, Date, Status.
- Status badges: `pending` (yellow), `approved` (green), `removed` (red), `dismissed` (gray).
- Action buttons: **Approve**, **Remove**, **Dismiss** – each calls `PUT /api/admin/reports/:id`.
- Confirmation modal with optional **resolution notes** (sent to reporter via email).
- Shows success/error toasts via `showSuccess` and `showError`.
- Removes resolved reports from the list automatically.

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

## SaveSearchModal Component
**Location:** `client/src/components/SaveSearchModal/SaveSearchModal.jsx`

- Modal for saving search filters with name and alert frequency

## Daily Job Alert Cron Job
**Location:** `server/src/cron/dailyJobAlert.js`

- Runs every day at 08:00 using `node-cron`.
- Fetches all active saved searches with `alert_frequency = 'daily'`.
- Queries the `jobs` table for new matches since the last run.
- Builds an HTML digest email and enqueues it via the Bull email queue.
- Emails include an unsubscribe link (`/api/saved-searches/unsubscribe/:token`) that deactivates the search.

## ResumeUpload Component
**Location:** `client/src/components/common/ResumeUpload/ResumeUpload.jsx`

- Drag‑and‑drop zone and click‑to‑browse file input
- Client‑side validation: file type (.pdf, .doc, .docx) and size (max 5 MB) with toast error messages
- Real‑time upload progress bar (simulated until backend integration)
- Success/error toast notifications via the existing toast system
- Delete Resume button with confirmation dialog
- Keyboard accessible (Enter/Space on dropzone triggers file picker)
- Responsive design with media queries for mobile, tablet, and desktop
- Seamless integration with JobSeekerDashboard Profile tab and dynamic profile strength update

### Routing System
**Location:** `client/src/App.jsx`

#### Routes Configured:
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
| Table                      | Description                                        | Records (seed) |
| -------------------------- | -------------------------------------------------- | -------------- |
| **roles**                  | User roles (job_seeker, employer, admin)           | 3              |
| **companies**              | Company profiles                                   | 3              |
| **users**                  | User accounts (all roles)                          | 5              |
| **job_seekers**            | Extended job seeker information                    | 0              |
| **employers**              | Extended employer information (links to companies) | 0              |
| **job_categories**         | Job categories                                     | 8              |
| **job_types**              | Job types (full-time, part-time, etc.)             | 6              |
| **locations**              | Location master data                               | 7              |
| **skills**                 | Skills master list                                 | 8              |
| **jobs**                   | Job postings (FK to companies, categories, etc.)   | 15             |
| **applications**           | Job applications                                   | 5              |
| **resumes**                | Stored resume files (audit log)                    | 2              |
| **saved_jobs**             | Jobs saved/bookmarked by job seekers               | 3              |
| **shortlisted_candidates** | Employer-shortlisted candidates                    | 2              |
| **notifications**          | User notifications                                 | 3              |
| **job_seeker_skills**      | Skills associated with job seekers                 | 6              |
| **job_required_skills**    | Skills required for each job                       | 7              |
| **activity_logs**          | System activity audit trail                        | 4              |
| **contact_messages**       | Contact form submissions                           | 2              |
| **saved_searches**         | Saved job search criteria with alerts              | 3              |
| **messages**               | Internal messaging between users                   | 0              |
| **statistics**             | Aggregated platform statistics                     | 0              |
| **email_logs**             | Email queue delivery logs                          | 0              |
| **cron_state**             | Tracks last-run timestamps for scheduled jobs      | 1              |
| **job_reports**            | User reports on jobs (spam, fraud, etc.)           | 0              |
| **cover_letters**          | Cover letter templates                             | 0              |
| **search_logs**            | Search term logs for autocomplete & typo tolerance | 0              |


## Troubleshooting

| Issue                                                         | Solution                                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Navbar items squished                                         | Restart Vite: `rm -rf node_modules/.vite && npm run dev`                                       |
| CSS not applying                                              | Check import paths in component files                                                          |
| JobCard not showing                                           | Verify API response shape and component props                                                  |
| Footer not sticky                                             | Use `min-height: 100vh` and `flex-direction: column` in layout                                 |
| Form validation not working                                   | Check `validators.js` import path                                                              |
| HomePage featured jobs not showing                            | Ensure featured jobs exist in database                                                         |
| Search redirect not working                                   | Check AuthContext and route guards                                                             |
| Icons not showing                                             | Add Google Fonts link in `index.html`                                                          |
| Filters not working                                           | Check URL query params, backend filters, and state                                             |
| Mobile filter drawer not showing                              | Verify CSS media queries                                                                       |
| Apply button not working                                      | Check authentication status and user role                                                      |
| Similar jobs not showing                                      | Verify backend query for similar jobs                                                          |
| Company search not working                                    | Ensure companies endpoint returns valid data                                                   |
| Company cards not showing                                     | Check `CompanyCard` component import                                                           |
| Company details not showing                                   | Verify company ID in URL and API response                                                      |
| Database connection error                                     | Start MySQL and verify `.env` configuration                                                    |
| Protected route redirecting                                   | Check AuthContext and token storage                                                            |
| 404 page not showing                                          | Ensure `*` route is last in Routes                                                             |
| Login not working                                             | Verify correct test credentials                                                                |
| Toast notifications not showing                               | Ensure `react-hot-toast` installed and `<Toaster />` in `App.jsx`                              |
| 500 Internal Server Error                                     | Check server logs and database tables                                                          |
| JWT_SECRET missing                                            | Add `JWT_SECRET` to `.env` (min 32 characters)                                                 |
| Rate limit exceeded                                           | Wait 15 minutes or restart server                                                              |
| Apply button stays enabled after applying                     | Verify application status from backend                                                         |
| Saved jobs not appearing in dashboard                         | Verify `saved_jobs` API and response                                                           |
| Charts not loading                                            | Check Recharts and `/api/admin/stats/overview` endpoint                                        |
| Email not sending                                             | Check SMTP config; run `node scripts/test-email.js`                                            |
| Save search modal not opening                                 | Check `SaveSearchModal` import and state handling                                              |
| Saved search limit not enforced                               | Add backend validation (max 10 per user)                                                       |
| 429 Too Many Requests (email)                                 | Wait 60 seconds before retrying                                                                |
| Resume upload not appearing                                   | Ensure `ResumeUpload` component is imported and `resumeUrl` is set                             |
| Drag-and-drop not working                                     | Verify file type/size constraints and event handlers                                           |
| Progress bar not showing                                      | Check `USE_MOCK=true` flag or API integration                                                  |
| Delete resume fails                                           | Verify backend endpoint or test with mock enabled                                              |
| Cron job not running                                          | Ensure `startDailyJobAlert()` is called in `server.js` and Redis is running                    |
| Unsubscribe link shows "Invalid"                              | Backfill tokens using UUID update query                                                        |
| Daily alert email not received                                | Check `cron_state.last_run` and job existence                                                  |
| Report not submitting                                         | Check `jobId`, authentication, and Redis status                                                |
| Rate limit hit on reports                                     | Wait 24h or reset Redis key                                                                    |
| Resume upload fails with "Unexpected end of form"             | File is corrupt/empty/locked. Use fresh text-based PDF                                         |
| Resume upload succeeds but parsed_data is NULL                | Parser failed (likely scanned PDF). Use text-based PDF                                         |
| Resume upload succeeds but no record appears in resumes table | DB INSERT failed. Check `req.user.id` and schema                                               |
| Cover letter creation fails                                   | Ensure `cover_letters` table exists and DB connection works                                    |
| FULLTEXT search error                                         | Add index: `ALTER TABLE jobs ADD FULLTEXT INDEX ft_search (title, description, requirements);` |
| SQL syntax error on search                                    | Fix controller fallback: use `sort='recent'` when search empty                                 |
| Suggestions endpoint returns empty                            | Run `/api/jobs?search=...` to populate `search_logs`                                           |
| Cover letter doesn't save                                     | Check name/content fields, inspect browser console (F12), ensure backend + routes are running  |
| Rich text editor not showing                                  | Run `npm install react-quill-new` and import CSS                                               |
| Reports not loading in Admin Dashboard                        | Check `GET /api/admin/reports` endpoint and filters                                            |
| Confirmation modal not opening                                | Ensure `isModalOpen` state and CSS imports                                                     |
| Report email not sent to reporter                             | Verify Bull/Redis is running, email queue enabled, template exists                             |
| Resolved report still appears in table                        | Refresh via `fetchReportsData()` or check pagination                                           |
| "Failed to resolve report" toast                              | Ensure report isn’t already resolved                                                           |
| Charts not updating on date range change                      | Ensure `dateRange` state is passed correctly (default 30 days)                                 |
| Export CSV button not downloading                             | Check `downloadCSV` function and data availability                                             |
| Auto-refresh not triggering                                   | Verify toggle is ON and `setInterval` is active in `useEffect`                                 |
| Last refresh timestamp not updating                           | Ensure `setLastRefresh(new Date())` is called inside `fetchData()`                             |

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
- Real-time notification system (Socket.io)
- Advanced search filters with debouncing
- Email verification and password reset
- Chat between employers and job seekers
- Job application tracking with timeline
- Dark mode support
- AI-powered job recommendations
- Smart matching score between candidate and job
- Interview scheduling system
- Mobile native apps (React Native)
- Structured resume API (e.g., Affinda) for higher‑accuracy parsing

## License

SmartHire is a college project created for learning full‑stack web development. The code is open‑sourced under the [MIT License](LICENSE) (or “MIT”) – you’re welcome to study, reuse, or build upon it, but please attribute the original work to this repository.

## Goal

SmartHire Sprint 1-2 progress - Currently In Progress:

### Completed So Far:

**Frontend and UI Components:**

- React + Vite + CSS frontend environment with responsive design
- Navbar(role-based, active highlighting, mobile drawer)
- Footer (4 cloumns, newsletter, social links)
- Homepage (hero, CTA, searchbar, featured jobs, "How It Works")
- JobsPage (debounced search, URL query sync, filters, pagination, sorting, clear filters, mobile drawer, "Save this search" modal)
- JobDetailsPage (dynamic fetch, apply flow, duplicate prevention, save flow, similar jobs, report job modal)
- CompaniesPage (search, responsive grid, company cards)
- LoginPage (email/password validation, remember me, role-based redirects)
- RegisterPage (full validation, role dropdown, conditional company name)
- JobSeekerDashboard (overview, applied jobs, saved jobs, profile edit, resume upload with progress bar, cover letters)
- EmployerDashboard (overview, job creation/editing/deletion, applicant management)
- AdminDashboard (KPI cards, charts, tables, reports, date range picker, export CSV, auto-refresh)

**Backend and API Integration**

- JWT Authentication (register, login, profile) with bcrypt and rate limiting
- Job CRUD APIs (`/api/jobs`) with filtering, sorting, pagination
- Application APIs (`/api/applications`) – submit, status update, withdraw
- Saved Jobs APIs (`/api/saved-jobs`) – save, fetch, remove
- Company APIs (`/api/companies`) – fetch all, fetch by ID
- Admin APIs (`/api/admin`) – users, jobs, companies, toggle user status
- Admin Dashboard analytics APIs (`/admin/analytics/kpi`, `/admin/analytics/timeline`, `/admin/analytics/popular`)
- Resume CRUD APIs (`/api/users/resume`) – upload/parse, fetch all, fetch primary, update metadata, delete, set as primary
- Cover Letters CRUD APIs (`/api/cover-letters`) – create, get, update, delete, set default
- Backend-driven filtering, sorting, and pagination for all job listings

**Email and Backround Jobs:**

- Nodemailer + Resend integration with 5 responsive HTML email templates
- Background email queue (Bull + Redis) – all emails sent asynchronously (`email_logs` audit table)
- Email rate limiting (10/60s per user) with 429 rejection
- Automatic retry with exponential backoff (1min, 5min, 15min) and admin alert on final failure
- Daily job alert cron job (node-cron) – scans active saved searches at 8 AM, sends digests with unsubscribe links
- Notify reporter on resolution – email sent when admin resolves a job report

**Advanced Features:**

- FULLTEXT search (`MATCH AGAINST`) with relevance scoring
- Typo tolerance and autocomplete suggestions (SOUNDEX, prefix searches, search logging)
- Resume parsing (PDF/DOCX) with full CRUD – extracted data stored in `parsed_data` column
- Cover Letters – Full CRUD API + frontend UI (rich text editor, modal, set default)
- Admin Reports Queue UI – Dedicated moderation panel with filters, action buttons, confirmation modal with resolution notes, and email notifications

**Miscellaneous:**

- Reusable components: Button, Input, Tag, TagGroup, JobCard, CompanyCard, Toast, Footer, Navbar, ResumeUpload
- Complete routing system with protected routes and 404 page
- MySQL database schema with 27+ tables and seed data
- CSS variables for consistent theming and Google Material Icons
- Admin analytics charts using Recharts (line, bar, pie)

**Current Setup Time:** Any developer can clone and run the frontend with mock data in under 10 minutes.