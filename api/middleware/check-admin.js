const jwt = require('jsonwebtoken');
const { MESSAGE } = require('../controllers/static.js');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.AuthData = decoded;
    if (decoded.admin) {
      return next();
    }
    const error = { message: 'User is not an admin' };
    throw error;
  } catch (error) {
    return res.status(401).json(MESSAGE[401]);
  }
};