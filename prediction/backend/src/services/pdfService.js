const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  async generatePrescriptionPDF(prescription) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const filename = `prescription-${prescription._id}.pdf`;
        const filepath = path.join(__dirname, '../../uploads/prescriptions/', filename);
        
        doc.pipe(fs.createWriteStream(filepath));
        
        // Header
        doc.fontSize(20).text('HealthPredict', 50, 50);
        doc.fontSize(16).text('Digital Prescription', 50, 80);
        
        // Prescription details
        doc.fontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 120);
        doc.text(`Prescription ID: ${prescription._id}`, 50, 140);
        
        // Patient info
        doc.text('Patient Information:', 50, 180);
        doc.text(`Name: ${prescription.patientId.userId.name}`, 70, 200);
        
        // Diagnosis
        doc.text('Diagnosis:', 50, 240);
        doc.text(prescription.diagnosis, 70, 260);
        
        // Medications
        doc.text('Medications:', 50, 300);
        let yPosition = 320;
        
        prescription.medications.forEach((med, index) => {
          doc.text(`${index + 1}. ${med.name}`, 70, yPosition);
          doc.text(`   Dosage: ${med.dosage}`, 70, yPosition + 20);
          doc.text(`   Frequency: ${med.frequency}`, 70, yPosition + 40);
          doc.text(`   Duration: ${med.duration}`, 70, yPosition + 60);
          if (med.instructions) {
            doc.text(`   Instructions: ${med.instructions}`, 70, yPosition + 80);
            yPosition += 100;
          } else {
            yPosition += 80;
          }
        });
        
        // Additional notes
        if (prescription.additionalNotes) {
          doc.text('Additional Notes:', 50, yPosition + 20);
          doc.text(prescription.additionalNotes, 70, yPosition + 40);
        }
        
        // Doctor signature
        doc.text('Doctor Signature:', 50, 650);
        doc.text(`Dr. ${prescription.doctorId.userId.name}`, 50, 670);
        doc.text(`License No: ${prescription.doctorId.licenseNumber}`, 50, 690);
        
        doc.end();
        
        resolve(`/uploads/prescriptions/${filename}`);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFService();
