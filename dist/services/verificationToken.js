const crypto = require('crypto');
function generateVerificationToken(length = 40) {
  return crypto.randomBytes(length).toString('hex');
}
module.exports = generateVerificationToken;