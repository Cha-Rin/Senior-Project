const express = require('express')
const authMiddleware = require('../middleware/auth') ;
const SECRET_KEY = 'mysecretkey'
module.exports = (db) => {
  const router = express.Router()

  router.use(express.json())
  router.use(express.urlencoded({ extended: true }))

  router.use((req, res, next) => {
    if (req.method === 'POST') {
      console.log('🔎 POST', req.originalUrl)
      console.log('🔎 content-type:', req.headers['content-type'])
      console.log('🔎 body:', req.body)
    }
    next()
  })
  // ------------------------------------------ Get history appointment -----------------------------------------
  router.get('/historyAppointment', authMiddleware, (req, res) => {
  const userId = req.user.id || req.user.user_id; 
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID not found in token' });
  }

  const sql = `
SELECT 
  a.appointment_id,
  a.user_id AS studentId,
  a.appointment_date, 
  a.category_id, 
  c.type AS topic,
  a.status,
  a.student_note
FROM appointment AS a
JOIN categories AS c ON a.category_id = c.category_id
WHERE a.category_id = 4
  AND a.status IN (1, 2)
ORDER BY a.appointment_date DESC
`;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('🔥 SQL error (history):', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    console.log('🔍 Query result count for user', userId, ':', results.length);
if (results.length === 0) {
  console.warn('⚠️ No history found for user:', userId);
  return res.status(200).json({ success: true, historyItems: [] });
}
console.log('✅ Found history items:', results.length);

    console.log('✅ Results from JOIN (history):', results);
    res.json({ success: true, historyItems: results });
  });
});
// ------------------------------------------ Document -----------------------------------------------------
// ------------------------------------------ Get history Document -----------------------------------------


 return router;
}