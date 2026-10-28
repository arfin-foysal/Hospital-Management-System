const authService = require('../services/authService');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error fetching profile'
    });
  }
};

