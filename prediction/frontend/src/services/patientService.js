import api from "./api";

export const patientService = {
  async getProfile() {
    const response = await api.get('/patient/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/patient/profile', profileData);
    return response.data;
  },

  async getDoctors(params) {
    const response = await api.get('/patient/doctors', { params });
    return response.data;
  },

  async getAppointments(params) {
    const response = await api.get('/patient/appointments', { params });
    return response.data;
  }
};
