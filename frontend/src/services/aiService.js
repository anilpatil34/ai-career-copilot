/**
 * Chat, Roadmap & Interview API service.
 */
import api from './api';

const aiService = {
  chat: async (messages, context = '') => {
    const response = await api.post('/api/chat/', { messages, context });
    return response.data;
  },

  generateRoadmap: async (skills) => {
    const response = await api.post('/api/roadmap/generate/', { skills });
    return response.data;
  },

  getInterviewQuestions: async (role, skills = []) => {
    const response = await api.post('/api/interview/questions/', { role, skills });
    return response.data;
  },

  evaluateAnswer: async (question, answer, role = '') => {
    const response = await api.post('/api/interview/evaluate/', { question, answer, role });
    return response.data;
  },
};

export default aiService;
