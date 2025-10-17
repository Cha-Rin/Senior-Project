const jwt = require('jsonwebtoken')
const SECRET_KEY = "mysecretkey"

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1] // Bearer <token>
  if (!token) {
    return res.status(401).json({ success: false, message: 'Invalid token format' })
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    console.log('🧩 Decoded JWT:', decoded);
    req.user = {
  id: decoded.user_id || decoded.id,
  email: decoded.email,
  role: decoded.role
}; // ✅ เก็บข้อมูล user จาก token
    next()
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' })
  }
}

module.exports = authMiddleware
