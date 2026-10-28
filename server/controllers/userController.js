const userService = require('../services/userService');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.query.role);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving users'
    });
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const result = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: `User '${req.body.name}' with role '${req.body.role}' created successfully`,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error creating user'
    });
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const result = await userService.toggleStatus(req.params.id);
    res.json({
      success: true,
      message: `User status changed to ${result.status}`,
      status: result.status
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error updating user status'
    });
  }
};

