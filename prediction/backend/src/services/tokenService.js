const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenService {
  generateToken(payload, expiresIn = process.env.JWT_EXPIRE) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  generateRefreshToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateResetToken() {
    return crypto.randomBytes(20).toString('hex');
  }

  hashToken(token) {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }
}

module.exports = new TokenService();
