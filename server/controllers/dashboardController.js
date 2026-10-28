const dashboardService = require('../services/dashboardService');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardSummary();
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving dashboard summary'
    });
  }
};

