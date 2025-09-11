const { USER_ROLES } = require('../config/constants');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

const isAdmin = authorize(USER_ROLES.ADMIN);
const isDoctor = authorize(USER_ROLES.DOCTOR);
const isPatient = authorize(USER_ROLES.PATIENT);
const isDoctorOrAdmin = authorize(USER_ROLES.DOCTOR, USER_ROLES.ADMIN);
const isPatientOrDoctor = authorize(USER_ROLES.PATIENT, USER_ROLES.DOCTOR);

module.exports = {
  authorize,
  isAdmin,
  isDoctor,
  isPatient,
  isDoctorOrAdmin,
  isPatientOrDoctor
};
