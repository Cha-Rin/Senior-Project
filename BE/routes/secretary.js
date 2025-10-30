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
JOIN user_category uc ON a.category_id = uc.category_id
WHERE uc.user_id = ?
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
// -----------------------------------------Rating appointment ------------------------------------------
// =====================================
// 💼 Secretary Rating (เฉลี่ยรายเทอม)
// =====================================
router.get('/rating-Appointment', (req, res) => {
  const { year, semester } = req.query;
  console.log('📊 Received rating request:', { year, semester });
  // ตรวจสอบว่ามีค่าที่ส่งมาหรือไม่
  if (!year || !semester) {
    return res.status(400).json({ success: false, message: "Missing year or semester" });
  }

  // 🔹 Query feedback ของเลขา
  const sql = `
  SELECT 
    AVG(fa.score_count1) AS friendliness,
    AVG(fa.score_count2) AS efficiency,
    AVG(fa.score_count3) AS communication
  FROM feedback_appointment fa
  JOIN academic_period ap ON fa.period_id = ap.period_id
  WHERE ap.academic_year = ? AND ap.semester = ?;
`;

  db.query(sql, [year, semester], (err, results) => {
   if (err) {
  console.error('❌ SQL Error:', err);
  return res.status(500).json({ success: false, error: err.message });
}


    const r = results[0] || {};
    const data = {
      friendliness: parseFloat(r.friendliness || 0).toFixed(2),
      efficiency: parseFloat(r.efficiency || 0).toFixed(2),
      communication: parseFloat(r.communication || 0).toFixed(2),
    };

    const overall =
      ((Number(data.friendliness) + Number(data.efficiency) + Number(data.communication)) / 3).toFixed(1);

    res.json({ success: true, data: { ...data, average: overall } });
  });
});

// ------------------------------------------ Document -----------------------------------------------------
// ------------------------------------------ Get history Document -----------------------------------------


 return router;
}