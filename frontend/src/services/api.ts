import axios from 'axios';

// Environment information
const ENV = process.env.REACT_APP_ENV || 'development';
console.log(`Running in ${ENV} environment`);

// Get API URL based on environment
const getApiUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL;
  if (configuredUrl) {
    console.log(`Using configured API URL: ${configuredUrl}`);
    return configuredUrl;
  }
  
// Default URLs based on environment if not explicitly configured
  switch (ENV) {
    case 'production':
      return 'https://your-production-domain.com/api';
    case 'test':
      return 'http://localhost:5002/api';
    case 'development':
    default:
      return 'http://localhost:5001/api';
  }
};

// Create axios instance with base URL
console.log('Creating axios instance with withCredentials: false');
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Explicitly set withCredentials to false to avoid CORS issues
  withCredentials: false,
});

// Double-check that withCredentials is false
console.log('Axios instance created with withCredentials:', api.defaults.withCredentials);

// Add environment header to help with debugging
api.defaults.headers.common['X-Environment'] = ENV;

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always false
    config.withCredentials = false;
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the final request configuration in development
    if (ENV === 'development') {
      console.log('Final request config:', {
        url: config.url,
        withCredentials: config.withCredentials,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development and test environments
    if (ENV !== 'production') {
      console.log('API Success:', {
        status: response.status,
        endpoint: response.config.url,
        method: response.config.method?.toUpperCase(),
      });
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Log API errors in development and test environments
    if (ENV !== 'production') {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
      });
    }
    
    return Promise.reject(error);
  }
);

// Add environment-specific configurations
const configureEnvironmentSpecifics = () => {
  switch (ENV) {
    case 'development':
      // Enable more verbose logging in development
      api.interceptors.request.use((request) => {
        console.log('API Request:', request.method?.toUpperCase(), request.url);
        return request;
      });
      break;
    case 'test':
      // Test-specific configurations
      break;
    case 'production':
      // Production-specific configurations
      break;
  }
};

// Apply environment-specific configurations
configureEnvironmentSpecifics();

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    console.log('Sending registration request with data:', userData);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Registration API response:', response.data);
      return response;
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },
  login: async (credentials: any) => {
    console.log('Sending login request with credentials:', { email: credentials.email });
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login API response:', response.data);
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData: any) => api.put('/users/profile', userData),
};

// Document API
export const documentAPI = {
  uploadDocument: (formData: FormData) => 
    api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getDocuments: () => api.get('/documents'),
  getDocument: (id: string) => api.get(`/documents/${id}`),
  updateDocument: (id: string, data: any) => api.put(`/documents/${id}`, data),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
  processDocument: (cvId: string) => api.post(`/documents/process`, { cvId }),
};

// Interview API
export const interviewAPI = {
  createSession: (data: any) => api.post('/interview/start', data),
  generateQuestions: (data: any) => api.post('/interview/questions/generate', data),
  getSessions: () => api.get('/interview/sessions'),
  getSession: (id: string) => api.get(`/interview/sessions/${id}`),
  saveResponse: (sessionId: string, data: FormData) => 
    api.post(`/interview/${sessionId}/response`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  endSession: (id: string) => api.put(`/interview/${id}/end`),
};

// Feedback API
export const feedbackAPI = {
  generateFeedback: (interviewId: string) => api.post(`/feedback/generate/${interviewId}`),
  getFeedbackByInterview: (interviewId: string) => api.get(`/feedback/session/${interviewId}`),
  getFeedback: (id: string) => api.get(`/feedback/${id}`),
  getAllFeedback: () => api.get('/feedback/user'),
};

export default api;
