import api from './api';        
//import api from "/src/services/api.js";   
export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  async getDoctors(params) {
    const response = await api.get('/admin/doctors', { params });
    return response.data;
  },

  async approveDoctor(doctorId) {
    const response = await api.post(`/admin/doctors/${doctorId}/approve`);
    return response.data;
  },

  async rejectDoctor(doctorId, reason) {
    const response = await api.post(`/admin/doctors/${doctorId}/reject`, { reason });
    return response.data;
  }
};
