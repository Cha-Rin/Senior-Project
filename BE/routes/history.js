const express = require('express')
const authMiddleware = require('../middleware/auth')
const util = require('util')

module.exports = (db) => {
  const router = express.Router()
  const query = util.promisify(db.query).bind(db)
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

  // ------------------------------------------
  // 🔁 Auto-Reject expired pending appointments
  // ------------------------------------------
  const autoRejectExpiredAppointments = async () => {
    const now = new Date()
    const sql = `
      UPDATE appointment 
      SET status = 2 
      WHERE status = 0 AND appointment_date <= ?
    `
    return new Promise((resolve, reject) => {
      db.query(sql, [now], (err, result) => {
        if (err) {
          console.error('❌ Auto-reject failed:', err)
          reject(err)
        } else {
          console.log(`✅ Auto-rejected ${result.affectedRows} expired appointments`)
          resolve(result)
        }
      })
    })
  }

  // ------------------------------------------
  // 📜 GET /historyall – รวมประวัติทั้ง appointment + document
  // ------------------------------------------
  router.get('/historyall', authMiddleware, async (req, res) => {
  const userId = req.user.id || req.user.user_id
  const role = req.user.role
  const staffId = req.query.staffId
  const userEmail = req.user.email
  console.log("Decoded token:", req.user);
  console.log(`📥 User ${userId} with role ${role} requested history (combined)`)
  if (!role) {
    return res.status(400).json({ success: false, message: 'Role not found in token' })
  }

  const runQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    })
  }

  try {
    // ✅ 1. อัปเดต DB: เปลี่ยนนัดหมายที่เลยเวลาแล้ว → Reject
    await autoRejectExpiredAppointments()

    let appointmentSql, appointmentParams
    let documentSql, documentParams

    // 🧑‍🎓 Student (ไม่มี user_id ใช้ email แทน)
    if (role === 'student' || role === 3) {
      // ✅ ดึงข้อมูล staff จาก a.user_id (ซึ่งคือ staff_id ที่บันทึกไว้)
      appointmentSql = `
        SELECT 
          'appointment' AS type,
          a.appointment_id AS id,
          CONCAT(s.name, ' ', s.surname) AS full_name,
          DATE_FORMAT(a.appointment_date, '%Y-%m-%dT%H:%i:%s') AS event_date,
          c.type AS title,
          a.status,
          a.student_note,
          a.user_id AS staffId
        FROM appointment AS a
        JOIN user s ON a.user_id = s.user_id
        JOIN categories AS c ON a.category_id = c.category_id
        WHERE a.student_email = ?
      `
      appointmentParams = [userEmail]

      // ✅ Document tracking สำหรับนักศึกษา
      documentSql = `
        SELECT 
          'document' AS type,
          d.document_id AS id,
          CONCAT(s.name, ' ', s.surname) AS full_name,
          DATE_FORMAT(d.submit_date, '%Y-%m-%dT%H:%i:%s') AS event_date,
          c.type AS title,
          d.status,
          d.student_note AS student_note,
          d.staff_note AS staff_note,
          d.document_code AS document_code,
          d.image_path AS image_path,
          d.image_complete AS image_complete,
          d.user_id AS staffId
        FROM document_tracking AS d
        JOIN user s ON d.user_id = s.user_id
        JOIN categories AS c ON d.category_id = c.category_id
        WHERE d.student_email = ?
      `
      documentParams = [userEmail]
    }

    // 🧑‍💼 Secretary
    else if (role === 'secretary' || role === 2) {
      // ✅ Secretary ดูเฉพาะนัดหมายที่มา user_id = staff_id ของตัวเอง
      appointmentSql = `
  SELECT 
    'appointment' AS type,
    a.appointment_id AS id,
    CONCAT(u.name, ' ', u.surname) AS full_name,   -- ⭐ แสดงชื่อนักศึกษา
    a.appointment_date AS event_date,
    c.type AS title,
    a.status,
    a.student_note,
    a.user_id AS staffId
  FROM appointment AS a
  JOIN user u ON a.student_email = u.email         -- ⭐ JOIN หา user จาก email
  JOIN categories AS c ON a.category_id = c.category_id
  WHERE a.user_id = ?
    AND a.status IN (0, 1, 2, 3)
`

      appointmentParams = [userId]

      documentSql = `
  SELECT 
  'document' AS type,
  d.document_id AS id,
  CONCAT(u.name, ' ', u.surname) AS full_name,   -- ⭐ ชื่อ-นามสกุลจริง
  d.submit_date AS event_date,
  c.type AS title,
  d.status,
  d.student_note AS student_note,
  d.staff_note AS staff_note,
  d.document_code AS document_code,
  d.image_path AS image_path,
  d.image_complete AS image_complete,
  d.user_id AS staffId
FROM document_tracking AS d
JOIN user u ON d.student_email = u.email
JOIN categories AS c ON d.category_id = c.category_id
JOIN user_category uc ON d.category_id = uc.category_id
WHERE uc.user_id = ?
  AND d.status IN (1, 2, 3)

`
documentParams = [userId]

    }

    // 🧑‍⚖️ Admin
    else if (role === 'admin' || role === 1) {
      const staffIdNum = Number(staffId)
      const hasValidStaffId = Number.isInteger(staffIdNum) && staffIdNum > 0
      let categoryIdNum = null
  if (hasValidStaffId) {
    const [staffInfo] = await runQuery(
      "SELECT category_id FROM user_category WHERE user_id = ?",
      [staffIdNum]
    )
    categoryIdNum = staffInfo?.category_id
  }

  const hasValidCategoryId = Number.isInteger(categoryIdNum) && categoryIdNum > 0
      appointmentSql = `
        SELECT 
          'appointment' AS type,
          a.appointment_id AS id,
          a.student_email AS full_name,
          CONCAT(s.name, ' ', s.surname) AS staffName,
          c.type AS title,
          a.status,
          a.appointment_date AS event_date,
          a.user_id AS staffId
        FROM appointment AS a
        JOIN user AS s ON a.user_id = s.user_id
        JOIN categories AS c ON a.category_id = c.category_id   
        ${hasValidStaffId ? 'WHERE a.user_id = ?' : 'WHERE 1=0'}
      `
      appointmentParams = hasValidStaffId ? [staffIdNum] : []

      documentSql = `
        SELECT 
          'document' AS type,
          d.document_id AS id,
          d.student_email AS full_name,
          d.student_note AS student_note,
          d.image_path,
          d.image_complete,
          d.status,
          d.submit_date AS event_date,
          d.category_id
        FROM document_tracking AS d
        ${hasValidCategoryId ? 'WHERE d.category_id = ?' : 'WHERE 1=0'}
      `
      documentParams = hasValidCategoryId ? [categoryIdNum] : []
    }

    else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' })
    }

    // ✅ 2. ดึงข้อมูลหลังอัปเดต
    const [appointmentResults, documentResults] = await Promise.all([
      runQuery(appointmentSql, appointmentParams),
      runQuery(documentSql, documentParams)
    ])

    const combinedHistory = [...appointmentResults, ...documentResults]

    // ✅ 3. เรียงลำดับ
    combinedHistory.sort((a, b) => new Date(b.event_date) - new Date(a.event_date))

    console.log(`✅ Found ${combinedHistory.length} total items (apps: ${appointmentResults.length}, docs: ${documentResults.length}) for ${role} ${userId || userEmail}`)
    res.json({ success: true, historyItems: combinedHistory })

  } catch (err) {
    console.error('🔥 SQL error (combined history):', err)
    return res.status(500).json({ success: false, message: 'Database error' })
  }
})
  return router
}