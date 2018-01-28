const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.ENV.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(301).json({
      message: 'Auth failed'
    });
  }
}
