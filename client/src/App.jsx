import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Navbar from "./components/common/Navbar/Navbar";
import Footer from "./components/common/Footer/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

// Import all pages
import HomePage from "./pages/HomePage/HomePage";
import JobsPage from "./pages/JobsPage/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage/JobDetailsPage";
import CompaniesPage from "./pages/CompaniesPage/CompaniesPage";
import CompanyDetailsPage from "./pages/CompanyDetailsPage/CompanyDetailsPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";

// Dashboard placeholders
const JobSeekerDashboard = () => (
  <div className="dashboard-placeholder">
    <h2>Job Seeker Dashboard</h2>
    <p>Your applications, saved jobs, and profile settings will appear here.</p>
  </div>
);

const EmployerDashboard = () => (
  <div className="dashboard-placeholder">
    <h2>Employer Dashboard</h2>
    <p>
      Your job postings, applications, and company profile will appear here.
    </p>
  </div>
);

const AdminDashboard = () => (
  <div className="dashboard-placeholder">
    <h2>Admin Dashboard</h2>
    <p>
      User management, company verification, and system analytics will appear
      here.
    </p>
  </div>
);

function App() {
  return (
    <div className="app">
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

      <main className="main-content">
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
          <Route
            path="/dashboard/seeker"
            element={
              <ProtectedRoute allowedRoles={["job_seeker"]}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/employer"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Page - Must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
