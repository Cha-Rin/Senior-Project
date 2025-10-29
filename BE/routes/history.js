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
    // ------------------------------------------ History appointment -----------------------------------------
router.get('/historyall', authMiddleware, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  const role = req.user.role;
  const staffId = req.query.staffId; // 👈 เพิ่ม parameter ให้ admin ใช้ดูของ staff คนอื่น

  console.log(`📥 User ${userId} with role ${role} requested history`);

  if (!userId || !role) {
    return res.status(400).json({ success: false, message: 'User ID or role not found in token' });
  }

  let sql;
  let params;

  // 🧑‍🎓 Student → ดูประวัติของตัวเอง
  if (role === 'student' || role === 3) {
    sql = `
      SELECT 
        a.appointment_id,
        a.appointment_date,
        a.category_id,
        c.type AS topic,
        a.status,
        a.student_note
      FROM appointment AS a
      JOIN categories AS c ON a.category_id = c.category_id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC
    `;
    params = [userId];
  }

  // 🧑‍💼 Secretary → ดูรายการของหมวดตัวเอง
  else if (role === 'secretary' || role === 2) {
    sql = `
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
    params = [userId];
  }

  // 🧑‍⚖️ Admin → ดูประวัติของ staff ทั้งหมด หรือของคนที่ระบุ staffId
  else if (role === 'admin' || role === 1) {
    sql = `
      SELECT 
        a.appointment_id,
        a.user_id AS studentId,
        s.name AS staffName,
        c.type AS topic,
        a.status,
        a.appointment_date
      FROM appointment AS a
      JOIN user_category uc ON a.category_id = uc.category_id
      JOIN user AS s ON uc.user_id = s.user_id
      JOIN categories AS c ON a.category_id = c.category_id
      ${staffId ? 'WHERE s.user_id = ?' : ''}
      ORDER BY a.appointment_date DESC
    `;
    params = staffId ? [staffId] : [];
  }

  else {
    return res.status(403).json({ success: false, message: 'Unauthorized role' });
  }

  // 🔍 Query Database
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('🔥 SQL error (history):', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    console.log(`✅ Found ${results.length} history items for ${role} ${userId}`);
    res.json({ success: true, historyItems: results });
  });
});

  return router
}