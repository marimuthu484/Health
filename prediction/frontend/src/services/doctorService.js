import api from "./api";

export const doctorService = {
  async getProfile() {
    const response = await api.get('/doctor/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/doctor/profile', profileData);
    return response.data;
  },

  async getAppointments(params) {
    const response = await api.get('/doctor/appointments', { params });
    return response.data;
  },

  async getPatients() {
    const response = await api.get('/doctor/patients');
    return response.data;
  },

  async updateAppointmentStatus(appointmentId, status) {
    const response = await api.put(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  async getTimeSlots() {
    const response = await api.get('/doctor/time-slots');
    return response.data;
  },

  async updateTimeSlots(timeSlots) {
    const response = await api.put('/doctor/time-slots', { timeSlots });
    return response.data;
  },

  async getAvailableSlotsForDate(doctorId, date) {
    const response = await api.get('/doctor/available-slots', { 
      params: { doctorId, date } 
    });
    return response.data;
  }
};
