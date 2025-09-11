const upload = require('../config/multer');

// Single file uploads
exports.uploadAvatar = upload.single('avatar');
exports.uploadDocument = upload.single('document');
exports.uploadPrescription = upload.single('prescription');
exports.uploadReport = upload.single('report');

// Multiple file uploads
exports.uploadDocuments = upload.array('documents', 5);
