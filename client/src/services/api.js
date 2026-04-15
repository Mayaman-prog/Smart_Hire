import axios from "axios";

// Mock data for testing
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
  "admin@example.com": {
    id: 3,
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    password: "password123",
  },
};

// Simulate network delay
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API implementation
const mockAPI = {
  post: async (url, data) => {
    await delay();

    // Mock login endpoint
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

    // Mock registration endpoint
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

    // Mock get current user
    if (url === "/auth/me") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw {
          response: { status: 401, data: { message: "Not authenticated" } },
        };
      }

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw {
          response: { status: 401, data: { message: "User not found" } },
        };
      }

      return {
        data: {
          success: true,
          data: { user: JSON.parse(userData) },
        },
      };
    }

    // Mock apply for job (add this)
    if (url === "/applications") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw { response: { status: 401 } };

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id;
      const appliedKey = `applied_${userId}`;
      const applied = JSON.parse(localStorage.getItem(appliedKey) || "[]");
      const { jobId } = data;

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

  get: async (url) => {
    await delay();

    if (url === "/auth/me") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw {
          response: { status: 401, data: { message: "Not authenticated" } },
        };
      }

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw {
          response: { status: 401, data: { message: "User not found" } },
        };
      }

      return {
        data: {
          success: true,
          data: { user: JSON.parse(userData) },
        },
      };
    }

    // Mock jobs list
    if (url === "/jobs" || url.startsWith("/jobs?")) {
      // Return mock jobs from localStorage or default
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
      return { data: { data: mockJobs, total: mockJobs.length } };
    }

    // Mock single job
    if (url.match(/\/jobs\/\d+/)) {
      const id = parseInt(url.split("/").pop());
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
      return { data: { data: mockJob } };
    }

    throw {
      response: { status: 404, data: { message: "Endpoint not found" } },
    };
  },

  interceptors: {
    request: { use: () => {}, eject: () => {} },
    response: { use: () => {}, eject: () => {} },
  },
};

// Create real axios instance for when backend is ready
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

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

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
const api = USE_MOCK_API ? mockAPI : axiosInstance;

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const jobAPI = {
  getJobs: (params) => api.get("/jobs", { params }),
  getFeaturedJobs: () => api.get("/jobs/featured"),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post("/jobs", jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

export const applicationAPI = {
  applyForJob: (jobId, applicationData) =>
    api.post("/applications", { jobId, ...applicationData }),
  getMyApplications: () => api.get("/applications/my"),
  getEmployerApplications: () => api.get("/applications/employer"),
  updateApplicationStatus: (applicationId, status) =>
    api.put(`/applications/${applicationId}/status`, { status }),
};

export const companyAPI = {
  getCompanies: () => api.get("/companies"),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
};

export const savedJobsAPI = {
  saveJob: (jobId) => api.post("/saved-jobs", { jobId }),
  getSavedJobs: () => api.get("/saved-jobs"),
  removeSavedJob: (jobId) => api.delete(`/saved-jobs/${jobId}`),
};

export default api;
