const express = require('express')
const authMiddleware = require('../middleware/auth') ;
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

// ----------------------------------------------------------------------------------------------------
// API Endpoint สำหรับดึงนัดหมายที่ถึงเวลาแล้วและยังไม่อนุมัติ
router.get('/pending-now', (req, res) => {
  const secretaryId = req.query.user_id;
  const now = new Date(); // เวลาปัจจุบัน
  if (!secretaryId) {
    return res.status(400).json({ error: 'secretary_id is required' });
  }

  const sql = `
    SELECT
  a.id, -- หรือ a.appointment_id ตามที่คุณใช้
  a.appointment_time, -- หรือ a.appointment_date
  a.status,
  CONCAT(u.first_name, ' ', u.last_name) AS fullname
FROM
  appointment AS a
JOIN
  user_category AS uc ON a.category_id = uc.category_id
JOIN
  user AS u ON a.user_id = u.id 
WHERE
  a.status = 0
  AND a.appointment_time <= ?
  AND uc.user_id = ? 
  `;

  db.query(sql, [now, secretaryId], (err, results) => {
    if (err) {
      console.error('SQL Error (pending-now):', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    res.json(results);
  });
});
// ----------------------------------------------------------------------------------------------------
// API Endpoint สำหรับอนุมัตินัดหมาย
router.post('/:id/approve', (req, res) => {
  const idToApprove = req.params.id; // ID ที่มาจาก URL

  const sql = `
    UPDATE appointment 
    SET status = 1 
    WHERE appointment_id  = ?
  `;

  db.query(sql, [idToApprove], (err, result) => {
    if (err) {
      console.error('SQL Error (approve):', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    // ตรวจสอบว่ามีแถวที่ถูกอัปเดตจริงหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment approved successfully' });
  });
});
// ----------------------------------------------------------------------------------------------------
// API Endpoint สำหรับปฏิเสธนัดหมาย
router.post('/:id/reject', (req, res) => {
  const idToReject = req.params.id;

  const sql = `
    UPDATE appointment 
    SET status = 2 
    WHERE appointment_id = ?
  `;

  db.query(sql, [idToReject], (err, result) => {
    if (err) {
      console.error('SQL Error (reject):', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment rejected successfully' });
  });
});

  return router;
}