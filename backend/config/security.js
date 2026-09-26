const crypto = require('node:crypto');
const production = process.env.NODE_ENV === 'production';
const configuredSecret = process.env.JWT_SECRET;
if (production && (!configuredSecret || Buffer.byteLength(configuredSecret) < 32 || /super_secret|your_jwt_secret|change.?me/i.test(configuredSecret))) {
  throw new Error('Production requires a unique JWT_SECRET of at least 32 bytes.');
}
if (production && !process.env.FRONTEND_ORIGINS) throw new Error('Production requires an explicit FRONTEND_ORIGINS allowlist.');
module.exports = { JWT_SECRET: configuredSecret || crypto.randomBytes(48).toString('hex') };
