import axios from "axios";

// REAL AXIOS INSTANCE
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ?? sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global request interceptor to add Authorization header and log requests
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";

    console.error("API ERROR:", {
      url,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      const isAuthCheck = url.includes("/auth/me");

      // only clear auth on real auth failure
      if (!isAuthCheck) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

const api = axiosInstance;

// API EXPORTS
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Job APIs (used by both Job Seekers and Employers)
export const jobAPI = {
  getJobs: (params) => api.get("/jobs", { params }),
  getFeaturedJobs: () => api.get("/jobs/featured"),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getMyJobs: () => api.get("/jobs/me"),
  createJob: (data) => api.post("/jobs", data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getRecommendedJobs: () => api.get("/jobs/recommended"),
};

// Application APIs (used by Job Seekers and Employers)
export const applicationAPI = {
  applyForJob: (jobId, data) => api.post("/applications", { jobId, ...data }),

  getMyApplications: () => api.get("/applications/my"),

  getEmployerApplications: () => api.get("/applications/employer"),

  updateApplicationStatus: (id, status) =>
    api.put(`/applications/${id}/status`, { status }),

  withdrawApplication: (id) => api.delete(`/applications/${id}`),
};

// Employer APIs
export const employerAPI = {
  getDashboardSummary: () => api.get("/employer/dashboard-summary"),
};

// Company APIs (used by both Employers and Admins)
export const companyAPI = {
  getCompanies: () => api.get("/companies"),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  updateCompany: (id, data) => api.put(`/companies/${id}`, data),
};

// API for Saved Jobs
export const savedJobsAPI = {
  saveJob: (jobId) => api.post("/saved-jobs", { jobId }),
  getSavedJobs: () => api.get("/saved-jobs"),
  removeSavedJob: (jobId) => api.delete(`/saved-jobs/${jobId}`),
};

// API for Saved Searches
export const savedSearchAPI = {
  getSavedSearches: () => api.get("/saved-searches"),
  createSavedSearch: (data) => api.post("/saved-searches", data),
  updateSavedSearch: (id, data) => api.put(`/saved-searches/${id}`, data),
  deleteSavedSearch: (id) => api.delete(`/saved-searches/${id}`),
};

// API for User Profile and Resume Upload
export const userAPI = {
  get: (url) => api.get(url),

  updateProfile: (data) => api.put("/users/profile", data),

  uploadResume: (formData) =>
    api.post("/users/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getPrimaryResume: () => api.get("/users/resume/primary"),

  // Unlink Social Account
  unlinkSocial: (provider) => api.delete(`/users/me/social/${provider}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get("/admin/users"),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),

  getJobs: () => api.get("/admin/jobs"),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),

  getCompanies: () => api.get("/admin/companies"),

  getStatsOverview: () => api.get("/admin/analytics/overview"),

  getKPI: () => api.get("/admin/analytics/kpi"),

  getTimeline: (days = 30) => api.get(`/admin/analytics/timeline?days=${days}`),

  getPopular: (type = "job_types") =>
    api.get(`/admin/analytics/popular?type=${type}`),

  getReports: (params) => api.get("/admin/reports", { params }),

  getReportStats: () => api.get("/admin/reports/stats"),

  updateReportStatus: (id, data) =>
    api.put(`/admin/reports/${id}/status`, data),
};

// API for Notifications
export const notificationAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export const getCoverLetters = () => api.get("/cover-letters");
export const createCoverLetter = (data) => api.post("/cover-letters", data);
export const updateCoverLetter = (id, data) =>
  api.put(`/cover-letters/${id}`, data);
export const deleteCoverLetter = (id) => api.delete(`/cover-letters/${id}`);
export const setDefaultCoverLetter = (id) =>
  api.put(`/cover-letters/${id}/default`);

// API for Salary
export const salaryAPI = {
  // Get salary estimate for a job title and location
  getEstimate: (title, location) =>
    api.get("/salary/estimate", { params: { title, location } }),

  // Get salary trend over time
  getTrend: (title, location, months = 6) =>
    api.get("/salary/trend", { params: { title, location, months } }),
};

export default api;
