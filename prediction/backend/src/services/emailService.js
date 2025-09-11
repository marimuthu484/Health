const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service error:', error);
        } else {
          console.log('Email service is ready');
        }
      });
    } catch (error) {
      console.error('Error creating email transporter:', error);
      this.transporter = null;
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return;
    }

    try {
      const mailOptions = {
        from: `HealthPredict <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // New appointment notification to doctor
  async sendNewAppointmentNotification(doctorEmail, details) {
    const subject = 'New Appointment Request - HealthPredict';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
          .button { background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Appointment Request</h1>
          </div>
          <div class="content">
            <p>Dear Dr. ${details.doctorName},</p>
            <p>You have received a new appointment request with the following details:</p>
            <ul>
              <li><strong>Patient Name:</strong> ${details.patientName}</li>
              <li><strong>Date:</strong> ${new Date(details.date).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${details.time}</li>
              <li><strong>Reason:</strong> ${details.reason}</li>
              <li><strong>Medical Report:</strong> ${details.hasReport ? 'Attached' : 'Not provided'}</li>
            </ul>
            <p>Please login to your dashboard to approve or reject this appointment.</p>
            <center>
              <a href="${process.env.CLIENT_URL}/doctor-dashboard" class="button">Go to Dashboard</a>
            </center>
          </div>
          <div class="footer">
            <p>© 2024 HealthPredict. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(doctorEmail, subject, html);
  }

  // Appointment confirmation to patient
  async sendAppointmentConfirmation(patientEmail, details) {
    const subject = 'Appointment Confirmed - HealthPredict';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
          .button { background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 20px; }
          .info-box { background-color: #e8f5e9; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${details.patientName},</p>
            <p>Great news! Your appointment has been confirmed by Dr. ${details.doctorName}.</p>
            <div class="info-box">
              <h3>Appointment Details:</h3>
              <ul>
                <li><strong>Date:</strong> ${new Date(details.date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${details.time}</li>
                <li><strong>Type:</strong> ${details.consultationType}</li>
                <li><strong>Doctor:</strong> Dr. ${details.doctorName}</li>
              </ul>
            </div>
            <p><strong>What's next?</strong></p>
            <ul>
              <li>You can now chat with your doctor through the appointment page</li>
              <li>The doctor will start the video consultation at the scheduled time</li>
              <li>You will receive an email with the meeting link when consultation starts</li>
            </ul>
            <center>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Appointment</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(patientEmail, subject, html);
  }

  // Appointment rejection to patient
  async sendAppointmentRejection(patientEmail, details) {
    const subject = 'Appointment Update - HealthPredict';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
          .button { background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Update</h1>
          </div>
          <div class="content">
            <p>Dear ${details.patientName},</p>
            <p>We regret to inform you that your appointment request has been declined.</p>
            <p><strong>Appointment Details:</strong></p>
            <ul>
              <li>Doctor: Dr. ${details.doctorName}</li>
              <li>Date: ${new Date(details.date).toLocaleDateString()}</li>
              <li>Time: ${details.time}</li>
            </ul>
            <p><strong>Reason:</strong> ${details.reason}</p>
            <p>You can book another appointment with available time slots.</p>
            <center>
              <a href="${process.env.CLIENT_URL}/consultation" class="button">Book New Appointment</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(patientEmail, subject, html);
  }

  // Consultation started notification with meeting link
  async sendConsultationStarted(patientEmail, details) {
    const subject = 'Your Video Consultation is Starting - Join Now!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
          .meeting-box { background-color: #fff; padding: 20px; margin: 20px 0; border: 2px solid #2196F3; text-align: center; }
          .join-button { background-color: #4CAF50; color: white; padding: 16px 32px; text-decoration: none; display: inline-block; font-size: 18px; margin-top: 20px; }
          .link-text { background-color: #f0f0f0; padding: 10px; margin: 10px 0; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Consultation is Ready!</h1>
          </div>
          <div class="content">
            <p>Dear ${details.patientName},</p>
            <p>Dr. ${details.doctorName} has started the video consultation and is waiting for you.</p>
            <div class="meeting-box">
              <h2>Join Video Call Now</h2>
              <a href="${details.meetingLink}" class="join-button">JOIN CONSULTATION</a>
              <p style="margin-top: 20px;">Or copy this link:</p>
              <div class="link-text">${details.meetingLink}</div>
            </div>
            <p><strong>Tips for your consultation:</strong></p>
            <ul>
              <li>Ensure you have a stable internet connection</li>
              <li>Use Chrome, Firefox, or Safari browser for best experience</li>
              <li>Allow camera and microphone permissions when prompted</li>
              <li>Find a quiet, well-lit space</li>
            </ul>
            <p>The meeting link has also been shared in your appointment chat.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(patientEmail, subject, html);
  }

  // Test email functionality
  async sendTestEmail(email) {
    const subject = 'Test Email - HealthPredict';
    const html = `
      <h1>Test Email</h1>
      <p>If you're reading this, your email configuration is working correctly!</p>
      <p>Sent at: ${new Date().toLocaleString()}</p>
    `;
    
    await this.sendEmail(email, subject, html);
  }
}

// Create singleton instance
const emailService = new EmailService();
module.exports = emailService;
