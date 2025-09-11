import api from './api';

export const consultationService = {
  async startConsultation(appointmentId) {
    const response = await api.post('/consultations/start', { appointmentId });
    return response.data;
  },

  async getActiveConsultation() {
    const response = await api.get('/consultations/active');
    return response.data;
  },

  async endConsultation(consultationId, data) {
    const response = await api.put(`/consultations/${consultationId}/end`, data);
    return response.data;
  },

  async getConsultation(consultationId) {
    const response = await api.get(`/consultations/${consultationId}`);
    return response.data;
  }
};
