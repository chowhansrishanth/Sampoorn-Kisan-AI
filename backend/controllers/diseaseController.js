/**
 * ============================================================================
 * DISEASE DIAGNOSIS CONTROLLER — COMPUTER VISION INFERENCE PIPELINE
 * ============================================================================
 * Manages agricultural crop pathology requests by:
 *   1. Receiving multipart/form-data leaf image uploads via multer or
 *      resolving pre-bundled reference sample images for testing.
 *   2. Forwarding raw binary image buffers to diseaseService.
 *   3. Forwarding image payloads to the Python FastAPI MobileNetV2 Vision
 *      Service (/diagnose/disease) to generate Softmax class probabilities
 *      and Grad-CAM visual attention heatmaps.
 *   4. Returning comprehensive treatment protocols, organic remedies, and
 *      chemical fungicides with strict dosage safety guidelines.
 * ============================================================================
 */
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

/**
 * HTTP POST /api/disease/diagnose
 * Diagnoses crop foliage diseases from binary image uploads or test samples.
 */
exports.diagnoseDisease = async (req, res) => {
  try {
    const { cropType = 'Tomato', symptomsText = '', filename = '', sampleId = '' } = req.body || {};
    let file = req.file;

    // Support sample selection without a fresh binary upload only when sampleId is explicitly provided
    if (!file && sampleId) {
      const sampleFilename = SAMPLE_MAP[sampleId];
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

