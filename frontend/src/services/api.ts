import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
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
