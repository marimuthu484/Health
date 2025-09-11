import api from './api';

export const timeSlotService = {
  async addTimeSlots(date, slots) {
    const response = await api.post('/time-slots/add', { date, slots });
    return response.data;
  },

  async getDoctorTimeSlots(params) {
    const response = await api.get('/time-slots/doctor', { params });
    return response.data;
  },

  async updateTimeSlot(slotId, data) {
    const response = await api.put(`/time-slots/${slotId}`, data);
    return response.data;
  },

  async deleteTimeSlot(slotId) {
    const response = await api.delete(`/time-slots/${slotId}`);
    return response.data;
  },

  async getAvailableSlots(doctorId, date) {
    const response = await api.get('/time-slots/available', {
      params: { doctorId, date }
    });
    return response.data;
  }
};
