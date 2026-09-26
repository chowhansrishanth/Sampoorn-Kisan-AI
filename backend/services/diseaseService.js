const httpClient = require('./httpClient');
const FormData = require('form-data');
class DiseaseService {
  async analyzeCropImage(input, cropType = 'Crop Leaf') {
    return this.analyzeCropImageDetailed(typeof input === 'object' ? input : { filename: input, cropType });
  }
  getDiagnosticAdvice() {
    return { disease: null, remedy: null, organic: null, text: 'Inspect the affected crop and upload a clear leaf image for diagnosis. Symptoms alone do not establish a diagnosis. Consult your local KVK before choosing a chemical treatment.' };
  }
  validateImageQuality(filename, fileBuffer) {
    const b = fileBuffer;
    const valid = Buffer.isBuffer(b) && b.length >= 12 && (
      b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ||
      (b[0] === 255 && b[1] === 216 && b[2] === 255) ||
      (b.toString('ascii',0,4) === 'RIFF' && b.toString('ascii',8,12) === 'WEBP') ||
      b.toString('ascii',0,2) === 'BM');
    return { isQualityValid: Boolean(valid), errorReason: valid ? null : 'Upload a valid JPEG, PNG, WebP or BMP image.' };
  }
  async analyzeCropImageDetailed({ filename = 'leaf.jpg', cropType = 'Tomato', fileBuffer }) {
    const quality = this.validateImageQuality(filename, fileBuffer);
    if (!quality.isQualityValid) return { success: false, statusCode: 400, error: quality.errorReason };
    const form = new FormData();
    form.append('file', fileBuffer, { filename });
    form.append('cropType', cropType);
    try {
      const response = await httpClient.post(`${process.env.PYTHON_ML_SERVICE || 'http://localhost:8000'}/diagnose/disease`, form, { headers: form.getHeaders(), timeout: 10000 });
      const data = response.data;
      if (!data || data.is_real_pytorch_inference !== true || typeof data.disease_name !== 'string' || !Number.isFinite(data.confidence_score) || data.confidence_score < 0 || data.confidence_score > 1) return { success: false, statusCode: 502, error: 'The vision service returned an invalid result. Please retry later.' };
      return { ...data, success: true, isQualityValid: true, confidence: data.confidence_score, remedies: { chemical: data.chemical_remedy || null, organic: data.organic_remedy || null }, data_trust: { source: 'Configured crop disease vision model', retrieved_at: new Date().toISOString(), confidence_rating: `${Math.round(data.confidence_score * 100)}%` } };
    } catch (error) {
      const invalid = [400, 413, 415, 422].includes(error.response?.status);
      return { success: false, statusCode: invalid ? 400 : 503, error: invalid ? 'The image could not be decoded. Please upload another image.' : 'Disease diagnosis is unavailable. No diagnosis was generated. Please retry later.' };
    }
  }
}
module.exports = new DiseaseService();
