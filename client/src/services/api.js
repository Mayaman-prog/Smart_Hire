import axios from 'axios';

// Mock data for testing
const MOCK_USERS = {
  'jobseeker@example.com': {
    id: 1,
    email: 'jobseeker@example.com',
    name: 'John Doe',
    role: 'job_seeker',
    password: 'password123',
  },
  'employer@example.com': {
    id: 2,
    email: 'employer@example.com',
    name: 'Jane Smith',
    role: 'employer',
    company_id: 1,
    password: 'password123',
  },
  'admin@example.com': {
    id: 3,
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    password: 'password123',
  },
};

// Simulate network delay
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementation
const mockAPI = {
  post: async (url, data) => {
    await delay();
    
    // Mock login endpoint
    if (url === '/auth/login') {
      const { email, password } = data;
      const user = MOCK_USERS[email];
      
      if (!user || user.password !== password) {
        throw {
          response: {
            status: 401,
            data: { message: 'Invalid email or password' }
          }
        };
      }
      
      // Return success response
      const { password: _, ...userWithoutPassword } = user;
      return {
        data: {
          success: true,
          data: {
            token: `mock_jwt_token_${Date.now()}`,
            user: userWithoutPassword
          }
        }
      };
    }
    
    // Mock get current user
    if (url === '/auth/me') {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw {
          response: { status: 401, data: { message: 'Not authenticated' } }
        };
      }
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw {
          response: { status: 401, data: { message: 'User not found' } }
        };
      }
      
      return {
        data: {
          success: true,
          data: { user: JSON.parse(userData) }
        }
      };
    }
    
    throw { response: { status: 404, data: { message: 'Endpoint not found' } } };
  },
  
  get: async (url) => {
    await delay();
    
    if (url === '/auth/me') {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw {
          response: { status: 401, data: { message: 'Not authenticated' } }
        };
      }
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw {
          response: { status: 401, data: { message: 'User not found' } }
        };
      }
      
      return {
        data: {
          success: true,
          data: { user: JSON.parse(userData) }
        }
      };
    }
    
    throw { response: { status: 404, data: { message: 'Endpoint not found' } } };
  },
  
  // Add interceptors mock
  interceptors: {
    request: { use: () => {}, eject: () => {} },
    response: { use: () => {}, eject: () => {} }
  }
};

// Create real axios instance for when backend is ready
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for real API
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for real API
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Determine which API to use based on environment variable
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
const api = USE_MOCK_API ? mockAPI : axiosInstance;

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Job API calls
export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
};

// Application API calls
export const applicationAPI = {
  applyForJob: (jobId, applicationData) => api.post('/applications', { jobId, ...applicationData }),
  getMyApplications: () => api.get('/applications/my'),
  getEmployerApplications: () => api.get('/applications/employer'),
  updateApplicationStatus: (applicationId, status) => api.put(`/applications/${applicationId}/status`, { status }),
};

// Company API calls
export const companyAPI = {
  getCompanies: () => api.get('/companies'),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
};

// Saved Jobs API calls
export const savedJobsAPI = {
  saveJob: (jobId) => api.post('/saved-jobs', { jobId }),
  getSavedJobs: () => api.get('/saved-jobs'),
  removeSavedJob: (jobId) => api.delete(`/saved-jobs/${jobId}`),
};

export default api;