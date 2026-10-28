const notificationService = require('../services/notificationService');

exports.getLogs = async (req, res, next) => {
  try {
    const data = await notificationService.getLogs(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.sendNotification = async (req, res, next) => {
  try {
    const data = await notificationService.sendNotification(req.body);
    res.status(201).json({ success: true, message: 'Notification queued & delivered', data });
  } catch (err) {
    next(err);
  }
};

