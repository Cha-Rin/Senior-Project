const express = require('express')
const authMiddleware = require('../middleware/auth') ;
const util = require('util');
module.exports = (db) => {
  const router = express.Router()
  const query = util.promisify(db.query).bind(db);
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
router.get('/historyall', authMiddleware, async (req, res) => { // 1. ต้องเป็น async
  const userId = req.user.id || req.user.user_id;
  const role = req.user.role;
  const staffId = req.query.staffId;

  console.log(`📥 User ${userId} with role ${role} requested history (combined)`);
  if (!userId || !role) {
    return res.status(400).json({ success: false, message: 'User ID or role not found in token' });
  }

  // Helper นี้ถูกต้องครับ
  const runQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

  try {
    let appointmentSql, appointmentParams;
    let documentSql, documentParams;

    // 🧑‍🎓 Student → ดูประวัติของตัวเอง
    if (role === 'student' || role === 3) {
      
      // ⚠️ แก้ไขจุดที่ 1: เปลี่ยนจาก `sql = ...` เป็น `appointmentSql = ...`
      appointmentSql = `
        SELECT 
          'appointment' AS type,
          a.appointment_id AS id,
          a.appointment_date AS event_date,
          c.type AS title,
          a.status,
          a.student_note,
          a.user_id AS studentId
        FROM appointment AS a
        JOIN categories AS c ON a.category_id = c.category_id
        WHERE a.user_id = ?
      `;
      appointmentParams = [userId];

      documentSql = `
        SELECT 
          'document' AS type,
          d.document_id AS id,
          d.submit_date AS event_date,
          d.status,
          d.student_note AS document_note,
          d.user_id AS studentId
        FROM document_tracking AS d
        WHERE d.user_id = ?
      `;
      documentParams = [userId];
    }

    // 🧑‍💼 Secretary → ดูรายการของหมวดตัวเอง
    else if (role === 'secretary' || role === 2) {
      appointmentSql = `
        SELECT 
          'appointment' AS type,
          a.appointment_id AS id,
          a.appointment_date AS event_date,
          c.type AS title,
          a.status,
          a.student_note,
          a.user_id AS studentId
        FROM appointment AS a
        JOIN categories AS c ON a.category_id = c.category_id
        JOIN user_category uc ON a.category_id = uc.category_id
        WHERE uc.user_id = ?
          AND a.status IN (1, 2)
      `;
      appointmentParams = [userId];

      documentSql = `
        SELECT 
          'document' AS type,
          d.document_id AS id,
          d.submit_date AS event_date,
          d.status,
          d.student_note AS document_note,
          d.user_id AS studentId
        FROM document_tracking AS d
        JOIN user_category uc ON d.category_id = uc.category_id
        WHERE uc.user_id = ?
          AND d.status IN (1, 2)
      `;
      documentParams = [userId];
    }

    // 🧑‍⚖️ Admin → ดูประวัติของ staff ทั้งหมด หรือของคนที่ระบุ staffId
    else if (role === 'admin' || role === 1) {
      const staffIdNum = Number(staffId);
const hasValidStaffId = Number.isInteger(staffIdNum) && staffIdNum > 0;


      appointmentSql = `
        SELECT 
          'appointment' AS type,
          a.appointment_id AS id,
          a.user_id AS studentId,
          s.name AS staffName,
          c.type AS title,
          a.status,
          a.appointment_date AS event_date
        FROM appointment AS a
        JOIN user_category uc ON a.category_id = uc.category_id
        JOIN user AS s ON uc.user_id = s.user_id
        JOIN categories AS c ON a.category_id = c.category_id
        ${hasValidStaffId ? 'WHERE s.user_id = ?' : 'WHERE 1=0'}
      `;
      appointmentParams = hasValidStaffId ? [staffIdNum] : [];

      documentSql = `
        SELECT 
          'document' AS type,
          d.document_id AS id,
          d.user_id AS studentId,
          s.name AS staffName,
          d.student_note AS document_note,
          d.status,
          d.submit_date AS event_date
        FROM document_tracking AS d
        JOIN user_category uc ON d.category_id = uc.category_id
        JOIN user AS s ON uc.user_id = s.user_id
        ${hasValidStaffId ? 'WHERE s.user_id = ?' : 'WHERE 1=0'}
      `;
      documentParams = hasValidStaffId ? [staffIdNum] : [];
    }

    else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    // ⚠️ แก้ไขจุดที่ 2: ลบ `db.query(sql, params, ...)` เก่าทิ้ง
    // และเพิ่มส่วนนี้เข้ามาแทน (ยิง 2 queries, รวม, เรียงลำดับ)

    // 1. ยิง 2 Queries พร้อมกัน
    const [appointmentResults, documentResults] = await Promise.all([
      runQuery(appointmentSql, appointmentParams),
      runQuery(documentSql, documentParams)
    ]);

    // 2. รวมข้อมูล
    const combinedHistory = [...appointmentResults, ...documentResults];

    // 3. เรียงลำดับข้อมูลทั้งหมดตาม event_date (ใหม่ไปเก่า)
    combinedHistory.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    // 4. ส่งผลลัพธ์
    console.log(`✅ Found ${combinedHistory.length} total items (apps: ${appointmentResults.length}, docs: ${documentResults.length}) for ${role} ${userId}`);
    res.json({ success: true, historyItems: combinedHistory });


  } catch (err) { // ⚠️ เพิ่ม catch block สำหรับ async/await
    console.error('🔥 SQL error (combined history):', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
});

  return router
}