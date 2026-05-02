import axios from "axios";

// MOCK DATA (only used when VITE_USE_MOCK_API=true)
const MOCK_USERS = {
  "jobseeker@example.com": {
    id: 1,
    email: "jobseeker@example.com",
    name: "John Doe",
    role: "job_seeker",
    password: "password123",
  },
  "employer@example.com": {
    id: 2,
    email: "employer@example.com",
    name: "Jane Smith",
    role: "employer",
    company_id: 1,
    password: "password123",
  },
  "admin@smarthire.com": {
    id: 3,
    email: "admin@smarthire.com",
    name: "Admin User",
    role: "admin",
    password: "password123",
  },
};

// Utility function to simulate network delay for mock API
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAPI = {
  post: async (url, data) => {
    await delay();

    if (url === "/auth/login") {
      const { email, password } = data;
      const user = MOCK_USERS[email];

      if (!user || user.password !== password) {
        throw {
          response: {
            status: 401,
            data: { message: "Invalid email or password" },
          },
        };
      }

      const { password: _, ...userWithoutPassword } = user;

      return {
        data: {
          success: true,
          data: {
            token: `mock_jwt_token_${Date.now()}`,
            user: userWithoutPassword,
          },
        },
      };
    }

    if (url === "/auth/register") {
      const { email, password, name, role, companyName } = data;

      const existingUser = Object.values(MOCK_USERS).find(
        (u) => u.email === email,
      );

      if (existingUser) {
        throw {
          response: {
            status: 409,
            data: { message: "Email already exists" },
          },
        };
      }

      const newId = Object.keys(MOCK_USERS).length + 1;
      const newUser = {
        id: newId,
        email,
        name,
        role,
        password,
        ...(role === "employer" && {
          company_id: newId,
          company_name: companyName,
        }),
      };

      MOCK_USERS[email] = newUser;

      const { password: _, ...userWithoutPassword } = newUser;

      return {
        data: {
          success: true,
          data: {
            token: `mock_jwt_token_${Date.now()}`,
            user: userWithoutPassword,
          },
        },
      };
    }

    if (url === "/auth/me") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        throw {
          response: {
            status: 401,
            data: { message: "Not authenticated" },
          },
        };
      }

      const userData = localStorage.getItem("user");

      if (!userData) {
        throw {
          response: {
            status: 401,
            data: { message: "User not found" },
          },
        };
      }

      return {
        data: {
          success: true,
          data: { user: JSON.parse(userData) },
        },
      };
    }

    if (url === "/applications") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        throw { response: { status: 401 } };
      }

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id;
      const appliedKey = `applied_${userId}`;
      const applied = JSON.parse(localStorage.getItem(appliedKey) || "[]");
      const { jobId } = data;

      // Check if user has already applied to this job
      if (applied.includes(jobId)) {
        throw {
          response: {
            status: 409,
            data: { message: "You have already applied to this job" },
          },
        };
      }

      applied.push(jobId);
      localStorage.setItem(appliedKey, JSON.stringify(applied));

      return {
        data: {
          success: true,
          message: "Application submitted successfully",
        },
      };
    }

    throw {
      response: { status: 404, data: { message: "Endpoint not found" } },
    };
  },

  // Only implement GET for /auth/me, /jobs, /jobs/:id, and /jobs/me for mock API
  get: async (url) => {
    await delay();

    if (url === "/auth/me") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        throw {
          response: {
            status: 401,
            data: { message: "Not authenticated" },
          },
        };
      }

      const userData = localStorage.getItem("user");

      if (!userData) {
        throw {
          response: {
            status: 401,
            data: { message: "User not found" },
          },
        };
      }

      return {
        data: {
          success: true,
          data: { user: JSON.parse(userData) },
        },
      };
    }

    // Mock job listings for /jobs and /jobs? endpoints
    if (url === "/jobs" || url.startsWith("/jobs?")) {
      const mockJobs = [
        {
          id: 1,
          title: "Frontend Developer",
          company_name: "Tech Corp",
          location: "Remote",
          salary_min: 80000,
          salary_max: 120000,
          job_type: "full-time",
          is_featured: true,
          posted_date: "2025-04-01",
        },
        {
          id: 2,
          title: "Backend Engineer",
          company_name: "DataSys",
          location: "New York",
          salary_min: 100000,
          salary_max: 150000,
          job_type: "full-time",
          is_featured: true,
          posted_date: "2025-04-02",
        },
        {
          id: 3,
          title: "UX Designer",
          company_name: "Design Studio",
          location: "San Francisco",
          salary_min: 90000,
          salary_max: 130000,
          job_type: "remote",
          is_featured: false,
          posted_date: "2025-04-03",
        },
        {
          id: 4,
          title: "Product Manager",
          company_name: "Innovate Inc",
          location: "Austin",
          salary_min: 110000,
          salary_max: 160000,
          job_type: "full-time",
          is_featured: false,
          posted_date: "2025-04-04",
        },
        {
          id: 5,
          title: "DevOps Engineer",
          company_name: "CloudTech",
          location: "Remote",
          salary_min: 120000,
          salary_max: 170000,
          job_type: "contract",
          is_featured: false,
          posted_date: "2025-04-05",
        },
      ];

      return {
        data: {
          success: true,
          data: mockJobs,
          total: mockJobs.length,
        },
      };
    }

    if (url.match(/\/jobs\/\d+/)) {
      const id = parseInt(url.split("/").pop(), 10);
      const mockJob = {
        id,
        title: "Sample Job",
        company_name: "Sample Co",
        location: "Remote",
        salary_min: 80000,
        salary_max: 120000,
        job_type: "full-time",
        posted_date: "2025-04-01",
      };

      return {
        data: {
          success: true,
          data: mockJob,
        },
      };
    }

    if (url === "/jobs/me") {
      return {
        data: {
          success: true,
          data: [],
          total: 0,
        },
      };
    }

    throw {
      response: { status: 404, data: { message: "Endpoint not found" } },
    };
  },

  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

