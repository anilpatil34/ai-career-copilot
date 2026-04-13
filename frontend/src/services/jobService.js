/**
 * Job matching API service.
 */
import api from './api';

const jobService = {
  match: async (resumeId, title, company, description) => {
    const response = await api.post('/api/job/match/', {
      resume_id: resumeId,
      title,
      company,
      description,
    });
    return response.data;
  },

  history: async () => {
    const response = await api.get('/api/job/history/');
    return response.data;
  },
};

export default jobService;
