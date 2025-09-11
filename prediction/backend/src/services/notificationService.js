const Notification = require('../models/Notification');
const emailService = require('./emailService');

class NotificationService {
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data
      });
      
      // Emit socket event if socket.io is implemented
      // io.to(userId).emit('new-notification', notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        isRead: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.find({ userId })
        .sort('-createdAt')
        .limit(limit);
      
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async sendDoctorApprovalNotification(doctorUserId) {
    await this.createNotification(
      doctorUserId,
      'approval',
      'Registration Approved',
      'Your doctor registration has been approved. You can now start accepting appointments.',
      { status: 'approved' }
    );
  }

  async sendAppointmentNotification(userId, appointmentData) {
    await this.createNotification(
      userId,
      'appointment',
      'New Appointment',
      `You have a new appointment scheduled for ${appointmentData.date} at ${appointmentData.time}`,
      appointmentData
    );
  }
}

module.exports = new NotificationService();
