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

  // GET /secretary/appointmentRequests
router.get('/appointmentRequests', authMiddleware, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID not found in token' });
  }

  const sql = `
    SELECT 
      a.appointment_id,
      a.user_id AS studentId,
      u.name,
      u.surname,
      a.appointment_date,
      c.type AS topic,
      a.student_note,
      a.status
  FROM appointment a
  JOIN user_category uc ON a.category_id = uc.category_id
  JOIN categories c ON a.category_id = c.category_id
  JOIN user u ON a.user_id = u.user_id
  WHERE uc.user_id = ? AND a.status = 0
  ORDER BY a.appointment_date ASC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ SQL error (appointmentRequests):', err);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('✅ Fetched pending appointments for secretary:', userId, '| Count:', results.length);
    res.json({ requests: results });
  });
});

// POST /secretary/updateAppointmentStatus
router.post('/updateAppointmentStatus', authMiddleware, (req, res) => {
  const userId = req.user.id || req.user.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID not found in token' });
  }

  const { appointment_id, status } = req.body;

  if (![0, 1, 2].includes(Number(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // ✅ ใช้ appointment_id เท่านั้น
  const sql = `
    UPDATE appointment
    SET status = ?
    WHERE appointment_id = ?
  `;

  db.query(sql, [status, appointment_id], (err, result) => {
    if (err) {
      console.error('❌ SQL error (update):', err);
      return res.status(500).json({ error: 'Failed to update' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ success: true });
  });
});

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
router.get('/rating-Document', (req, res) => {
  const { year, semester, staffId } = req.query;
  console.log('📊 Received rating request (Document):', { year, semester, staffId });

  if (!year || !semester || !staffId) {
    return res.status(400).json({ success: false, message: "Missing year, semester, or staffId" });
  }

  // 1. ⭐️ แก้ SQL: เปลี่ยนเป็นตาราง Document
  // ‼️ สำคัญ: เช็คชื่อคอลัมน์วันที่ของ document (เช่น 'd.created_at' หรือ 'd.submitted_date')
  const sql = `
    SELECT 
      fd.score_count1,
      fd.score_count2,
      fd.score_count3,
      fd.comment       
    FROM feedback_document fd
    JOIN document d ON fd.document_id = d.document_id
    JOIN academic_period ap ON DATE(d.created_at) BETWEEN ap.start_date AND ap.end_date
    JOIN user_category uc ON d.category_id = uc.category_id
    JOIN user s ON uc.user_id = s.user_id 
    WHERE 
      ap.academic_year = ? AND 
      ap.semester = ? AND
      s.user_id = ?;
  `;

  db.query(sql, [year, semester, staffId], (err, results) => {
    if (err) {
      console.error('❌ SQL Error (Document):', err);
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

    // 3. ⭐️ (การคำนวณ JS - เหมือนเดิมทุกประการ)
    let totalFriendliness = 0;
    let totalEfficiency = 0;
    let totalCommunication = 0;
    const commentsList = [];
    const count = results.length;

    results.forEach(row => {
      const score1 = parseFloat(row.score_count1 || 0);
      const score2 = parseFloat(row.score_count2 || 0);
      const score3 = parseFloat(row.score_count3 || 0);

      totalFriendliness += score1;
      totalEfficiency += score2;
      totalCommunication += score3;
      
      if (row.comment) { 
        const commentAvg = (score1 + score2 + score3) / 3;
        const commentStars = Math.round(commentAvg); 

        commentsList.push({
          text: row.comment, 
          stars: commentStars 
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
// ------------------------------------------ Staff Off-time -----------------------------------------------------
router.post("/offtime", async (req, res) => {
    const { staff_id, date, start_time, end_time } = req.body;

    try {
        const [rows] = await db.promise().query(
            "SELECT role FROM users WHERE user_id = ?",
            [staff_id]
        );

        if (rows.length === 0 || rows[0].role !== 2) {
            return res.status(403).json({
                success: false,
                message: "Only staff (role = 2) can create off-time."
            });
        }

        // ✅ ผ่านแล้ว → บันทึกลง off_time
        await db.promise().query(
            "INSERT INTO off_time (staff_id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
            [staff_id, date, start_time, end_time]
        );

        return res.json({ success: true, message: "Off-time created." });

    } catch (err) {
        console.error("Error creating off-time:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
//  เพิ่มเวลาหยุดงานของเจ้าหน้าที่
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { staff_id, date, start_time, end_time } = req.body;

    if (!staff_id || !date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // ✅ ตรวจ role = 2
    const [rows] = await db.promise().query(
      "SELECT role FROM user WHERE user_id = ?",
      [staff_id]
    );

    if (rows.length === 0 || rows[0].role !== 2) {
      return res.status(403).json({
        success: false,
        message: "Only staff (role = 2) can create off-time."
      });
    }

    // ✅ Insert into DB
    await db.promise().query(
      `INSERT INTO off_time (staff_id, date, start_time, end_time)
       VALUES (?, ?, ?, ?)`,
      [staff_id, date, start_time, end_time || null]
    );

    res.json({ success: true, message: "Off-time added" });

  } catch (err) {
    console.error("🔥 Error adding off-time:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


//  ดึงรายการเวลาหยุดงานของเจ้าหน้าที่ในสัปดาห์นั้น
// ✅ ดึงรายการ off-time
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.query;

    if (!weekStart || !weekEnd) {
      return res.status(400).json({
        success: false,
        message: "weekStart and weekEnd are required"
      });
    }

    console.log("✅ Fetch off-time:", weekStart, weekEnd);

    const [rows] = await db.promise().query(
      `SELECT off_time_id, staff_id, 	date, start_time, end_time
       FROM off_time
       WHERE 	date BETWEEN ? AND ?
       ORDER BY 	date, start_time`,
      [weekStart, weekEnd]
    );

    res.json({ success: true, items: rows });

  } catch (err) {
    console.error("🔥 Error fetching off-time:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ✅ ลบ off-time
router.post('/delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No ids provided"
      });
    }

    await db.promise().query(
      `DELETE FROM off_time WHERE off_time_id IN (?)`,
      [ids]
    );

    res.json({ success: true, message: "Off-time deleted" });

  } catch (err) {
    console.error("🔥 Error deleting off-time:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ------------------------------------------ Public Off-time สำหรับแสดงผลให้นักศึกษา -----------------------------------------------------
// ✅ ดึง off-time (สำหรับ Public/นักเรียน)
router.get('/public/list', async (req, res) => {
  try {
    // 1. รับ staffId เพิ่มจาก req.query
    const { weekStart, weekEnd, staffId } = req.query;

    // 2. ตรวจสอบพารามิเตอร์
    if (!weekStart || !weekEnd || !staffId) {
      return res.status(400).json({
        success: false,
        message: "weekStart, weekEnd, and staffId are required"
      });
    }

    // 3. Query พร้อมเงื่อนไข staff_id
    const [rows] = await db.promise().query(
      `SELECT date, start_time
       FROM off_time
       WHERE CAST(date AS DATE) BETWEEN ? AND ?
       AND staff_id = ?
       ORDER BY date, start_time`,
      [weekStart, weekEnd, staffId]
    );

    res.json({ success: true, items: rows });

  } catch (err) {
    console.error("🔥 Error fetching public off-time:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

 return router;
}