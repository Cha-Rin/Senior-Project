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
  const { year, semester, staffId } = req.query;
  console.log('📊 Received rating request:', { year, semester, staffId });

  if (!year || !semester || !staffId) {
    return res.status(400).json({ success: false, message: "Missing year, semester, or staffId" });
  }

  // 1. ⭐️ แก้ SQL: ลบ fa.score_overall ออก
  const sql = `
    SELECT 
 fa.score_count1,
 fa.score_count2,
 fa.score_count3,
 fa.comment       
 FROM feedback_appointment fa
 JOIN appointment a ON fa.appointment_id = a.appointment_id
 JOIN academic_period ap ON DATE(a.appointment_date) BETWEEN ap.start_date AND ap.end_date
 JOIN user_category uc ON a.category_id = uc.category_id
 JOIN user s ON uc.user_id = s.user_id 
 WHERE 
 ap.academic_year = ? AND 
 ap.semester = ? AND
 s.user_id = ?;
 `;

 db.query(sql, [year, semester, staffId], (err, results) => {
 if (err) {
console.error('❌ SQL Error:', err);
 return res.status(500).json({ success: false, error: err.message });
 }

 // 2. (เหมือนเดิม)
 if (results.length === 0) {
 const emptyData = {
 averages: { friendliness: "0.00", efficiency: "0.00", communication: "0.00", average: "0.0" },
 comments: []
 };
 return res.json({ success: true, data: emptyData });
 }

 // 3. ⭐️ แก้ไขการคำนวณ JS
 let totalFriendliness = 0;
 let totalEfficiency = 0;
 let totalCommunication = 0;
 const commentsList = [];
 const count = results.length;

 results.forEach(row => {
 const score1 = parseFloat(row.score_count1 || 0);
 const score2 = parseFloat(row.score_count2 || 0);
 const score3 = parseFloat(row.score_count3 || 0);

      // (สำหรับกราฟ)
 totalFriendliness += score1;
 totalEfficiency += score2;
 totalCommunication += score3;
      
 // ⭐️ (สำหรับคอมเมนต์)
      // ‼️ (แก้ 'row.comment' ถ้าชื่อคอลัมน์ไม่ตรง)
 if (row.comment) { 
        // ⭐️ คำนวณค่าเฉลี่ยของ 3 ส่วน แล้วปัดเศษ
        const commentAvg = (score1 + score2 + score3) / 3;
        const commentStars = Math.round(commentAvg); // ปัดเศษเป็นจำนวนเต็ม (เช่น 3.6 -> 4)

 commentsList.push({
 text: row.comment, 
 stars: commentStars // ⭐️ ใช้ค่าที่คำนวณใหม่
 });
 }
 });

 // (ส่วนที่เหลือเหมือนเดิม)
 const avgData = {
friendliness: (totalFriendliness / count).toFixed(2),
 efficiency: (totalEfficiency / count).toFixed(2),
 communication: (totalCommunication / count).toFixed(2),
 };
 const overallAvg = ((
      Number(avgData.friendliness) + 
      Number(avgData.efficiency) + 
      Number(avgData.communication)
    ) / 3).toFixed(1);

 res.json({ 
 success: true, 
 data: { 
 averages: { ...avgData, average: overallAvg }, 
 comments: commentsList 
 } 
 });
 });
});

// ------------------------------------------ Document -----------------------------------------------------
// ------------------------------------------ Get history Document -----------------------------------------


 return router;
}