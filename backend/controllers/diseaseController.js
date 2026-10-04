const path = require('path');
const fs = require('fs');
const diseaseService = require('../services/diseaseService');

const SAMPLE_IMAGE_DIR = path.resolve(__dirname, '../../test_images');
const SAMPLE_MAP = {
  tomato_early_blight: 'tomato_early_blight.png',
  potato_late_blight: 'potato_late_blight.png',
  corn_common_rust: 'corn_common_rust.png',
  grape_black_rot: 'grape_black_rot.png',
};

exports.diagnoseDisease = async (req, res) => {
  try {
    const { cropType = 'Tomato', symptomsText = '', filename = '', sampleId = '' } = req.body || {};
    let file = req.file;

    // Support sample selection without a fresh binary upload
    if (!file) {
      const sampleKey = sampleId || filename.replace(/\.(png|jpe?g|webp)$/i, '');
      const sampleFilename = SAMPLE_MAP[sampleKey] || SAMPLE_MAP[filename] || (filename && fs.existsSync(path.join(SAMPLE_IMAGE_DIR, filename)) ? filename : null);
      if (sampleFilename) {
        const samplePath = path.join(SAMPLE_IMAGE_DIR, sampleFilename);
        if (fs.existsSync(samplePath)) {
          file = {
            originalname: sampleFilename,
            mimetype: 'image/png',
            buffer: fs.readFileSync(samplePath),
            size: fs.statSync(samplePath).size,
          };
        }
      }
    }

    if (!file || !file.buffer || file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'A crop image and valid crop details are required. Please upload a photo or select a sample image.'
      });
    }

    const result = await diseaseService.analyzeCropImageDetailed({
      filename: file.originalname || 'leaf.jpg',
      cropType: typeof cropType === 'string' ? cropType.slice(0, 100) : 'Tomato',
      symptomsText: typeof symptomsText === 'string' ? symptomsText.slice(0, 4000) : '',
      fileBuffer: file.buffer,
    });

    const { statusCode, ...payload } = result;
    return res.status(statusCode || 200).json(payload);
  } catch (error) {
    console.error('[DiseaseController] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during disease diagnosis. Please try again.'
    });
  }
};

