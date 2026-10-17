'use strict';

const schemeService = require('../services/schemeService');

/**
 * Controller for Government Agricultural Schemes & Subsidies
 */
class SchemeController {
  /**
   * GET /api/schemes
   * Query params: state, category, crop, irrigation, search
   */
  async getSchemes(req, res) {
    try {
      const { state, category, crop, irrigation, search } = req.query;
      const data = schemeService.getSchemes({
        state: state || 'Telangana',
        category: category || 'all',
        crop: crop || '',
        irrigation: irrigation || 'all',
        search: search || ''
      });
      return res.status(200).json(data);
    } catch (err) {
      console.error('SchemeController getSchemes error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve government schemes',
        message: err.message
      });
    }
  }

  /**
   * GET /api/schemes/:id
   */
  async getSchemeById(req, res) {
    try {
      const { id } = req.params;
      const scheme = schemeService.getSchemeById(id);
      if (!scheme) {
        return res.status(404).json({
          success: false,
          error: 'Scheme not found',
          id
        });
      }
      return res.status(200).json({
        success: true,
        scheme,
        lastVerifiedDate: '15 Sep 2026',
        dataSource: 'Ministry of Agriculture & Farmers Welfare, Govt of India'
      });
    } catch (err) {
      console.error('SchemeController getSchemeById error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve scheme details',
        message: err.message
      });
    }
  }
}

module.exports = new SchemeController();
