const pharmacyService = require('../services/pharmacyService');

exports.getMedicines = async (req, res, next) => {
  try {
    const result = await pharmacyService.getMedicines(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving medicines'
    });
  }
};

exports.addMedicine = async (req, res, next) => {
  try {
    const newMed = await pharmacyService.addMedicine(req.body);
    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory successfully',
      data: newMed
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error adding medicine'
    });
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const updated = await pharmacyService.updateMedicine(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Medicine inventory record updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error updating medicine'
    });
  }
};

exports.dispenseMedicines = async (req, res, next) => {
  try {
    const result = await pharmacyService.dispenseMedicines(req.body, req.user?.id);
    res.status(201).json({
      success: true,
      message: `Medicines dispensed and stock deducted successfully. Invoice #${result.invoiceNumber}`,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error dispensing medicines'
    });
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const data = await pharmacyService.getSales();
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving pharmacy sales'
    });
  }
};

