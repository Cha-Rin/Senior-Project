const express = require('express')
const authMiddleware = require('../middleware/auth')
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

  // =========================
  // 🔧 Helper: email -> user_id
  // =========================
  async function getUserIdByEmail (email) {
    if (!email) return null
    const [rows] = await db.promise().query(
      'SELECT user_id FROM user WHERE email = ? LIMIT 1',
      [email]
    )
    return rows.length ? rows[0].user_id : null
  }

  // ==================================================
  // 🟣 APPOINTMENT (Secretary side)
  // ==================================================

  // GET /secretary/appointmentRequests
  router.get('/appointmentRequests', authMiddleware, async (req, res) => {
    try {
      const email = req.user.email
      const staffId = await getUserIdByEmail(email)

      if (!staffId) {
        return res.status(400).json({ error: 'User ID not found for this email' })
      }

      const sql = `
        SELECT 
          a.appointment_id,
          a.user_id AS studentId,
          a.student_name AS full_name,
          a.appointment_date,
          a.student_email,
          c.type AS topic,
          a.student_note,
          a.status
        FROM appointment a
        JOIN categories c ON a.category_id = c.category_id
        WHERE a.user_id = ? AND a.status = 0
        ORDER BY a.appointment_date ASC
      `

      db.query(sql, [staffId], (err, results) => {
        if (err) {
          console.error('❌ SQL error (appointmentRequests):', err)
          return res.status(500).json({ error: 'Database error' })
        }

        console.log(
          '✅ Fetched pending appointments for secretary:',
          staffId,
          '| Count:',
          results.length
        )
        res.json({ requests: results })
      })
    } catch (err) {
      console.error('🔥 Error in /appointmentRequests:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // POST /secretary/updateAppointmentStatus
  router.post('/updateAppointmentStatus', authMiddleware, (req, res) => {
    const { appointment_id, status } = req.body

    if (![0, 1, 2].includes(Number(status))) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const sql = `
      UPDATE appointment
      SET status = ?
      WHERE appointment_id = ?
    `

    db.query(sql, [status, appointment_id], (err, result) => {
      if (err) {
        console.error('❌ SQL error (update):', err)
        return res.status(500).json({ error: 'Failed to update' })
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Appointment not found' })
      }
      res.json({ success: true })
    })
  })

  // ------------------------------------------
  // 📜 Get history appointment (Secretary)
  // ------------------------------------------
  router.get('/historyAppointment', authMiddleware, async (req, res) => {
    try {
      const email = req.user.email
      const staffId = await getUserIdByEmail(email)

      if (!staffId) {
        return res.status(400).json({ success: false, message: 'User ID not found for this email' })
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
      `
      db.query(sql, [staffId], (err, results) => {
        if (err) {
          console.error('🔥 SQL error (history):', err)
          return res.status(500).json({ success: false, message: 'Database error' })
        }

        console.log('🔍 Query result count for staff', staffId, ':', results.length)
        if (results.length === 0) {
          console.warn('⚠️ No history found for staff:', staffId)
          return res.status(200).json({ success: true, historyItems: [] })
        }
        console.log('✅ Found history items:', results.length)

        res.json({ success: true, historyItems: results })
      })
    } catch (err) {
      console.error('🔥 Error in /historyAppointment:', err)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  })

  // =====================================
  // 💼 Secretary Rating (Appointment)
  // =====================================
  router.get('/rating-Appointment', (req, res) => {
  const { startDate, endDate, staffId } = req.query;
  
  // ✅ ตรวจสอบ parameters
  if (!startDate || !endDate || !staffId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing startDate, endDate, or staffId' 
    });
  }

  // ✅ แก้ SQL ให้ใช้ date range แทน academic_year/semester
  const sql = `
    SELECT 
      fa.score_count1,
      fa.score_count2,
      fa.score_count3,
      fa.comment       
    FROM feedback_appointment fa
    JOIN appointment a ON fa.appointment_id = a.appointment_id
    JOIN user_category uc ON a.category_id = uc.category_id
    JOIN user s ON uc.user_id = s.user_id 
    WHERE 
      DATE(a.appointment_date) BETWEEN ? AND ? 
      AND s.user_id = ?
  `;

  db.query(sql, [startDate, endDate, staffId], (err, results) => {
    if (err) {
      console.error('❌ SQL Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }

    // ✅ ถ้าไม่มีข้อมูล
    if (results.length === 0) {
      const emptyData = {
        averages: {
          friendliness: '0.00',
          efficiency: '0.00',
          communication: '0.00',
          average: '0.0'
        },
        comments: []
      };
      return res.json({ success: true, data: emptyData });
    }

    // ✅ คำนวณคะแนนเฉลี่ย
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

    const avgData = {
      friendliness: (totalFriendliness / count).toFixed(2),
      efficiency: (totalEfficiency / count).toFixed(2),
      communication: (totalCommunication / count).toFixed(2)
    };

    const overallAvg = (
      (Number(avgData.friendliness) +
       Number(avgData.efficiency) +
       Number(avgData.communication)) / 3
    ).toFixed(1);

    res.json({
      success: true,
      data: {
        averages: { ...avgData, average: overallAvg },
        comments: commentsList
      }
    });
  });
});

// --------------------------------------------------------------------------------------------------------
  // ==================================================
  // 📄 DOCUMENT (Secretary side)
  // ==================================================

  // GET /secretary/documentRequests
  router.get('/documentRequests', authMiddleware, async (req, res) => {
    try {
      const email = req.user.email
      const staffId = await getUserIdByEmail(email)

      if (!staffId) {
        return res.status(400).json({ error: 'User ID not found for this email' })
      }

      const sql = `
        SELECT 
          d.document_id,
          d.document_code, 
          d.user_id AS studentId,
          d.student_email,
          d.student_name AS full_name,
          d.submit_date,
          c.type AS topic,
          d.image_path,
          d.status
        FROM document_tracking d
        JOIN user_category uc ON d.category_id = uc.category_id
        JOIN categories c ON d.category_id = c.category_id
        WHERE uc.user_id = ? 
          AND d.status = 0
        ORDER BY d.submit_date DESC
      `

      db.query(sql, [staffId], (err, results) => {
        if (err) {
          console.error('❌ SQL error (documentRequests):', err)
          return res.status(500).json({ error: 'Database error' })
        }
        console.log('✅ Pending documents for secretary:', staffId, '| Count:', results.length)
        res.json({ requests: results })
      })
    } catch (err) {
      console.error('🔥 Error in /documentRequests:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // POST /secretary/updateDocumentStatus
  router.post('/updateDocumentStatus', authMiddleware, (req, res) => {
    const { document_id, status, reason } = req.body

    if (![0, 1, 2, 3].includes(Number(status))) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const finishDate = [2, 3].includes(Number(status)) ? new Date() : null

    const sql = `
      UPDATE document_tracking 
      SET 
        status = ?,
        staff_note = ?,
        finish_date = CASE WHEN ? IN (2,3) THEN NOW() ELSE finish_date END
      WHERE document_id = ?
    `

    db.query(sql, [status, reason || null, finishDate, document_id], (err, result) => {
      if (err) {
        console.error('❌ SQL error (updateDocumentStatus):', err)
        return res.status(500).json({ error: 'Failed to update document status' })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Document not found' })
      }

      console.log(`✅ Document ${document_id} updated → status ${status}`)
      res.json({ success: true, message: 'Document status updated successfully' })
    })
  })

  // GET /secretary/documentStatus
  router.get('/documentStatus', authMiddleware, async (req, res) => {
    try {
      const email = req.user.email
      const staffId = await getUserIdByEmail(email)
      if (!staffId) return res.status(400).json({ error: 'User ID not found for this email' })

      const sql = `
        SELECT 
          d.document_id,
          d.document_code,          
          d.student_email, 
          d.user_id AS studentId,
          d.student_name,
          d.submit_date,
          c.type AS topic,
          d.status
        FROM document_tracking d
        JOIN user_category uc ON d.category_id = uc.category_id
        JOIN categories c ON d.category_id = c.category_id
        WHERE uc.user_id = ?
          AND d.status = 1
        ORDER BY d.submit_date DESC
      `

      db.query(sql, [staffId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' })
        res.json({ documents: results })
      })
    } catch (err) {
      console.error('🔥 Error in /documentStatus:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // ==========================================
  // 📎 Upload file (Secretary → Student)
  // ==========================================
  const multer = require('multer')
  const path = require('path')

  // นักศึกษา>เลขา (ยังมีใช้ใน route อื่น)
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/documents'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  })
  const upload = multer({ storage })

  // เลขา>นักศึกษา
  const storageSec = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/uprequest'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  })
  const uploadSec = multer({ storage: storageSec })

  // POST /secretary/markDocumentComplete
  router.post(
    '/markDocumentComplete',
    authMiddleware,
    uploadSec.single('file'),
    (req, res) => {
      console.log('📥 File upload request received')
      console.log('➡️ req.file:', req.file)
      console.log('➡️ req.body:', req.body)

      const { document_id } = req.body
      const filePath = req.file ? `/uploads/uprequest/${req.file.filename}` : null

      if (!document_id || !filePath)
        return res.status(400).json({ error: 'Missing document_id or file' })

      const sql = `
        UPDATE document_tracking
        SET status = 2, image_complete = ?, finish_date = NOW()
        WHERE document_id = ?
      `

      db.query(sql, [filePath, document_id], (err, result) => {
        if (err) {
          console.error('❌ SQL error (markDocumentComplete):', err)
          return res.status(500).json({ error: 'Database error' })
        }

        console.log(`✅ Document ${document_id} marked as Complete`)
        res.json({ success: true, message: 'Document marked complete', filePath })
      })
    }
  )

  // ==========================================
  // 📊 Rating – Document (per staff per term)
  // ==========================================
  router.get('/rating-Document', (req, res) => {
  const { startDate, endDate, staffId } = req.query;
  console.log('📊 Received rating request (Document by date):', { startDate, endDate, staffId });

  if (!startDate || !endDate || !staffId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing startDate, endDate, or staffId' 
    });
  }

  // ✅ ตรวจสอบรูปแบบวันที่ (ทางเลือก — ไม่จำเป็นถ้า Vue ส่งมาถูกต้อง)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid date format. Use YYYY-MM-DD' 
    });
  }

  // ✅ แก้ไขจุดสำคัญ: เปลี่ยนจาก s.email → เป็น s.user_id
  const sql = `
    SELECT 
      fd.score_count1,
      fd.score_count2,
      fd.score_count3,
      fd.comment       
    FROM feedback_document_tracking fd
    JOIN document_tracking d ON fd.document_id = d.document_id
    JOIN user_category uc ON d.category_id = uc.category_id
    JOIN user s ON uc.user_id = s.user_id 
    WHERE 
      DATE(d.submit_date) BETWEEN ? AND ? 
      AND s.user_id = ?;  -- ✅ เปลี่ยนตรงนี้: email → user_id
  `;

  // ✅ ส่ง staffId โดยตรง (ไม่ต้อง map email)
  db.query(sql, [startDate, endDate, staffId], (err, results) => {
    if (err) {
      console.error('❌ SQL Error (Document by date):', err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          averages: {
            friendliness: '0.00',
            efficiency: '0.00',
            communication: '0.00'
          },
          comments: []
        }
      });
    }

    let totalFriendliness = 0;
    let totalEfficiency = 0;
    let totalCommunication = 0;
    const commentsList = [];
    const count = results.length;

    results.forEach(row => {
      const score1 = parseFloat(row.score_count1) || 0;
      const score2 = parseFloat(row.score_count2) || 0;
      const score3 = parseFloat(row.score_count3) || 0;

      totalFriendliness += score1;
      totalEfficiency += score2;
      totalCommunication += score3;

      if (row.comment && row.comment.trim()) {
        const commentAvg = (score1 + score2 + score3) / 3;
        const commentStars = Math.round(commentAvg);
        commentsList.push({
          text: row.comment.trim(),
          stars: commentStars
        });
      }
    });

    const avgData = {
      friendliness: (totalFriendliness / count).toFixed(2),
      efficiency: (totalEfficiency / count).toFixed(2),
      communication: (totalCommunication / count).toFixed(2)
    };

    res.json({
      success: true,
      data: {
        averages: avgData,
        comments: commentsList
      }
    });
  });
});
  // ==================================================
  // 🕒 Staff Off-time (Secretary self-manage)
  // ==================================================

  // (เก่า) POST /offtime – ใช้ email เป็น input แต่บันทึกเป็น user_id ใน off_time
  router.post('/offtime', async (req, res) => {
    const { staff_id, date, start_time, end_time } = req.body

    try {
      // staff_id ถูกส่งมาเป็น email
      const staffEmail = staff_id
      const [roleRows] = await db.promise().query(
        'SELECT user_id, role FROM user WHERE email = ?',
        [staffEmail]
      )

      if (roleRows.length === 0 || roleRows[0].role !== 2) {
        return res.status(403).json({
          success: false,
          message: 'Only staff (role = 2) can create off-time.'
        })
      }

      const staffDbId = roleRows[0].user_id

      // ดึง category_id จาก user_category โดยใช้ user_id
      const [catRows] = await db.promise().query(
        'SELECT category_id FROM user_category WHERE user_id = ? LIMIT 1',
        [staffDbId]
      )

      if (catRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'This staff has no category assigned.'
        })
      }

      const category_id = catRows[0].category_id

      await db.promise().query(
        'INSERT INTO off_time (staff_id, category_id, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
        [staffDbId, category_id, date, start_time, end_time]
      )

      res.json({ success: true, message: 'Off-time created successfully.' })
    } catch (err) {
      console.error('🔥 Error creating off-time:', err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  //  เพิ่มเวลาหยุดงานของเจ้าหน้าที่ (ใช้ในหน้า calendar)
  router.post('/add', authMiddleware, async (req, res) => {
    try {
      const { staff_id, date, start_time, end_time } = req.body

      if (!staff_id || !date || !start_time || !end_time) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        })
      }

      // staff_id จาก FE = email
      const staffEmail = staff_id
      const [rows] = await db.promise().query(
        'SELECT user_id, role FROM user WHERE email = ?',
        [staffEmail]
      )

      if (rows.length === 0 || rows[0].role !== 2) {
        return res.status(403).json({
          success: false,
          message: 'Only staff (role = 2) can create off-time.'
        })
      }

      const staffDbId = rows[0].user_id

      await db.promise().query(
        `INSERT INTO off_time (staff_id, date, start_time, end_time)
         VALUES (?, ?, ?, ?)`,
        [staffDbId, date, start_time, end_time || null]
      )

      res.json({ success: true, message: 'Off-time added' })
    } catch (err) {
      console.error('🔥 Error adding off-time:', err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // ✅ ดึงรายการ off-time ของ staff ในสัปดาห์นั้น (secretary ดูของตัวเอง)
  router.get('/list', authMiddleware, async (req, res) => {
    try {
      const { weekStart, weekEnd, categoryId } = req.query
      const email = req.user.email

      // แปลง email → user_id
      const staffDbId = await getUserIdByEmail(email)
      if (!staffDbId) {
        return res.status(400).json({ success: false, message: 'No staff found for this email.' })
      }

      // ถ้า front-end ไม่ส่ง categoryId → ใช้ category แรกของ staff
      let catId = categoryId
      if (!catId) {
        const [catRows] = await db.promise().query(
          'SELECT category_id FROM user_category WHERE user_id = ? LIMIT 1',
          [staffDbId]
        )
        catId = catRows.length ? catRows[0].category_id : null
      }

      if (!catId) {
        return res.status(400).json({ success: false, message: 'No category found for this staff.' })
      }

      const [rows] = await db.promise().query(
        `
        SELECT o.off_time_id, o.staff_id, uc.category_id, o.date, o.start_time, o.end_time
        FROM off_time o
        JOIN user_category uc ON o.staff_id = uc.user_id
        WHERE o.staff_id = ? AND uc.category_id = ?
          AND o.date BETWEEN ? AND ?
        ORDER BY o.date, o.start_time
      `,
        [staffDbId, catId, weekStart, weekEnd]
      )

      res.json({ success: true, items: rows })
    } catch (err) {
      console.error('🔥 Error fetching off-time:', err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // ✅ ลบ off-time
  router.post('/delete', authMiddleware, async (req, res) => {
    try {
      const { ids } = req.body

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No ids provided'
        })
      }

      await db.promise().query(
        `DELETE FROM off_time WHERE off_time_id IN (?)`,
        [ids]
      )

      res.json({ success: true, message: 'Off-time deleted' })
    } catch (err) {
      console.error('🔥 Error deleting off-time:', err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // ------------------------------------------
  // 🌐 Public Off-time (สำหรับนักศึกษา)
  // ------------------------------------------
  // staffId ที่รับมาที่นี่ = user.user_id (int) /public/list
  router.get('/public/list', async (req, res) => {
    try {
      const { weekStart, weekEnd, staffId } = req.query

      if (!weekStart || !weekEnd || !staffId) {
        return res.status(400).json({
          success: false,
          message: 'weekStart, weekEnd, and staffId are required'
        })
      }

      const [rows] = await db.promise().query(
        `
        SELECT date, start_time
        FROM off_time
        WHERE CAST(date AS DATE) BETWEEN ? AND ?
          AND staff_id = ?
        ORDER BY date, start_time
      `,
        [weekStart, weekEnd, staffId]
      )

      res.json({ success: true, items: rows })
    } catch (err) {
      console.error('🔥 Error fetching public off-time:', err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // ==========================================================
  // 📚 Combined History (appointment + document) – all
  // (ใช้สำหรับหน้า dashboard รวมภาพรวมได้ ถ้าคุณยังใช้ route นี้)
  // ==========================================================
  router.get('/historyall', authMiddleware, async (req, res) => {
    try {
      const [appointments] = await db.promise().query(`
        SELECT 
          a.appointment_id AS id,
          'appointment' AS type,
          CONCAT(u.name, ' ', u.surname) AS full_name,
          a.appointment_date AS event_date,
          c.type AS title,
          a.student_note,
          a.status
        FROM appointment a
        JOIN user u ON a.user_id = u.user_id
        JOIN categories c ON a.category_id = c.category_id
        WHERE a.status IN (1, 2)
      `)

      const [documents] = await db.promise().query(`
        SELECT 
          d.document_id AS id,
          'document' AS type,
          CONCAT(u.name, ' ', u.surname) AS full_name,
          d.submit_date AS event_date,
          c.type AS title,
          d.staff_note AS student_note,
          d.status
        FROM document_tracking d
        JOIN user u ON d.user_id = u.user_id
        JOIN categories c ON d.category_id = c.category_id
        WHERE d.status IN (1, 2, 3)
      `)

      const all = [...appointments, ...documents].sort(
        (a, b) => new Date(b.event_date) - new Date(a.event_date)
      )

      res.json({ success: true, historyItems: all })
    } catch (err) {
      console.error('🔥 Error fetching historyall:', err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  return router
}
