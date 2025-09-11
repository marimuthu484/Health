import api from './api';

export const chatService = {
  async getChat(appointmentId) {
    const response = await api.get(`/chats/${appointmentId}`);
    return response.data;
  },

  async sendMessage(appointmentId, formData) {
    const response = await api.post(`/chats/${appointmentId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async markAsRead(appointmentId) {
    const response = await api.put(`/chats/${appointmentId}/read`);
    return response.data;
  },

  async downloadAttachment(appointmentId, messageId, attachmentIndex) {
    const response = await api.get(
      `/chats/${appointmentId}/messages/${messageId}/attachments/${attachmentIndex}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};
