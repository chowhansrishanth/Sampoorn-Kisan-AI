function state(value, validator = value => Boolean(value)) { return validator(value) ? 'CONFIGURED' : 'MISSING'; }
function getConfigurationStatus() {
  return {
    database: state(process.env.MONGO_URI || process.env.MONGODB_URI),
    authentication: state(process.env.JWT_SECRET, value => process.env.NODE_ENV !== 'production' || (value && value.length >= 32)),
    frontendOrigins: state(process.env.FRONTEND_ORIGINS),
    firebaseAdmin: state(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_USE_ADC === 'true'),
    smtp: state(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    weather: 'UNVERIFIED',
    market: 'UNVERIFIED',
    cropModel: state(process.env.CROP_MODEL_PATH),
    diseaseModel: state(process.env.VISION_MODEL_PATH)
  };
}
module.exports = { getConfigurationStatus };
