import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Navbar from "./components/common/Navbar/Navbar.jsx";
import Footer from "./components/common/Footer/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
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
  const location = useLocation();

  return (
    <ThemeProvider>
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

        <SavedSearchProvider>
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <HomePage />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/jobs"
                element={
                  <>
                    <Navbar />
                    <JobsPage />
                    <Footer />
                  </>
                }
              />

              <Route
                path="/jobs/:id"
                element={
                  <>
                    <Navbar />
                    <JobDetailsPage />
                    <Footer />
                  </>
                }
              />

              <Route
                path="/companies"
                element={
                  <>
                    <Navbar />
                    <CompaniesPage />
                    <Footer />
                  </>
                }
              />

              <Route
                path="/companies/:id"
                element={
                  <>
                    <Navbar />
                    <CompanyDetailsPage />
                    <Footer />
                  </>
                }
              />

              <Route
                path="/login"
                element={
                  <>
                    <Navbar />
                    <LoginPage />
                    <Footer />
                  </>
                }
              />

              <Route
                path="/register"
                element={
                  <>
                    <Navbar />
                    <RegisterPage />
                    <Footer />
                  </>
                }
              />

              {/* Protected Routes - Role based */}

              {/* Job Seeker Dashboard & Sub‑routes */}
              <Route
                path="/dashboard/seeker"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <>
                      <Navbar />
                      <JobSeekerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/applied-jobs"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <>
                      <Navbar />
                      <JobSeekerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <>
                      <Navbar />
                      <JobSeekerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/cover-letters"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <>
                      <Navbar />
                      <JobSeekerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/seeker/profile"
                element={
                  <ProtectedRoute allowedRoles={["job_seeker"]}>
                    <>
                      <Navbar />
                      <ProfilePage />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              {/* Employer Dashboard & Sub‑routes */}
              <Route
                path="/dashboard/employer/profile"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <>
                      <Navbar />
                      <ProfilePage />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer/post-job"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <>
                      <Navbar />
                      <EmployerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer/my-jobs"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <>
                      <Navbar />
                      <EmployerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer/candidates"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <>
                      <Navbar />
                      <EmployerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/employer"
                element={
                  <ProtectedRoute allowedRoles={["employer"]}>
                    <>
                      <Navbar />
                      <EmployerDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard & Sub‑routes */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <>
                      <Navbar />
                      <AdminDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <>
                      <Navbar />
                      <ProfilePage />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <>
                      <Navbar />
                      <AdminDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <>
                      <Navbar />
                      <AdminDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <>
                      <Navbar />
                      <AdminDashboard />
                      <Footer />
                    </>
                  </ProtectedRoute>
                }
              />

              {/* 404 PAGE */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <NotFoundPage />
                    <Footer />
                  </>
                }
              />
            </Routes>
          </main>
        </SavedSearchProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
