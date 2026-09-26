const diseaseService = require('../services/diseaseService');
exports.diagnoseDisease = async (req, res) => {
  const { cropType = 'Tomato', symptomsText = '' } = req.body || {};
  if (!req.file || typeof cropType !== 'string' || cropType.length > 100 || typeof symptomsText !== 'string' || symptomsText.length > 4000) return res.status(400).json({ success: false, error: 'A crop image and valid crop details are required.' });
  const result = await diseaseService.analyzeCropImageDetailed({ filename: req.file.originalname, cropType, symptomsText, fileBuffer: req.file.buffer });
  const { statusCode, ...payload } = result;
  return res.status(statusCode || 200).json(payload);
};
