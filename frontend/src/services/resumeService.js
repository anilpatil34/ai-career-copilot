/**
 * Resume API service.
 */
import api from './api';

const resumeService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/resume/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  list: async () => {
    const response = await api.get('/api/resume/list/');
    return response.data;
  },

  analyze: async (resumeId) => {
    const response = await api.post(`/api/resume/analyze/${resumeId}/`);
    return response.data;
  },

  getAnalysis: async (analysisId) => {
    const response = await api.get(`/api/resume/analysis/${analysisId}/`);
    return response.data;
  },

  delete: async (resumeId) => {
    const response = await api.delete(`/api/resume/delete/${resumeId}/`);
    return response.data;
  },
};

export default resumeService;
