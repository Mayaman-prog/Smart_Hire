# Smart_Hire - Smart Job Portal System

![GitHub repo size](https://img.shields.io/github/repo-size/Mayaman-prog/Smart_Hire)
![GitHub stars](https://img.shields.io/github/stars/Mayaman-prog/Smart_Hire?style=social)
![GitHub forks](https://img.shields.io/github/forks/Mayaman-prog/Smart_Hire?style=social)
![GitHub issues](https://img.shields.io/github/issues/Mayaman-prog/Smart_Hire)
![License](https://img.shields.io/badge/license-MIT-blue)
![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1-green)

SmartHire is a full-stack job portal web application connecting job seekers, employers, and administrators. It is designed to be scalable, SEO-friendly, and production-ready.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
  - [Core Features](#core-features)
  - [Backend Features](#backend-features)
    - [Keyboard Navigation & Modal Focus Trap](#keyboard-navigation--modal-focus-trap)
    - [Cover Letters](#cover-letters)
    - [FULLTEXT Search](#fulltext-search)
    - [Typo Tolerance & Autocomplete](#typo-tolerance-autocomplete)
    - [Resume Parsing & CRUD](#resume-parsing-crud)
    - [Admin Reports Queue UI](#admin-reports-queue-ui)
    - [Search Term Logging & Keyword Highlighting](#search-term-logging--keyword-highlighting)
    - [Audit Logging](#audit-logging)
    - [Job Matching Algorithm](#job-matching-algorithm)
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
  - [Google OAuth Setup](#google-oauth-setup)
  - [LinkedIn OAuth Setup](#linkedIn-oauth-setup)
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
  - [Job Matching Routes](#job-matching-routes)
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
  - [Daily Job Alert Cron](#daily-job-alert-cron)
  - [KeyboardShortcuts Component](#keyboardshortcuts-component)
  - [useFocusTrap Hook](#usefocustrap-hook)
- [Routing System](#routing-system)
- [Validation Utilities](#validation-utilities)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Future Improvements](#future-improvements)
- [Accessibility Testing Checklist](#accessibility-testing-checklist)
- [Troubleshooting](#troubleshooting)
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
- Advanced search operators – support for `"exact phrase"`, `-exclude`, `OR`, `AND` (MySQL boolean mode)
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
- Social login buttons Google OAuth fully integrated (backend + frontend), LinkedIn button disabled (backend pending)
- **Save this search** button on jobs listing page to store current search filters with a name and alert frequency
- **Drag-and-drop resume upload** on profile with progress indicator, file validation, and delete functionality
- **Automatic resume parsing** (PDF/DOCX) and **auto‑filling of profile fields** – extracted data is stored in the `parsed_data` column of the `resumes` table and can be retrieved to pre‑fill the user's profile form with a side‑by‑side preview.
- **Cover Letters** – Create, edit, delete, and set default cover letter templates directly in the Job Seeker Dashboard using a built-in rich text editor (bold, italic, bullet points, links). The default cover letter is automatically selected when applying to a job.
- **Connected Accounts** – Users can securely link or unlink their Google and LinkedIn accounts directly from their profile to add extra login methods. Includes confirmation modals and a backend lockout prevention system (prevents unlinking if no other login method exists).
- **Admin Reports Queue UI** – Dedicated moderation panel with status filters, action buttons (Approve, Remove, Dismiss, Ban Employer), confirmation modal with resolution notes, and automated email notification to the reporter via background queue.
- **Search Term Logging & Keyword Highlighting** – Every search term is logged with user/IP data for analytics. Matching terms in job titles and descriptions are highlighted with a yellow background in search results.
- Salary Comparison Badge – On the job details page, a colored pill indicates if the job’s salary is above, average, or below market, with a tooltip showing market stats (average, median, percentiles, sample count).
- Salary Trend Chart & Percentiles – On the job details page, a collapsible "Salary Insights" section displays a line chart of monthly average salaries over the last 6 months and horizontal bars for the 25th, 50th (median), and 75th percentiles, with a tooltip on the chart.
- Complete global theme system with **light**, **dark**, and **system** modes
- Automatic operating system theme detection using `prefers-color-scheme`
- Persistent theme storage using `localStorage`
- Flash-of-incorrect-theme prevention using inline `<head>` theme initialization script
- WCAG-friendly color contrast improvements across all pages and components
- Centralized dark mode architecture using CSS variables and semantic theme tokens
- Fully accessible UI with ARIA labels, semantic HTML structure, and keyboard navigation support
- Keyboard navigation support across the main application
- Skip to content link for faster keyboard navigation
- Global keyboard shortcuts for Home, Jobs, Dashboard, and Job Search
- Visible keyboard focus indicators using `:focus-visible`
- Reusable modal focus trap hook using `keydown` listener
- Modal focus returns to the triggering element after close
- Mobile filter drawer, Save Search modal, Report Job modal, Apply modal, and Quick Apply modal updated for keyboard accessibility
- **Job Matching Algorithm** – Backend recommendation system that calculates personalised job match scores using user skills, previous applications, saved jobs, location preference, job type, salary alignment, and TF-IDF keyword overlap.
- **Audit Logging** – Security-sensitive backend actions are recorded in the `audit_logs` table for accountability, monitoring, and forensic investigation.
- Multi-language localisation support (English, Spanish, French)
- Dynamic frontend translation using i18next
- Language switcher integrated into Navbar
- Automatic browser language detection
- Translation support for buttons, labels, placeholders, headings, modals, empty states, and accessibility labels
- Translation-ready architecture using JSON locale files
- ARIA labels translated for screen readers

### Backend Features

- JWT authentication (register, login, profile)
- Password hashing with bcrypt (10 rounds)
- Input validation with express-validator
- Rate limiting (5 login attempts per 15 minutes)
- MySQL database with 29 tables
- Transaction support for registration
- CORS configured for frontend
- Helmet.js for security headers
- Morgan for request logging
- Job reporting with Redis rate limiting (5 reports per user per 24h)
- Admin analytics API endpoints (overview, timeline, popular, retention, KPI)
- Typo tolerance and autocomplete suggestions – SOUNDEX‑based term matching and prefix suggestions from `search_logs`.
- FULLTEXT search – `ft_search` index on `jobs(title, description, requirements)` with relevance scoring and `sort=relevance`
- Resume Parsing & CRUD – `pdf-parse-fork` (PDF) and `mammoth` (DOCX) extract structured data; full CRUD endpoints for resumes
- Cover Letters CRUD – `GET`, `POST`, `PUT`, `DELETE`, `PUT /:id/default`
- Background Email Queue – Bull + Redis, all transactional emails processed asynchronously
- Email Rate Limiting – 10 emails per minute per user, 429 rejection, exponential backoff retry (1m, 5m, 15m)
- Daily Job Alert Cron – runs at 8 AM, scans active saved searches, sends digest emails with unsubscribe links
- Report Resolution Email – notifies reporter when admin resolves a job report
- Audit Logging – Non-blocking audit middleware records login success/failure, password changes, role changes, user bans, job deletion, company verification, and report resolution in the `audit_logs` table.
- Salary Aggregation API – GET /api/salary/estimate returns market salary data by title and location for the salary comparison badge.
- Job Matching Algorithm – calculates personalised job recommendations using TF-IDF keyword similarity, location matching, job type matching, salary alignment, and user activity history.

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
  - `GET /api/users/resume/primary` – Get the primary resume’s parsed data (for auto-filling the profile).
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

#### Search Term Logging & Keyword Highlighting

- **Table:** `search_logs` stores every search with the term, user ID, IP address, result count, and timestamp.
- **Logging:** Every search request is logged automatically in the background. Guest searches are logged with IP address only.
- **Analytics:** Admins can view search trends via SQL queries or future analytics dashboards.
- **Frontend Highlighting:** Matching terms in job titles and descriptions are wrapped with `<mark class="bg-yellow-200">` to visually show why a job was matched.
- **Implementation:**
  - Middleware: `searchLogger.js` automatically logs each search before passing to the controller.
  - Controller: `jobController.js` updates the `result_count` in the log after the query runs.
  - Frontend: `highlightText.js` utility function is used in `JobCard.jsx` to wrap matches.

#### Audit Logging

SmartHire includes a backend audit logging system for recording security-sensitive actions. The audit system helps administrators trace important user and system activity for accountability, monitoring, and forensic investigation.

**Table:** `audit_logs`

| Column       | Description                                 |
| ------------ | ------------------------------------------- |
| `id`         | Unique audit log ID                         |
| `user_id`    | User who performed the action, if available |
| `action`     | Name of the security-sensitive action       |
| `ip_address` | IP address of the request                   |
| `user_agent` | Browser or client user agent                |
| `details`    | JSON field containing extra action details  |
| `created_at` | Timestamp when the action was logged        |

#### Logged Actions

| Action              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `LOGIN_SUCCESS`     | Logged when a user signs in successfully             |
| `LOGIN_FAILURE`     | Logged when a login attempt fails                    |
| `PASSWORD_CHANGE`   | Logged when a user changes their password            |
| `ROLE_CHANGE`       | Logged when an admin changes a user's role           |
| `USER_BAN`          | Logged when an admin bans a user                     |
| `USER_UNBAN`        | Logged when an admin unbans a user                   |
| `JOB_DELETE`        | Logged when a job is deleted by an employer or admin |
| `COMPANY_VERIFY`    | Logged when an admin verifies a company              |
| `REPORT_RESOLUTION` | Logged when an admin resolves a job report           |

#### Implementation Details

| File                                        | Purpose                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `server/src/middleware/auditLogger.js`      | Provides `auditLogger` middleware and `logAction(userId, action, details)` helper  |
| `server/server.js`                          | Registers the audit middleware globally                                            |
| `server/src/controllers/authController.js`  | Logs login success and login failure                                               |
| `server/src/controllers/userController.js`  | Logs password changes                                                              |
| `server/src/controllers/adminController.js` | Logs role changes, bans, company verification, job deletion, and report resolution |
| `server/src/controllers/jobController.js`   | Logs employer/admin job deletion                                                   |
| `server/database/schema.sql`                | Defines the `audit_logs` table                                                     |
| `server/scripts/setup-db.js`                | Includes `audit_logs` in database setup verification                               |

#### Non-Blocking Logging

Audit logging is implemented asynchronously using `setImmediate()`. This means the main API response is not delayed while the audit record is inserted into the database.

#### Database Verification

The database setup script confirmed that the `audit_logs` table was created successfully:

```bash
Audit Logs: 0
```

This means the table exists, but no audit activity has been recorded yet. Logs are added when security-sensitive actions occur.

**Manual Audit Log Check**
After performing a login, password change, ban, role change, job delete, company verification, or report resolution, audit records can be checked using:

```SQL
SELECT id, user_id, action, ip_address, user_agent, details, created_at
FROM audit_logs
ORDER BY created_at DESC;
```

### Theme System (Light/Dark Mode)

SmartHire includes a complete global theme system built with React Context API and CSS custom properties. The application supports **light mode**, **dark mode**, and automatic **system theme detection** based on the user’s operating system preferences.

#### Features

- Global theme management using React Context API
- Light and dark themes using CSS custom properties
- Automatic OS theme detection using `prefers-color-scheme`
- Theme persistence using `localStorage`
- Smooth theme transitions across the application
- Fully responsive and accessible theme toggle button
- No hardcoded component colors – all components inherit theme variables automatically

#### Implementation Details

##### Theme Context

The theme system is managed centrally inside:

`client/src/contexts/ThemeContext.jsx`

Responsibilities:

- Stores the current theme state
- Persists the selected theme in `localStorage`
- Applies the active theme globally to the `<html>` element
- Detects operating system color scheme changes
- Automatically updates the UI when the OS theme changes

The active theme is applied using:

```js
document.documentElement.setAttribute("data-theme", activeTheme);
```

#### Supported Theme Modes

| Theme    | Description                                      |
| -------- | ------------------------------------------------ |
| `light`  | Uses the light color palette                     |
| `dark`   | Uses the dark color palette                      |
| `system` | Automatically follows the operating system theme |

When `system` mode is active, the application listens to:

```js
window.matchMedia("(prefers-color-scheme: dark)");
```

This allows SmartHire to automatically switch between light and dark mode whenever the user changes their system appearance settings.

#### CSS Variable Architecture

All theme colors, backgrounds, shadows, borders, and typography values are defined in:

`client/src/styles/variables.css`

Theme variables are organized using:

```css
:root,
[data-theme="light"],
.light
```

and

```css
[data-theme="dark"],
.dark
```

This architecture ensures:

- Consistent design across all pages
- Easier scalability
- Centralized theme maintenance
- No duplicated theme logic inside components

#### Global Styling

`globals.css` imports `variables.css` and applies global styles using CSS variables:

```css
background-color: var(--bg-primary);
color: var(--text-primary);
```

Smooth transitions are applied globally:

```css
transition:
  background-color 0.3s ease,
  color 0.3s ease;
```

Global accessibility focus styles are also applied using shared focus ring variables::

```css
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
[tabindex]:focus-visible,
[role="button"]:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

The focus ring variables are stored in variables.css so the accessibility focus style remains consistent across light mode, dark mode, and modal components.

#### Navbar Theme Toggle

The theme toggle button is implemented inside:

`client/src/components/common/Navbar/Navbar.jsx`

Features:

- Uses Google Material Symbols icons
- Dynamically changes icon based on active theme
- Instantly updates the entire application theme
- Works across desktop and mobile layouts

#### Theme Persistence

The selected theme is stored in browser local storage:

```js
localStorage.setItem("theme", theme);
```

This ensures the user’s preferred theme persists across:

- Page refreshes
- Browser restarts
- Future visits

#### Automatic Component Theming

All components automatically inherit the active theme because they use CSS variables instead of hardcoded colors.

Example:

```css
background-color: var(--bg-card);
color: var(--text-primary);
border-color: var(--border-color);
```

This allows:

- Instant global theme switching
- Cleaner component code
- Better maintainability
- Easier future customization

### Accessibility & Dark Mode Enhancements

- SmartHire was enhanced with a complete accessibility and dark mode optimization pass to improve usability, responsiveness, and visual consistency across the platform.
- The frontend was updated to follow semantic HTML and accessibility best practices. The latest accessibility work focused on keyboard navigation, visible focus indicators, modal focus trapping, and improved screen reader support.
- Accessibility labels translated for all supported languages
- Screen reader text localisation support
- Multi-language ARIA labels for icon-only buttons and modals

##### Implemented Accessibility Features

- Added `aria-label` attributes to icon-only buttons
- Added proper `<label>` associations for form fields
- Added `role="dialog"` and `aria-modal="true"` to modal components
- Added `aria-labelledby` to modal headings
- Added `role="status"` and `aria-live="polite"` for dynamic status updates
- Added `aria-hidden="true"` to decorative Google Material Symbols icons
- Improved heading hierarchy consistency using `h1 → h2 → h3`
- Added global `lang="en"` attribute in `index.html`
- Added reusable `sr-only` utility class for screen-reader-only text
- Added keyboard-visible focus indicators using `:focus-visible`
- Added Skip to Content link before navigation
- Added global keyboard shortcuts for common navigation actions
- Added reusable `useFocusTrap.js` hook for modal focus management
- Moved focus to the first interactive element when a modal opens
- Trapped Tab and Shift + Tab inside active modals
- Returned focus to the triggering element when a modal closes
- Improved modal accessibility for Save Search, Report Job, Apply, Quick Apply, and mobile filter drawer
- Improved keyboard support for JobsPage search and filters

##### Keyboard Navigation Shortcuts

| Shortcut  | Action                                                       |
| --------- | ------------------------------------------------------------ |
| `Alt + H` | Go to Home page                                              |
| `Alt + J` | Go to Jobs page                                              |
| `Alt + S` | Go to Jobs page and focus the job search input               |
| `Alt + D` | Go to the correct dashboard based on the logged-in user role |
| `Esc`     | Close open modal/help panel or remove focus                  |
| `?`       | Show or hide the keyboard shortcuts help panel               |

The keyboard shortcut help is implemented as a floating help panel, not as a separate Help page route.

##### Modal Focus Trap Behaviour

The modal focus trap follows these rules:

- When a modal opens, focus moves inside the modal
- If an element has `data-autofocus`, focus moves to that element first
- If no autofocus element exists, focus moves to the first focusable element
- Pressing `Tab` on the last focusable element loops focus back to the first element
- Pressing `Shift + Tab` on the first focusable element loops focus to the last element
- Pressing `Esc` closes the modal
- When the modal closes, focus returns to the button or element that opened it

##### Files Updated for Accessibility

| File                                                                   | Accessibility Update                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `client/src/styles/variables.css`                                      | Added focus ring variables                                                                        |
| `client/src/styles/globals.css`                                        | Added global `:focus-visible` and modal focus styles                                              |
| `client/src/hooks/useFocusTrap.js`                                     | Added reusable focus trap hook                                                                    |
| `client/src/components/common/KeyboardShortcuts/KeyboardShortcuts.jsx` | Added keyboard shortcuts and help panel                                                           |
| `client/src/components/common/KeyboardShortcuts/KeyboardShortcuts.css` | Added shortcut help panel styling                                                                 |
| `client/src/components/SaveSearchModal/SaveSearchModal.jsx`            | Added modal focus trap and modal ARIA attributes                                                  |
| `client/src/pages/JobsPage/JobsPage.jsx`                               | Added search focus target, ARIA labels, filter drawer accessibility, and mobile drawer focus trap |
| `client/src/pages/JobDetailsPage/JobDetailsPage.jsx`                   | Added focus trap for Report, Apply, and Quick Apply modals                                        |

##### Accessibility Testing

The application was manually tested for:

- Keyboard-only navigation
- Skip to content behaviour
- Focus visibility
- Form label association
- Modal focus trapping
- Tab and Shift + Tab focus looping
- Escape key modal closing
- Focus return after modal close
- Screen reader-friendly modal labels
- Responsive accessibility on mobile drawer
- Semantic heading structure consistency

#### Dark Mode Optimization

The SmartHire frontend now supports complete dark mode compatibility across all pages, dashboards, cards, forms, tables, modals, and navigation components.

##### Dark Mode Features

- Full light/dark/system theme support
- Automatic operating system theme synchronization
- Smooth theme transitions
- Centralized theme management using React Context API
- CSS custom property architecture
- Semantic color variables (`--bg-card`, `--text-primary`, etc.)
- Responsive dark mode layouts
- Improved contrast ratios for WCAG readability compliance

##### Flash Prevention

To prevent the “flash of incorrect theme” problem during page load, an inline theme initialization script is injected inside `index.html` before React mounts.

The script:

- Reads the saved theme from `localStorage`
- Detects operating system theme preference
- Applies the correct theme before rendering

##### Dark Mode Override Architecture

A centralized override file was added:

`client/src/styles/dark-mode-overrides.css`

**Responsibilities:**

- Overrides remaining hardcoded light-mode styles
- Applies semantic theme variables globally
- Ensures consistency across reusable components
- Reduces duplicated dark mode styling logic
- Simplifies long-term theme maintenance
- Components Updated for Dark Mode

The following components/pages were updated and tested in both light and dark modes:

- Navbar
- Footer
- JobCard
- CompanyCard
- SaveSearchModal
- HomePage
- JobsPage
- JobDetailsPage
- CompaniesPage
- CompanyDetailsPage
- LoginPage
- RegisterPage
- ProfilePage
- SalaryInsights
- JobSeekerDashboard
- EmployerDashboard
- AdminDashboard
- ResumeUpload
- ConnectedAccounts
- WCAG Contrast Improvements

The following improvements were applied:

- Improved text readability on dark backgrounds
- Enhanced button hover visibility
- Accessible form field contrast
- Better muted-text visibility
- Improved dashboard card readability
- Accessible modal overlays
- Improved focus ring visibility for keyboard users

### Keyboard Navigation & Modal Focus Trap

SmartHire includes keyboard navigation improvements to support users who rely on the keyboard instead of a mouse. This work improves accessibility, usability, and WCAG alignment.

#### Main Keyboard Features

- Global `:focus-visible` styling for clear keyboard focus indication
- Skip to Content link for bypassing navigation
- Keyboard shortcuts for fast page navigation
- Search input focus shortcut on JobsPage
- Escape key support for closing modals and dialogs
- Reusable modal focus trap hook
- Focus return to triggering element after modal close

#### Focus Ring Variables

The focus ring is controlled using CSS variables inside:

`client/src/styles/variables.css`

```css
--focus-ring-color: #3b82f6;
--focus-ring-width: 2px;
--focus-ring-offset: 3px;
```

These variables are used in:
`client/src/styles/globals.css`

```css
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

#### Focus Trap Hook

The reusable focus trap hook is located at:
`client/src/hooks/useFocusTrap.js`

It is used by modal components to:

- Save the previously focused element
- Move focus into the modal on open
- Keep focus inside the modal while it is open
- Close the modal using Esc
- Return focus to the trigger element after close

#### Modals Updated

| Modal / Dialog               | File                                                                   |
| ---------------------------- | ---------------------------------------------------------------------- |
| Save Search modal            | `client/src/components/SaveSearchModal/SaveSearchModal.jsx`            |
| Mobile filter drawer         | `client/src/pages/JobsPage/JobsPage.jsx`                               |
| Report Job modal             | `client/src/pages/JobDetailsPage/JobDetailsPage.jsx`                   |
| Apply modal                  | `client/src/pages/JobDetailsPage/JobDetailsPage.jsx`                   |
| Quick Apply modal            | `client/src/pages/JobDetailsPage/JobDetailsPage.jsx`                   |
| Keyboard shortcut help panel | `client/src/components/common/KeyboardShortcuts/KeyboardShortcuts.jsx` |

## Internationalization (i18n) System

SmartHire includes a complete frontend localisation system using i18next and react-i18next. The application currently supports:

- English (`en`)
- Spanish (`es`)
- French (`fr`)

The translation system allows users to dynamically switch languages without reloading the page.

### Features

- Dynamic language switching
- Browser language auto-detection
- Translation JSON architecture
- Accessibility-aware translated ARIA labels
- Translated placeholders, buttons, modals, forms, and navigation
- Persistent selected language
- Scalable localisation structure for future languages

### Libraries Used

| Library                            | Purpose                             |
| ---------------------------------- | ----------------------------------- |
| `i18next`                          | Core internationalization framework |
| `react-i18next`                    | React integration                   |
| `i18next-browser-languagedetector` | Detects browser language            |
| `i18next-http-backend`             | Loads translation files             |

### Translation File Structure

```plaintext
public/
└── locales/
    ├── en/
    │   └── translation.json
    ├── es/
    │   └── translation.json
    └── fr/
        └── translation.json
```

### i18n Initialization

The localisation configuration is initialized inside:

```plaintext
client/src/i18n.js
```

Imported globally inside:

```js
import "./i18n";
```

### Translation Usage Pattern

```jsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<h1>{t("home.title")}</h1>

<button>{t("buttons.search")}</button>

<input placeholder={t("placeholders.searchJobs")} />
```

### Language Switcher

The language switcher component is integrated into the Navbar and allows users to dynamically switch between:

- English
- Spanish
- French

The selected language updates all translated UI text instantly.

### Accessibility Translation Support

ARIA labels and accessibility text are also translated.

Example:

```jsx
<button aria-label={t("buttons.close")}>
```

### Components Updated for Translation

- Navbar
- Footer
- HomePage
- JobsPage
- JobDetailsPage
- CompaniesPage
- CompanyDetailsPage
- LoginPage
- RegisterPage
- JobSeekerDashboard
- EmployerDashboard
- AdminDashboard
- ProfilePage
- ConnectedAccounts
- ResumeUpload
- JobCard
- CompanyCard
- SalaryInsights
- SalaryComparisonBadge
- SaveSearchModal
- NotFoundPage
- Toast messages
- Shared form components

### Translation Rules

The localisation system only translates static frontend UI text.

The following dynamic backend values are intentionally NOT translated:

- Job titles
- Company names
- User names
- Salary values
- User-generated content
- Database-driven descriptions
- API statuses

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
  If a user exceeds 10 emails in that window, the request is rejected with a **429 Too Many Requests** response and the message _“Too many emails. Limit is 10 per minute.”_  
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
| Admin resolves a job report            | `report-resolution.html`                       | Reporter             |

All emails are sent asynchronously; failures are logged but do not break the main functionality.

### Google OAuth Setup

#### Overview:

- Social login with Google using Passport.js (backend) + React (frontend)
- Users can sign in with their Google account – redirects to frontend with JWT token

#### Endpoints (`/api/auth/google` and `/api/auth/google/callback`):

| Method | Endpoint                  | Description                                               |
| ------ | ------------------------- | --------------------------------------------------------- |
| GET    | /api/auth/google          | Redirects to Google login page                            |
| GET    | /api/auth/google/callback | Handles callback and redirects to frontend with JWT token |

- Because `passport.authenticate` handles the redirect, no controller logic is required for these routes.

#### Environment Variables:

- Add the following to `server/.env`:

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

#### Dependencies:

- `passport`
- `passport-google-oauth20`

#### Google Cloud Console Setup:

- Go to `Google Cloud Console` and create a new project.
- Navigate to `APIs & Services → Credentials`.
- Click Create `Credentials → OAuth client ID` (Web application).
- Set Authorized JavaScript origins: `http://localhost:5173`
- Set Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
- Copy the Client ID and Client Secret into `.env`.

#### Passport Strategy (`server/src/config/passport.js`):

- Uses `GoogleStrategy` with `clientID` and `clientSecret`.
- Callback URL: `http://localhost:5000/api/auth/google/callback`.
- Fetches user's `google_id`, email, and name.
- If user exists by `google_id` → generates JWT.
- If user exists by email → links `google_id` to existing account.
- If new user → creates account (role: `job_seeker`), then generates JWT.

#### Frontend Integration:

- "Sign in with Google" button on Login page redirects to backend OAuth initiation endpoint.
- After callback, token is extracted from URL and stored in `localStorage`.
- User is redirected to appropriate dashboard based on role (`job_seeker`, `employer`, `admin`).
- Error handling for email conflicts and authentication failures.

### LinkedIn OAuth Setup - Backend (Disabled)

#### Overview:

- LinkedIn OAuth is not yet enabled due to LinkedIn’s requirement for a `Company Page` and `10+ connections` on the developer’s account.
- Routes return `503` status; frontend button is disabled with a tooltip.

#### Future Activation:

- When LinkedIn credentials are added to `server/.env` and the Passport strategy is uncommented, the feature can be activated.

LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

### Daily Job Alert Cron Job

**Features:**

- Node‑cron job scheduled every day at 8 AM.
- Scans all active saved searches with alert_frequency = 'daily'.
- Queries jobs created since the last run that match each search's criteria (keyword, location, job type, salary range).
- Builds a digest email with up to 20 matching jobs and sends it via the background email queue.
- Each email includes an unsubscribe link (unique token per saved search) that deactivates the search permanently.
- Stores the \*ast‑run timestamp in the cron_state table to avoid duplicate alerts.

### Job Matching Algorithm

SmartHire includes a backend job matching algorithm that generates personalised job recommendations for job seekers. The algorithm compares each job seeker’s profile and activity history with active job postings, then calculates a match score between 0 and 100.

**Features:**

- Extracts user features from skills, profile data, saved jobs, previous applications, and resume/profile information.
- Compares users with active job postings.
- Uses TF-IDF style keyword overlap to compare user skills and job content.
- Includes location, job type, salary, and application history in the scoring model.
- Normalises the final match score between 0 and 100.
- Stores calculated results in the `job_matches` table.
- Supports manual recalculation through API endpoints.
- Supports scheduled recalculation using a daily cron job.

#### Scoring Model

| Score Component | Description                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Keyword Score   | Compares user skills, saved jobs, applied jobs, and job content using TF-IDF based keyword similarity |
| Location Score  | Checks whether the user’s preferred location matches the job location                                 |
| Job Type Score  | Compares the user’s preferred job type with the job type                                              |
| Salary Score    | Checks whether the job salary aligns with the user’s expected salary or activity history              |
| History Score   | Uses previously applied and saved jobs to improve recommendation relevance                            |

#### Match Score Storage

The final calculated result is stored in the `job_matches` table. Each record stores the user, job, final match score, score breakdown, matching keywords, and recommendation reason.

#### Main Files

| File                                           | Purpose                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `server/src/services/jobMatchingService.js`    | Extracts user/job features, calculates TF-IDF similarity, computes weighted scores, and stores matches |
| `server/src/controllers/jobMatchController.js` | Handles API requests for fetching and recalculating job matches                                        |
| `server/src/routes/jobMatchRoutes.js`          | Defines job matching API routes                                                                        |
| `server/src/cron/dailyJobMatching.js`          | Runs the daily scheduled job matching update                                                           |
| `server/scripts/test-job-matching.js`          | Tests job matching manually from the terminal                                                          |
| `server/database/schema.sql`                   | Stores the `job_matches` table definition                                                              |

#### Testing Result

The job matching test script was executed successfully:

```bash
node scripts/test-job-matching.js
```

**Successful Output:**

```bash
[Test] Calculating matches for all users...
{
  totalUsers: 4,
  processedUsers: 4,
  failedUsers: 0,
  totalMatches: 100,
  errors: []
}
```

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
- Integrated language switcher (EN / ES / FR)
- Fully translated navigation labels and ARIA attributes
- Responsive language selector for desktop and mobile layouts

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
- Fully responsive light and dark mode support using semantic CSS variables

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
  **Apply with Resume** (one‑click application using stored resume and default cover letter)
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

- Sidebar navigation with tabs: Overview, Applied Jobs, Saved Jobs, Saved Searches, Cover Letters, Profile
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
- Saved Searches tab:
  - Create, edit, delete, and manage saved search filters with alert frequency
- Cover Letters tab:
  - Create, edit, delete, and set default cover letter templates using a rich text editor (bold, italic, bullet points, links). All operations are reflected instantly and sync with the backend via a dedicated API.
- Profile tab:
  - Edit profile form (name, email, phone, skills, experience, education, password change with current password verification)
  - Drag‑and‑drop resume upload with real‑time progress bar, client‑side validation (PDF, DOC, DOCX, max 5 MB), delete functionality, and dynamic profile strength update
  - **Auto‑fill profile fields from parsed resume data** – after upload, the system extracts full name, email, phone, skills, work experience, and education. A **preview panel** shows extracted data next to editable form fields. The user can edit any field before saving. **Save Profile** persists final values; **Discard** reverts to original profile data.
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
- **React Hot Toast 2.4.1** - Toast notifications
- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- **i18next-browser-languagedetector** - Automatic browser language detection
- **i18next-http-backend** - Translation file loader
- **CSS3** - Custom styling with CSS variables, semantic theme tokens, and centralized dark mode overrides
- **Google Material Symbols** - Icon system
- **Recharts** - Charting library for admin dashboard

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
- **Passport.js** – Google OAuth

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

```
SmartHire/
├── client/                           # React (Vite) frontend
├── public/
│   ├── locales/
│   │   ├── en/
│   │   │   └── translation.json
│   │   ├── es/
│   │   │   └── translation.json
│   │   └── fr/
│   │       └── translation.json
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
│   │   │   │   ├── KeyboardShortcuts/
│   │   │   │   │   ├── KeyboardShortcuts.jsx
│   │   │   │   │   └── KeyboardShortcuts.css
│   │   │   │   ├── ResumeUpload/
│   │   │   │   │   ├── ResumeUpload.jsx
│   │   │   │   │   └── ResumeUpload.css
│   │   │   │   └── ScrollToTop.jsx
│   │   │   ├── jobs/
│   │   │   │   └── JobCard/
│   │   │   │       ├── JobCard.jsx
│   │   │   │       └── JobCard.css
│   │   │   ├── salary/
│   │   │   │   ├── SalaryInsights.jsx
│   │   │   │   ├── SalaryInsights.css
│   │   │   │   ├── SalaryComparisonBadge.jsx
│   │   │   │   └── SalaryComparisonBadge.css
│   │   │   ├── companies/
│   │   │   │   └── CompanyCard/
│   │   │   │       ├── CompanyCard.jsx
│   │   │   │       └── CompanyCard.css
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── SaveSearchModal/
│   │   │       ├── SaveSearchModal.jsx
│   │   │       └── SaveSearchModal.css
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SavedSearchContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useFocusTrap.js
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
│   │   │   ├── NotFoundPage/
│   │   │   |   ├── NotFoundPage.jsx
│   │   │   |   └── NotFoundPage.css
│   │   │   └── ProfilePage/
│   │   │       ├── ConnectedAccounts.jsx
│   │   │       ├── ProfilePage.jsx
│   │   │       └── ProfilePage.css
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
│   │   │   ├── variables.css
│   │   │   └── dark-mode-overrides.css
│   │   ├── App.jsx
│   │   └── main.jsx
|   ├── i18n.js
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
│   │   │   ├── jobMatchController.js
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
│   │   │   ├── rateLimiter.js
│   │   │   ├── searchLogger.js
│   │   │   └── auditLogger.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── coverLetterRoutes.js
│   │   │   ├── employerRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   ├── jobMatchRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── searchSuggestionRoutes.js
│   │   │   ├── savedJobsRoutesjs
│   │   │   ├── savedSearchRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── queues/
│   │   │   └── emailQueue.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── application.service.js
│   │   │   ├── jobMatchingService.js
│   │   │   └── resumeParser.js
│   │   ├── cron/
│   │   │   ├── dailyJobAlert.js
│   │   │   └── dailyJobMatching.js
│   │   ├── utils/
│   │   │    ├── generateToken.js
│   │   │    └── searchParser.js
│   │   ├── validator/
│   │   │   └── application.validator.js
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
│   │   ├── test-searche-logs.js
│   │   ├── test-email-queue-response-time.js
│   │   ├── test-reports.js
│   │   ├── test-KPI.js
│   │   ├── test-insert-resume.js
│   │   ├── test-parser-fork.js
│   │   ├── test-fulltext-search.js
│   │   ├── test-suggestions.js
│   │   ├── test-update-resume.js
│   │   ├── test-analytics.js
│   │   ├── test-job-matching.js
│   │   ├── test-report-resolution.js
│   │   ├── test-cover-letters.js
│   │   └── test-advanced-search.js
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
```

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

### Audit Log Testing

If the `audit_logs` table shows `0` records after database setup, this is expected. The table is created during setup, but records are only inserted after security-sensitive actions occur.

To test audit logging:

1. Start the backend server:

```bash
cd server
node server.js
```

Perform one of the following actions:
Successful login
Failed login
Password change
User ban or unban
User role change
Job deletion
Company verification
Report resolution
Check the audit logs in MySQL:

```SQL
SELECT id, user_id, action, ip_address, user_agent, details, created_at
FROM audit_logs
ORDER BY created_at DESC;
```

Expected actions include:

```bash
LOGIN_SUCCESS
LOGIN_FAILURE
PASSWORD_CHANGE
ROLE_CHANGE
USER_BAN
USER_UNBAN
JOB_DELETE
COMPANY_VERIFY
REPORT_RESOLUTION
```

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
ADMIN_EMAIL=your-email@example.com # for test script

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
ADMIN_EMAIL=your-email@example.com # for test script only

# Google OAuth

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# LinkedIn OAuth

LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

## API Endpoints

### Authentication Routes (/api/auth)

| Method | Endpoint               | Description                                  | Access  |
| ------ | ---------------------- | -------------------------------------------- | ------- |
| POST   | `/register`            | Register a new user (job_seeker or employer) | Public  |
| POST   | `/login`               | Login user, returns JWT token                | Public  |
| GET    | `/profile`             | Get current user profile (requires JWT)      | Private |
| GET    | `/google`              | Initiate Google OAuth login                  | Public  |
| GET    | `/google/callback`     | Google OAuth callback                        | Public  |
| GET    | `link/google`          | Link Google to existing account              | Private |
| Delete | `/me/social/:provider` | Unlink social provider                       | Private |

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
| Method | Endpoint | Description | Access |
| ------ | ------------------- | ------------------------------------------ | -------------- |
| GET | `/jobs` | Get jobs with filters, sorting, pagination | Public |
| GET | `/jobs/:id` | Get single job details | Public |
| GET | `/jobs/me` | Get employer jobs | Employer |
| GET | `/jobs/recommended` | Get recommended jobs | Job Seeker |
| POST | `/jobs` | Create a new job | Employer |
| PUT | `/jobs/:id` | Update a job | Employer/Admin |
| DELETE | `/jobs/:id` | Delete a job | Employer/Admin |

**Application Routes (/api/applications)**
| Method | Endpoint | Description | Access |
| ------ | -------------------------- | ------------------------- | ---------- |
| GET | `/applications/me` | Get user applications | Job Seeker |
| GET | `/applications/employer` | Get employer applicants | Employer |
| POST | `/applications` | Submit job application | Job Seeker |
| PUT | `/applications/:id/status` | Update application status | Employer |
| DELETE | `/applications/:id` | Withdraw application | Job Seeker |

**Saved Jobs Routes (/api/saved-jobs)**
| Method | Endpoint | Description | Access |
| ------ | -------------------- | ---------------- | ---------- |
| GET | `/saved-jobs` | Fetch saved jobs | Job Seeker |
| POST | `/saved-jobs` | Save a job | Job Seeker |
| DELETE | `/saved-jobs/:jobId` | Remove saved job | Job Seeker |

**Saved Searches Routes (`/api/saved-searches`)**
| Method | Endpoint | Description | Access |
| ------ | ---------------------------------- | ------------------------------- | ---------- |
| GET | /saved-searches | Get all saved searches for user | Job Seeker |
| POST | /saved-searches | Create a new saved search | Job Seeker |
| PUT | /saved-searches/:id | Update a saved search | Job Seeker |
| DELETE | /saved-searches/:id | Delete a saved search | Job Seeker |
| GET | /saved-searches/unsubscribe/:token | Deactivate search by token | Public |

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

**Job Matching Routes (`/api/job-matches`)**
| Method | Endpoint | Description | Access |
| ------ | -------- | ----------- | ------ |
| GET | `/me` | Get stored job recommendations for the logged-in job seeker | Private |
| POST | `/recalculate/me` | Recalculate job matches for the logged-in job seeker | Private |
| POST | `/recalculate/all` | Recalculate job matches for all job seekers | Private/Admin |

#### Get My Job Matches

**GET** `/api/job-matches/me`

Returns stored job recommendations ordered by highest match score.

#### Recalculate My Job Matches

**POST** `/api/job-matches/recalculate/me`

Recalculates and stores job match scores for the authenticated job seeker.

#### Recalculate All Job Matches

**POST** `/api/job-matches/recalculate/all`

Recalculates job match scores for all job seeker users. This route should be restricted to admin users in production.

**Cover Letters Routes (/api/cover-letters)**
| Method | Endpoint | Description | Access |
| ------ | -------------------------- | ----------------------------------------------------- | ---------- |
| GET | /cover-letters | Get all cover letters for the authenticated user | Job Seeker |
| POST | /cover-letters | Create a new cover letter (name and content required) | Job Seeker |
| PUT | /cover-letters/:id | Update name and/or content (owner only) | Job Seeker |
| DELETE | /cover-letters/:id | Delete a cover letter (owner only) | Job Seeker |
| PUT | /cover-letters/:id/default | Set a cover letter as default (unsets others) | Job Seeker |

**Create cover letter**
**POST** `/api/cover-letters`
**Authorization:** `Bearer <token>`
**Content-Type:** `application/json`

{
"name": "My Cover Letter",
"content": "Dear Hiring Manager,\n\nI am a passionate developer..."
}

**Company Routes (/api/companies)**
| Method | Endpoint | Description | Access |
| ------ | ---------------- | ---------------------------- | ------ |
| GET | `/companies` | Fetch all companies | Public |
| GET | `/companies/:id` | Fetch single company details | Public |

**Admin Routes (/api/admin)**
| Method | Endpoint | Description | Access |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------- | ------ |
| GET | `/admin/users` | Fetch all users | Admin |
| PATCH | `/admin/users/:id/toggle` | Toggle user active status | Admin |
| GET | `/admin/jobs` | Fetch all jobs | Admin |
| DELETE | `/admin/jobs/:id` | Delete job | Admin |
| GET | `/admin/companies` | Fetch all companies | Admin |
| GET | `/admin/stats/overview` | Fetch dashboard analytics | Admin |
| GET | `/admin/analytics/overview` | Fetch overview totals (users, jobs, etc.) | Admin |
| GET | `/admin/analytics/timeline` | Daily counts (users, jobs, applications) last N days | Admin |
| GET | `/admin/analytics/popular` | Top job types, locations, categories | Admin |
| GET | `/admin/analytics/retention` | Retention data and weekly cohorts | Admin |
| GET | `/admin/analytics/kpi` | KPI cards with percent change (Total Users, Active Jobs, Applications, Pending Reports) | Admin |
| GET | `/admin/reports` | Fetch job reports (with filters & pagination) | Admin |
| GET | `/admin/reports/stats` | Get report statistics (pending, approved, removed, dismissed) | Admin |
| GET | `/admin/reports/:id` | Get single report details | Admin |
| PUT | `/admin/reports/:id/status` | Update report status (approved / removed / dismissed) + notify reporter | Admin |

| Method | Endpoint                     | Description      |
| ------ | ---------------------------- | ---------------- |
| GET    | `/api/admin/users`           | Get all users    |
| PUT    | `/api/admin/users/:id/ban`   | Ban user         |
| PUT    | `/api/admin/users/:id/unban` | Unban user       |
| PUT    | `/api/admin/users/:id/role`  | Change user role |
| DELETE | `/api/admin/users/:id`       | Delete user      |

**Reports Routes (/api/reports)**
| Method | Endpoint | Description | Access |
| POST | `/reports` | Submit a report for a job | Authenticated |

#### Analytics Endpoints (Admin‑only)

These endpoints are part of the admin routes (`/api/admin/analytics/…`). They require a valid admin JWT token.

- **overview** – returns total users, jobs, active jobs, applications, companies, and verified companies.
- **timeline** – accepts `?days=7` (or any number) and returns daily new users, jobs, and applications.
- **popular** – returns top 10 active job types, locations, and categories.
- **retention** – returns active/inactive users and weekly new‑user cohorts for the last 12 weeks.
- **kpi** – returns an array of 4 KPI objects: `{ label, value, change }` where `change` is percentage vs previous week.

**Salary Estimate Endpoint (`/api/salary`)**
| Method | Endpoint | Description | Access |
| ------- | ----------- | --------------------------------------------- | ------ |
| GET | `/estimate` | Get market salary data for a title & location | Public |

**Example request:**
GET `/api/salary/estimate?title`=Frontend Developer&location=Remote

**Example response:**
{
"average": 95000,
"median": 92000,
"p25": 80000,
"p75": 110000,
"sampleCount": 42
}

If sampleCount < 5, the salary comparison badge will be hidden.

**Salary Estimate Endpoint (`/api/salary/trend`)**

| Method | Endpoint | Description                                         | Access |
| ------ | -------- | --------------------------------------------------- | ------ |
| GET    | `/trend` | Get monthly average salaries over the last N months | Public |

**Example request:**
GET `/api/salary/trend?title`=Frontend Developer&location&location=Remote&months=6

**Example response:**
{
"trend": [
{ "month": "2025-12", "avg": 92000 },
{ "month": "2026-01", "avg": 93500 },
...
],
"percentiles": {
"p25": 85000,
"p50": 94000,
"p75": 102000
}
}

If `trend` is empty or `percentiles` missing, the section shows an appropriate error message.

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
| Method | Endpoint | Description | Access |
| ------- | ---------- | ------------------------- | -------------- |
| POST | `/reports` | Submit a report for a job | Authenticated |

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
| -------------- | ------------------------------------------ |
| **Job Seeker** | Home, Jobs, Companies, Dashboard           |
| **Employer**   | Home, Jobs, Companies, Dashboard, Post Job |
| **Admin**      | Home, Jobs, Companies, Admin Panel         |
| **Guest**      | Home, Jobs, Companies, Login, Register     |

## Footer Implementation

**Location:** `client/src/components/common/Footer/Footer.jsx`

### Footer Sections

| Section           | Links                                                        |
| ----------------- | ------------------------------------------------------------ |
| **Brand**         | SmartHire logo, tagline                                      |
| **Platform**      | Find Jobs, Browse Companies, Salaries, Career Advice         |
| **For Employers** | Post a Job, Hiring Solutions, Pricing, Resources             |
| **Support**       | Help Center, Privacy Policy, Terms of Service, Cookie Policy |

### Responsive Breakpoints

| Screen Size               | Layout    |
| ------------------------- | --------- |
| **Desktop (>1024px)**     | 4 columns |
| **Tablet (768px-1024px)** | 2 columns |
| **Mobile (<768px)**       | 1 column  |

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
| Screen Size | Layout |
| --------------------------|--------------------------------------|
| **Desktop (>1024px)** | Two columns (main content + sidebar) |
| **Tablet (768px–1024px)** | Two columns, adjusted spacing |
| **Mobile (<768px) ** | Single column, stacked layout |

**Page Sections:**
| Section | Description |
| -------------- | ----------------------------------------------------------- |
| Match Insights | SmartHire AI match percentage (visible only to job seekers) |
| Job Header | Title, company, logo, posted date, action buttons |
| Apply Section | Prominent Apply Now button with states |
| Metadata Grid | Location, job type, salary, experience level |
| Main Content | The Role, Key Responsibilities, Requirements, Benefits |
| Sidebar | Job Overview, About Company, Share/Print actions |
| Similar Jobs | 3 related job cards |

**Action Buttons:**
| Button | Function | State |
| --------- | ---------------------- | ---------------------------------------------- |
| Save Job | Toggle save/unsave job | Heart outline (unsaved) / filled heart (saved) |
| Share | Copy URL to clipboard | Shows toast "Link copied!" |
| Print | Print job details | Browser print dialog |
| Apply Now | Submit application | Default / Loading / Disabled (applied) |

**Error Handling:**

- 404 page when job ID is invalid
- Loading skeleton while fetching data
- Error message with retry option
- Toast notifications for user actions

#### Salary Comparison Badge Component

**Location:** `client/src/components/salary/SalaryComparisonBadge.jsx`

**Features:**

- Displays a colored pill next to the salary range indicating if the job’s salary is **above market** (green), **market average** (yellow), or **below market** (red).
- Calculated by comparing the job’s salary midpoint against market average for the same title and location.
- **Hover over the badge** to see a tooltip showing market statistics:
  `Average`, `Median`, `25th percentile`, `75th percentile`, and `Sample count`.
- Fetches market data from `GET /api/salary/estimate` (backend endpoint required – see WBS 27).
- Fully responsive – badge wraps on mobile, tooltip adjusts for small screens.
- Supports dark mode with adaptive colors (`.dark` class + `prefers-color-scheme`).

**Example of what the user will see next to the salary range:**
$80,000 - $110,000 [Green badge: "Above market"]

**Hovering shows tooltip:**
Market data for Frontend Developer
Avg: $95,000 Median: $92,000
25th %ile: $80,000 75th %ile: $110,000
Based on 42 salaries

#### Salary Trend Chart & Percentiles (Salary Insights)

**Location:** `client/src/components/salary/SalaryComparisonBadge.jsx`

**Features:**

- Collapsible "Salary Insights" section added to the Job Details page below the main content.
- Line chart (using Chart.js) displays the monthly average salary trend over the last 6 months for the same job title and location.
- Percentile bars show the 25th, 50th (median), and 75th percentiles as horizontal bars, with the median bar highlighted in a different colour (yellow).
- Fully responsive – on mobile, the chart and percentiles stack vertically, and chart height adjusts.
- Supports dark mode with adaptive colours.
- The section is lazy‑loaded (only fetches data when expanded) to improve performance.

**Example of what the user will see when expanding "Salary Insights":**
[Salary Insights ▼] ← click to expand

- Line chart: average salary from Dec 2025 to May 2026 (monthly points with tooltips)
- Percentile bars:
  - 25th ████████░░░░░░ $85,000
  - 50th (Median) ██████████░░░░ $94,000
  - 75th ██████████████░░░ $102,000

**Implementation details:**

- The SalaryInsights component uses react-chartjs-2 and chart.js.
- The salaryAPI object in api.js was extended with getTrend(title, location, months = 6).
- The component is placed in client/src/components/salary/SalaryInsights.jsx with accompanying CSS.
- It is integrated into JobDetailsPage.jsx after the job content grid and before the similar jobs section.

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
| Screen Size | Columns |
| --------------------------------| ----------|
| **Desktop (>1200px)** | 4 columns |
| **Large Tablet (992px–1200px)** | 3 columns |
| **Tablet (768px–992px)** | 2 columns |
| **Mobile (<768px)** | 1 column |

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
| Screen Size | Layout |
| --------------------------| ------------------------------------------------|
| **Desktop (>1024px)** | Full width with tabs |
| **Tablet (768px–1024px)** | Adjusted spacing, 2 columns for contact grid |
| **Mobile (<768px)** | Stacked layout, smaller logo, 1 column for jobs |

**Page Sections:**
| Section | Description |
| -------------- | ------------------------------------------------------- |
| Match Insights | SmartHire AI skill alignment (visible to job seekers) |
| Banner | Company banner image with gradient placeholder |
| Header | Company logo, name, verified badge, location, job count |
| Tabs | Open Positions and About tabs |
| Open Positions | Job cards grid showing all active jobs |
| About | Company description, contact information, map |

## JobCard Component

**Location:** `client/src/components/jobs/JobCard/JobCard.jsx`

**File Structure:**
client/src/components/jobs/JobCard/
├── JobCard.jsx
└── JobCard.css

**Job Type Colors:**
| Job Type | Color | CSS Class |
| ---------- | ------ | --------------------- |
| Full-time | Green | `job-type-full-time` |
| Part-time | Yellow | `job-type-part-time` |
| Remote | Blue | `job-type-remote` |
| Contract | Purple | `job-type-contract` |
| Internship | Orange | `job-type-internship` |

## CompanyCard Component

**Location:** `client/src/components/companies/CompanyCard/CompanyCard.jsx`

**File Structure:**
client/src/components/companies/CompanyCard/
├── CompanyCard.jsx
└── CompanyCard.css

**Props:**
| Prop | Type | Default | Description |
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
| Prop | Type | Default | Description |
| ----------- | -------- | --------- | ----------------------------------------- |
| `variant` | string | `primary` | Button style variant |
| `size` | string | `md` | Button size |
| `isLoading` | boolean | `false` | Shows loading spinner |
| `disabled` | boolean | `false` | Disables button |
| `onClick` | function | — | Click handler |
| `type` | string | `button` | Button type (`button`, `submit`, `reset`) |
| `fullWidth` | boolean | `false` | Makes button take full width |
| `children` | node | — | Button content (text, icon, etc.) |

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
| Prop | Type | Default | Description |
| -------------------- | -------- | ------- | ---------------------------------------- |
| `label` | string | — | Input label text |
| `type` | string | `text` | Input type |
| `name` | string | — | Input name attribute |
| `value` | any | — | Input value |
| `onChange` | function | — | Change handler |
| `error` | string | — | Error message |
| `placeholder` | string | — | Placeholder text |
| `required` | boolean | `false` | Shows required asterisk |
| `disabled` | boolean | `false` | Disables input |
| `rows` | number | `4` | Number of rows (for textarea) |
| `options` | array | `[]` | Options for select dropdown |
| `showPasswordToggle` | boolean | `true` | Shows/hides eye icon for password fields |

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
| Prop | Type | Default | Description |
| ----------- | -------- | ------- | ---------------------------- |
| `type` | string | — | Tag type (determines color) |
| `children` | node | — | Tag content |
| `removable` | boolean | `false` | Shows remove (✕) button  
| `onRemove` | function | — | Handler for removing the tag |

## TagGroup Component

**Location:** `client/src/components/common/TagGroup/TagGroup.jsx`

**File Structure:**
client/src/components/common/TagGroup/
├── TagGroup.jsx
└── TagGroup.css

**Props:**
| Prop | Type | Default | Description |
| ------------ | ------- | -------- | ---------------------------------- |
| `tags` | array | required | Array of tag objects |
| `maxDisplay` | number | `3` | Max tags to show before collapsing |
| `showExpand` | boolean | `true` | Shows expand/collapse button |

### LoginPage Component

**Location:** `client/src/pages/LoginPage/LoginPage.jsx`

**File Structure:**
client/src/pages/LoginPage/
├── LoginPage.jsx
└── LoginPage.css

**Form Validation:**
| Field | Validation Rules | Error Message |
| -------- | ------------------------------ | ----------------------------------------------------------------- |
| Email | Required, valid email format | "Email is required" / "Please enter a valid email address" |
| Password | Required, minimum 6 characters | "Password is required" / "Password must be at least 6 characters" |

**Responsive Breakpoints:**
| Screen Size | Hero Section | Form Layout | Social Buttons |
| ------------------------ | ------------ | ------------ | -------------- |
| **Desktop (>968px)** | Visible | Side by side | Horizontal |
| **Tablet (768px–968px)** | Visible | Stacked | Horizontal |
| **Mobile (<768px)** | Hidden | Full width | Vertical |

**Test Credentials:**
| Role | Email | Password | Dashboard |
| ---------- | ----------------------------------------------------- | ----------- | --------------------- |
| Job Seeker | [jobseeker@example.com](mailto:jobseeker@example.com) | password123 | `/dashboard/seeker` |
| Employer | [employer@example.com](mailto:employer@example.com) | password123 | `/dashboard/employer` |
| Admin | [admin@example.com](mailto:admin@example.com) | password123 | `/dashboard/admin` |

### RegisterPage Component

**Location:** `client/src/pages/RegisterPage/RegisterPage.jsx`

**File Structure:**
client/src/pages/RegisterPage/
├── RegisterPage.jsx
└── RegisterPage.css

**Form Validation:**
| Field | Validation Rules | Error Message |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Full Name | Required, min 2 chars, letters/spaces/hyphens/apostrophes only | "Full name is required" / "Name must be at least 2 characters" / "Name can only contain letters, spaces, hyphens, and apostrophes" |
| Email | Required, valid email format | "Email is required" / "Invalid email address" |
| Password | Required, min 6 chars, at least 1 number | "Password is required" / "Password must be at least 6 characters" / "Password must contain at least one number" |
| Confirm Password | Required, must match password | "Please confirm your password" / "Passwords do not match" |
| Company Name | Required only if role = employer | "Company name is required for employers" |

**Conditional Logic:**

- Company Name field appears only when Employer role is selected
- Field is removed when switching back to Job Seeker

**Responsive Breakpoints:**
| Screen Size | Hero Section | Form Layout |
| ------------------------ | ------------ | ----------- |
| **Desktop (>968px)** | Visible | Side by side|
| **Tablet (768px–968px)** | Visible | Stacked |
| **Mobile (<768px)** | Hidden | Full width |

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
| Stat | Description |
| ----------------- | ------------------------------------ |
| Profile Strength | Percentage of profile completeness |
| Applied | Total number of applications |
| Interviewing | Applications in interviewing stage |
| Offers | Applications that received an offer |

**Application Status Badges:**
| Status | Color | CSS Class |
| ------------- | ------- | ------------------- |
| pending | Yellow | `status-pending` |
| reviewed | Blue | `status-reviewed` |
| offered | Green | `status-offered` |
| rejected | Red | `status-rejected` |
| hired | Green | `status-hired` |

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
| Screen Size | Layout |
| ------------------------ | ------------------------------ |
| **Desktop (>1024px)** | Sidebar + main content (2‑col) |
| **Tablet (768px–1024px)**| Sidebar collapses, full width |
| **Mobile (<768px)** | Stacked layout |

### EmployerDashboard Component

**Location:** `client/src/pages/dashboard/employer/EmployerDashboard.jsx`

**File Structure:**
client/src/pages/dashboard/employer/
├── EmployerDashboard.jsx
└── EmployerDashboard.css

**Stats Cards:**
| Stat | Description |
| -------------------- | ---------------------------------- |
| Total Applicants | All applications received |
| Active Jobs | Number of currently active jobs |
| Interviews Scheduled | Applications in interviewing stage |
| Pending Offers | Applications with offers sent |

**Application Status Badges**
| Status | Color | CSS Class |
| ------------ | ------ | --------------------- |
| pending | Yellow | `status-pending` |
| reviewed | Blue | `status-reviewed` |
| shortlisted | Green | `status-shortlisted` |
| rejected | Red | `status-rejected` |
| hired | Green | `status-hired` |

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
| Screen Size | Layout |
| ------------------------- | ------------------------------ |
| **Desktop (>1024px)** | Sidebar + main content (2-col) |
| **Tablet (768px–1024px)** | Sidebar collapses, full width |
| **Mobile (<768px)** | Stacked layout |

### AdminDashboard Component

**Location:** `client/src/pages/dashboard/admin/AdminDashboard.jsx`

**File Structure:**
client/src/pages/dashboard/admin/
├── AdminDashboard.jsx
└── AdminDashboard.css

**Stats Cards (Overview):**
| Stat | Description |
| -------------- | -------------------------- |
| Total Users | Total registered users |
| Active Users | Users currently active |
| Total Jobs | Total jobs in the platform |
| Active Jobs | Jobs currently active |
| Companies | Total registered companies |
| Inactive Users | Users currently inactive |

**Status Badges (Tables):**
| Type | Color | CSS Class |
| -------- | ----- | ----------------------- |
| Active | Green | `status-badge active` |
| Inactive | Red | `status-badge inactive` |

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
| Screen Size | Layout |
| ------------------------- | ------------------------------------------ |
| **Desktop (>1024px)** | Sidebar + main content (2‑col) |
| **Tablet (768px–1024px)** | Sidebar collapses, full width |
| **Mobile (<768px)** | Stacked layout, tables scroll horizontally |

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
| Prop | Type | Default | Description |
| -------------- | ----- | -------- | ------------------------------------------ |
| `children` | node | required | Components to render if authorized |
| `allowedRoles` | array | `[]` | Array of roles allowed to access the route |

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

### KeyboardShortcuts Component

**Location:** `client/src/components/common/KeyboardShortcuts/KeyboardShortcuts.jsx`

**File Structure:**

```text
client/src/components/common/KeyboardShortcuts/
├── KeyboardShortcuts.jsx
└── KeyboardShortcuts.css
```

**Features:**

- Global keyboard shortcut listener using window.addEventListener("keydown", ...)
- Uses React Router useNavigate() for route navigation
- Uses useLocation() to detect the current route
- Uses useAuth() so dashboard navigation matches the logged-in user role
- Prevents shortcut activation while typing inside inputs, textareas, selects, or editable content
- Supports keyboard shortcut help panel using the ? key
- Supports Escape key to close help panel, close active modal, or blur the active element
- Uses simple helper functions for readable student-friendly code

**Supported Shortcuts:**
| Shortcut | Action |
| --------- | ----------------------------------------------- |
| `Alt + S` | Opens Jobs page and focuses job search input |
| `Alt + J` | Opens Jobs page |
| `Alt + H` | Opens Home page |
| `Alt + D` | Opens correct dashboard based on logged-in role |
| `Esc` | Closes modal/help panel or removes focus |
| `?` | Opens or closes keyboard shortcut help panel |

**Dashboard Route Mapping:**
| Role | Route |
| ----------------------- | --------------------- |
| `job_seeker` | `/dashboard/seeker` |
| `employer` | `/dashboard/employer` |
| `admin` | `/dashboard/admin` |
| Guest / unauthenticated | `/login` |

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
| \*                      | NotFoundPage       | Public          |

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

### Database Schema

#### Tables Created

| Table                      | Description                                                | Records (seed) |
| -------------------------- | ---------------------------------------------------------- | -------------- |
| **roles**                  | User roles (job_seeker, employer, admin)                   | 3              |
| **companies**              | Company profiles                                           | 3              |
| **users**                  | User accounts (all roles)                                  | 5              |
| **job_seekers**            | Extended job seeker information                            | 0              |
| **employers**              | Extended employer information (links to companies)         | 0              |
| **job_categories**         | Job categories                                             | 8              |
| **job_types**              | Job types (full-time, part-time, etc.)                     | 6              |
| **locations**              | Location master data                                       | 7              |
| **skills**                 | Skills master list                                         | 8              |
| **jobs**                   | Job postings (FK to companies, categories, etc.)           | 15             |
| **applications**           | Job applications                                           | 5              |
| **resumes**                | Stored resume files (audit log)                            | 2              |
| **saved_jobs**             | Jobs saved/bookmarked by job seekers                       | 3              |
| **shortlisted_candidates** | Employer-shortlisted candidates                            | 2              |
| **notifications**          | User notifications                                         | 3              |
| **job_seeker_skills**      | Skills associated with job seekers                         | 6              |
| **job_required_skills**    | Skills required for each job                               | 7              |
| **activity_logs**          | System activity audit trail                                | 4              |
| **audit_logs**             | Security-sensitive action logs for forensic analysis       | 0              |
| **job_matches**            | Stores calculated job matching scores and score breakdowns | 0              |
| **contact_messages**       | Contact form submissions                                   | 2              |
| **saved_searches**         | Saved job search criteria with alerts                      | 3              |
| **messages**               | Internal messaging between users                           | 0              |
| **statistics**             | Aggregated platform statistics                             | 0              |
| **email_logs**             | Email queue delivery logs                                  | 0              |
| **cron_state**             | Tracks last-run timestamps for scheduled jobs              | 1              |
| **job_reports**            | User reports on jobs (spam, fraud, etc.)                   | 0              |
| **cover_letters**          | Cover letter templates                                     | 0              |
| **search_logs**            | Search term logs for autocomplete & typo tolerance         | 0              |

### job_matches Table

The `job_matches` table stores personalised job recommendation scores generated by the backend job matching algorithm.

| Column               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `id`                 | Primary key                                              |
| `user_id`            | Job seeker user ID                                       |
| `job_id`             | Matched job ID                                           |
| `match_score`        | Final normalised score from 0 to 100                     |
| `keyword_score`      | TF-IDF keyword similarity score                          |
| `location_score`     | Location match score                                     |
| `job_type_score`     | Job type match score                                     |
| `salary_score`       | Salary alignment score                                   |
| `history_score`      | Score based on saved/applied job history                 |
| `matching_keywords`  | Keywords shared between the user profile and job content |
| `reason_summary`     | Short explanation of why the job was recommended         |
| `last_calculated_at` | Timestamp of the latest score calculation                |
| `created_at`         | Record creation timestamp                                |
| `updated_at`         | Record update timestamp                                  |

#### Table Purpose

This table allows SmartHire to store precomputed job recommendations instead of recalculating them every time the dashboard loads. It improves performance and allows daily recommendation updates through the scheduled cron job.

## Troubleshooting

| Issue                                             | Resolution                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Navbar items squished                             | Restart Vite environment using `rm -rf node_modules/.vite && npm run dev`       |
| CSS not applying                                  | Verify correctness of import paths in component files                           |
| JobCard not showing                               | Validate API response structure and component props                             |
| Footer not sticky                                 | Apply `min-height: 100vh` and `flex-direction: column` to layout                |
| Form validation not working                       | Verify `validators.js` import path                                              |
| HomePage featured jobs not showing                | Ensure featured jobs exist within the database                                  |
| Search redirect not working                       | Validate `AuthContext` configuration and route guards                           |
| Icons not showing                                 | Include Google Fonts link in `index.html`                                       |
| Filters not working                               | Validate URL query parameters, backend filters, and state management            |
| Mobile filter drawer not showing                  | Review CSS media query configurations                                           |
| Apply button not working                          | Verify authentication state and user role permissions                           |
| Similar jobs not showing                          | Validate backend query logic for similar jobs                                   |
| Company search not working                        | Ensure companies endpoint returns valid dataset                                 |
| Company cards not showing                         | Verify `CompanyCard` component import                                           |
| Company details not showing                       | Validate company ID in URL and API response                                     |
| Database connection error                         | Ensure MySQL service is running and `.env` configuration is correct             |
| Protected route redirecting                       | Validate `AuthContext` and token persistence logic                              |
| 404 page not showing                              | Ensure wildcard (`*`) route is defined last in routing configuration            |
| Login not working                                 | Validate test credentials and authentication logic                              |
| Toast notifications not showing                   | Ensure `react-hot-toast` is installed and `<Toaster />` is rendered             |
| 500 Internal Server Error                         | Inspect server logs and verify database schema                                  |
| JWT_SECRET missing                                | Define `JWT_SECRET` in `.env` (minimum 32 characters)                           |
| Rate limit exceeded                               | Wait cooldown period or restart server instance                                 |
| Apply button stays enabled after applying         | Validate application status handling from backend                               |
| Saved jobs not appearing in dashboard             | Verify `saved_jobs` API response integrity                                      |
| Charts not loading                                | Validate Recharts integration and `/api/admin/stats/overview` endpoint          |
| Email not sending                                 | Verify SMTP configuration and run test script                                   |
| Save search modal not opening                     | Validate `SaveSearchModal` import and state logic                               |
| Saved search limit not enforced                   | Implement backend constraint (maximum 10 per user)                              |
| 429 Too Many Requests (email)                     | Wait 60 seconds before retrying request                                         |
| Resume upload not appearing                       | Verify `ResumeUpload` component integration and `resumeUrl` binding             |
| Drag-and-drop not working                         | Validate file constraints and event handlers                                    |
| Progress bar not showing                          | Verify `USE_MOCK=true` flag or API integration                                  |
| Delete resume fails                               | Validate backend endpoint or test with mock mode                                |
| Cron job not running                              | Ensure `startDailyJobAlert()` is invoked and Redis is operational               |
| Unsubscribe link invalid                          | Regenerate tokens using UUID update query                                       |
| Daily alert email not received                    | Validate `cron_state.last_run` and job availability                             |
| Report not submitting                             | Verify `jobId`, authentication state, and Redis availability                    |
| Rate limit hit on reports                         | Wait 24 hours or reset Redis key                                                |
| Resume upload fails with "Unexpected end of form" | Ensure file integrity; use valid text-based PDF                                 |
| Resume upload parsed_data is NULL                 | Parser failure (likely scanned PDF); use text-based PDF                         |
| Resume record not stored in database              | Verify DB insert logic, `req.user.id`, and schema                               |
| Cover letter creation fails                       | Ensure `cover_letters` table exists and DB connection is active                 |
| FULLTEXT search error                             | Add FULLTEXT index on relevant columns                                          |
| SQL syntax error on search                        | Apply fallback logic (`sort='recent'`) when query is empty                      |
| Suggestions endpoint returns empty                | Populate `search_logs` via prior search queries                                 |
| Cover letter not saving                           | Validate input fields, inspect browser console, ensure backend routing          |
| Rich text editor not showing                      | Install `react-quill-new` and import stylesheet                                 |
| Reports not loading in Admin Dashboard            | Validate `/api/admin/reports` endpoint and filtering logic                      |
| Confirmation modal not opening                    | Verify `isModalOpen` state and CSS imports                                      |
| Report email not sent                             | Ensure Bull/Redis queue and template configuration                              |
| Resolved report still visible                     | Refresh data via `fetchReportsData()` or validate pagination                    |
| Report resolution failure toast                   | Ensure report is not already resolved                                           |
| Charts not updating on date change                | Validate `dateRange` state propagation                                          |
| CSV export not downloading                        | Verify `downloadCSV` implementation and data availability                       |
| Auto-refresh not triggering                       | Ensure toggle state and `setInterval` execution                                 |
| Last refresh timestamp not updating               | Ensure timestamp update within `fetchData()`                                    |
| Profile incomplete on Apply with Resume           | Complete required profile fields in dashboard                                   |
| Salary Insights chart not showing                 | Verify `chart.js` and `react-chartjs-2` installation and backend data integrity |
| Theme not persisting after page reload            | Check `localStorage` integration in `ThemeContext.jsx`                          |
| Theme toggle button not visible                   | Verify `ThemeContext` is imported and used in `Navbar.jsx`                      |
| Dark mode colors not applying                     | Ensure `data-theme` attribute is set on `<html>` and CSS variables are correct  |

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
- Cloud deployment using Vercel, Render, or Railway
- Real-time notification system using Socket.io
- Email verification and password reset
- Chat between employers and job seekers
- Job application tracking with a timeline view
- AI-powered job recommendations
- Smart matching score between candidate profile and job requirements
- Interview scheduling system
- Mobile native app using React Native
- Structured resume API integration such as Affinda for higher-accuracy parsing
- Automated accessibility testing using Lighthouse and Axe DevTools
- Unit and integration tests for keyboard shortcuts
- Unit tests for `useFocusTrap.js`
- Customizable keyboard shortcuts for user preference
- More advanced admin analytics and downloadable reports
- User-level theme customization options
- More advanced high contrast mode options
- Add Nepali language support
- Add RTL language support
- Add backend-driven translation management
- Add lazy-loaded translation namespaces

## License

SmartHire is a college project created for learning full‑stack web development. The code is open‑sourced under the [MIT License](LICENSE) (or “MIT”) – you’re welcome to study, reuse, or build upon it, but please attribute the original work to this repository.

## Goal

The goal of SmartHire is to provide an accessible, scalable, responsive, multilingual, and production-ready job portal platform for job seekers, employers, and administrators.

### Completed So Far:

**Frontend and UI Components:**

- React + Vite + CSS frontend environment with responsive design
- Navbar(role-based, active highlighting, mobile drawer)
- Footer (4 cloumns, newsletter, social links)
- Homepage (hero, CTA, searchbar, featured jobs, "How It Works")
- JobsPage (debounced search, URL query sync, filters, pagination, sorting, clear filters, mobile drawer, "Save this search" modal)
- JobDetailsPage (dynamic fetch, apply flow, duplicate prevention, save flow, similar jobs, report job modal, Apply with Resume, Salary Comparison Badge)
- CompaniesPage (search, responsive grid, company cards)
- LoginPage (email/password validation, remember me, role-based redirects, social login with Google, LinkedIn disabled)
- RegisterPage (full validation, role dropdown, conditional company name)
- JobSeekerDashboard (overview, applied jobs, saved jobs, profile edit, resume upload with auto‑fill preview panel, drag‑and‑drop progress bar)
- EmployerDashboard (overview, job creation/editing/deletion, applicant management)
- AdminDashboard (KPI cards, charts, tables, reports, date range picker, export CSV, auto-refresh)
- JobDetailsPage (dynamic fetch, apply flow, duplicate prevention, save flow, similar jobs, report job modal, Apply with Resume, Salary Comparison Badge, Salary Insights (trend chart & percentiles))

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
- Salary Aggregation API – `GET /api/salary/estimate` and `GET /api/salary/trend` returns market salary data for the salary comparison badge and trend chart.
- Backend-driven filtering, sorting, and pagination for all job listings

**Email and Backround Jobs:**

- Nodemailer + Resend integration with 5 responsive HTML email templates
- Background email queue (Bull + Redis) – all emails sent asynchronously (`email_logs` audit table)
- Email rate limiting (10/60s per user) with 429 rejection
- Automatic retry with exponential backoff (1min, 5min, 15min) and admin alert on final failure
- Daily job alert cron job (node-cron) – scans active saved searches at 8 AM, sends digests with unsubscribe links
- Notify reporter on resolution – email sent when admin resolves a job report
- **Theme System** – Light/dark mode toggle with persistent user preference using React Context API and CSS variables.

**Advanced Features:**

- FULLTEXT search (`MATCH AGAINST`) with relevance scoring
- Typo tolerance and autocomplete suggestions (SOUNDEX, prefix searches, search logging)
- Advanced search operators – support for `"exact phrase"`, `-exclude`, `OR`, and `AND` using MySQL boolean mode
- Resume parsing (PDF/DOCX) with full CRUD – extracted data is stored in the `parsed_data` column
- Auto-fill profile with parsed resume data – preview panel, editable fields, Save/Discard actions
- Cover Letters – Full CRUD API and frontend UI with rich text editor, modal, and set default option
- Admin Reports Queue UI – Dedicated moderation panel with filters, action buttons, confirmation modal with resolution notes, and email notifications
- Search Term Logging & Keyword Highlighting – All search terms are logged with user/IP for analytics, and matching keywords are highlighted in job titles and descriptions
- Audit Logging – Security-sensitive backend actions are logged asynchronously in the `audit_logs` table for monitoring, accountability, and forensic investigation
- Social Login – Google OAuth fully integrated for login, registration, and profile account linking/unlinking
- Social Login – LinkedIn button disabled because backend activation is pending; frontend UI is present with tooltip
- Salary Comparison Badge – On the job details page, a colored pill with tooltip shows how the job salary compares to market data
- SalaryInsights Component – `client/src/components/salary/SalaryInsights.jsx` provides a collapsible section that fetches and displays salary trend data
- Added Skip to Content link
- Added global keyboard shortcuts
- Added visible keyboard focus indicators
- Added keyboard shortcut help panel
- Added `useFocusTrap.js` reusable hook
- Added modal focus trap for Save Search modal
- Added modal focus trap for JobsPage mobile filter drawer
- Added modal focus trap for JobDetailsPage Report, Apply, and Quick Apply modals
- Added focus return to triggering element after modal close
- Added ARIA improvements for dialogs, filters, buttons, and dynamic status messages
- Fixed `Alt + D` dashboard shortcut using `AuthContext`
- Fixed `Alt + S` job search focus using `id="job-search-input"` and `data-hotkey="job-search"`

**Miscellaneous:**

- Reusable components: Button, Input, Tag, TagGroup, JobCard, CompanyCard, Toast, Footer, Navbar, ResumeUpload
- Complete routing system with protected routes and 404 page
- MySQL database schema with 27+ tables and seed data
- CSS variables for consistent theming and Google Material Icons
- Admin analytics charts using Recharts (line, bar, pie)

**Current Setup Time:** Any developer can clone and run the frontend with mock data in under 10 minutes.
