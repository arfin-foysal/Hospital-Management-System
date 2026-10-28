const labService = require('../services/labService');

exports.getCatalog = async (req, res, next) => {
  try {
    const data = await labService.getCatalog();
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving lab catalog'
    });
  }
};

exports.addCatalogItem = async (req, res, next) => {
  try {
    const item = await labService.addCatalogItem(req.body);
    res.status(201).json({ success: true, message: 'Test added to catalog', id: item.id });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error adding catalog item'
    });
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const result = await labService.getRequests(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving lab requests'
    });
  }
};

exports.createRequest = async (req, res, next) => {
  try {
    const result = await labService.createRequest(req.body);
    res.status(201).json({
      success: true,
      message: `Lab requisition ordered successfully (${result.requisitionNumber})`,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error creating lab request'
    });
  }
};

exports.updateResult = async (req, res, next) => {
  try {
    const updated = await labService.updateResult(req.params.id, req.body, req.file, req.user?.id);
    res.json({
      success: true,
      message: 'Lab result published successfully',
      data: updated
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error updating lab result'
    });
  }
};

