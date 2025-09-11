import api from './api';

export const appointmentService = {
  async createAppointment(formData) {
    const response = await api.post('/appointments/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getAppointment(id) {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async getAppointments(params) {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  async updateAppointmentStatus(id, status, rejectionReason) {
    const response = await api.put(`/appointments/${id}/status`, { 
      status, 
      rejectionReason 
    });
    return response.data;
  },

  async startConsultation(appointmentId) {
    const response = await api.post('/appointments/start-consultation', { 
      appointmentId 
    });
    return response.data;
  },

  async downloadMedicalReport(appointmentId) {
    const response = await api.get(
      `/appointments/${appointmentId}/medical-report/download`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};