// REAL AXIOS INSTANCE
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Global request interceptor to add Authorization header and log requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`,
    );

    return config;
  },
  (error) => Promise.reject(error),
);

// Global response interceptor to handle 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// SWITCH BETWEEN REAL API AND MOCK API BASED ON ENV VARIABLE
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
const api = USE_MOCK_API ? mockAPI : axiosInstance;

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
  createJob: (jobData) => api.post("/jobs", jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getRecommendedJobs: () => api.get("/jobs/recommended"),
};

// Application APIs (used by Job Seekers and Employers)
export const applicationAPI = {
  applyForJob: (jobId, applicationData) =>
    api.post("/applications", { jobId, ...applicationData }),
  getMyApplications: () => api.get("/applications/my"),
  getEmployerApplications: () => api.get("/applications/employer"),
  updateApplicationStatus: (applicationId, status) =>
    api.put(`/applications/${applicationId}/status`, { status }),
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
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
};

// New API for Saved Jobs
export const savedJobsAPI = {
  saveJob: (jobId) => api.post("/saved-jobs", { jobId }),
  getSavedJobs: () => api.get("/saved-jobs"),
  removeSavedJob: (jobId) => api.delete(`/saved-jobs/${jobId}`),
};

// New API for Saved Searches
export const savedSearchAPI = {
  getSavedSearches: () => api.get("/saved-searches"),
  createSavedSearch: (data) => api.post("/saved-searches", data),
  updateSavedSearch: (id, data) => api.put(`/saved-searches/${id}`, data),
  deleteSavedSearch: (id) => api.delete(`/saved-searches/${id}`),
};

// New API for User Profile and Resume Upload
export const userAPI = {
  updateProfile: (data) => api.put("/users/profile", data),
  uploadResume: (formData) =>
    api.post("/users/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get("/admin/users"),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),

  getJobs: () => api.get("/admin/jobs"),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),

  getCompanies: () => api.get("/admin/companies"),
  getStatsOverview: () => api.get("/admin/analytics/overview"),

  // Chart endpoints for the Admin Dashboard
  getKPI: () => api.get("/admin/analytics/kpi"),
  getTimeline: (days = 30) => api.get(`/admin/analytics/timeline?days=${days}`),
  getPopular: (type = "job_types") => api.get(`/admin/analytics/popular?type=${type}`),
};

// New API for Notifications
export const notificationAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// New API for Cover Letters
export const coverLetterAPI = {
  getAll: () => api.get("/cover-letters"),
  create: (data) => api.post("/cover-letters", data),
  update: (id, data) => api.put(`/cover-letters/${id}`, data),
  delete: (id) => api.delete(`/cover-letters/${id}`),
  setDefault: (id) => api.put(`/cover-letters/${id}/default`),
};

export const getCoverLetters = () => api.get("/cover-letters");
export const createCoverLetter = (data) => api.post("/cover-letters", data);
export const updateCoverLetter = (id, data) => api.put(`/cover-letters/${id}`, data);
export const deleteCoverLetter = (id) => api.delete(`/cover-letters/${id}`);
export const setDefaultCoverLetter = (id) => api.put(`/cover-letters/${id}/default`);

export default api;
