import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./App.css";
import Navbar from "./components/common/Navbar/Navbar.jsx";
import Footer from "./components/common/Footer/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import KeyboardShortcuts from "./components/common/KeyboardShortcuts/KeyboardShortcuts";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { SavedSearchProvider } from "./contexts/SavedSearchContext";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

// Import all pages
import HomePage from "./pages/HomePage/HomePage";
import JobsPage from "./pages/JobsPage/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage/JobDetailsPage";
import CompaniesPage from "./pages/CompaniesPage/CompaniesPage";
import CompanyDetailsPage from "./pages/CompanyDetailsPage/CompanyDetailsPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import JobSeekerDashboard from "./pages/Dashboard/jobseeker/JobSeekerDashboard";
import EmployerDashboard from "./pages/Dashboard/employer/EmployerDashboard";
import AdminDashboard from "./pages/Dashboard/admin/AdminDashboard";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

function App() {
  const { t } = useTranslation();

  return (
    <ThemeProvider>
      <div className="app">
        {/* Allows keyboard users to skip repeated navigation links */}
        <a href="#main-content" className="skip-link">
          {t("app.skipToContent")}
        </a>
        {/* Toast Notifications - Using CSS classes from globals.css */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: "react-hot-toast",
            success: {
              duration: 3000,
              className: "react-hot-toast react-hot-toast-success",
              iconTheme: {
                primary: "#ffffff",
                secondary: "var(--success-color)",
              },
            },
            error: {
              duration: 4000,
              className: "react-hot-toast react-hot-toast-error",
              iconTheme: {
                primary: "#ffffff",
                secondary: "var(--danger-color)",
              },
            },
            loading: {
              className: "react-hot-toast react-hot-toast-loading",
            },
          }}
        />

        <ScrollToTop />
        <Navbar />

        <SavedSearchProvider>
          <main
            id="main-content"
            className="main-content app-main"
            tabIndex="-1"
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/companies/:id" element={<CompanyDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes - Role based */}

              {/* Job Seeker Dashboard & Sub‑routes */}
              <Route
                path="/dashboard/seeker"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <JobSeekerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/applied-jobs"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <JobSeekerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <JobSeekerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/cover-letters"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <JobSeekerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/profile"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Employer Dashboard & Sub‑routes */}
              <Route
                path="/dashboard/employer"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer/profile"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer/post-job"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer/my-jobs"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer/candidates"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard & Sub‑routes */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 PAGE */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </SavedSearchProvider>

        <Footer />

        {/* Global keyboard shortcut handler for faster navigation */}
        <KeyboardShortcuts />
      </div>
    </ThemeProvider>
  );
}

export default App;
