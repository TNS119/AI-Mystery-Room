import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to adjust timeout dynamically (e.g. 60s for /cases creation)
api.interceptors.request.use((config) => {
  if (config.url === '/cases' && config.method === 'post') {
    config.timeout = 60000;
  }
  return config;
});

// Response interceptor to normalize error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.data?.error) {
      return Promise.reject(error.response.data.error);
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        code: 'TIMEOUT',
        message: 'Request timed out. The server took too long to respond.'
      });
    }
    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: "Can't reach the server. Please verify your connection."
      });
    }
    return Promise.reject({
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred.'
    });
  }
);

export const apiService = {
  checkHealth: () => api.get('/health'),
  createCase: (premise, difficulty) => api.post('/cases', { premise, difficulty }),
  getCase: (id) => api.get(`/cases/${id}`),
  discoverClue: (caseId, clueId) => api.post(`/cases/${caseId}/clues/${clueId}/discover`),
  requestHint: (caseId) => api.post(`/cases/${caseId}/hints`),
  submitAccusation: (caseId, suspectId) => api.post(`/cases/${caseId}/accuse`, { suspectId }),
  getResult: (caseId) => api.get(`/cases/${caseId}/result`)
};

export default api;
