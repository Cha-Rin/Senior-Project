const express = require('express')
const authMiddleware = require('../middleware/auth') ;
const SECRET_KEY = 'mysecretkey'

// ✅ 1. เพิ่ม 2 บรรทัดนี้
const multer = require('multer')
const path = require('path')

// ✅ 2. เพิ่มส่วนตั้งค่า Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/') // ต้องสร้าง folder นี้รอไว้
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    )
  },
})
const upload = multer({ storage: storage })

// -----------------------------------------------------

module.exports = (db) => {
  const router = express.Router()

  // ‼️ ลบ 2 บรรทัดนี้ออกจาก global (ถ้า route อื่นไม่ใช้ไฟล์)
  // router.use(express.json())
  // router.use(express.urlencoded({ extended: true }))
  // หรือถ้าจะเก็บไว้ ให้เพิ่ม express.json() ใน route อื่นๆ ที่รับ json

  router.use((req, res, next) => {
    if (req.method === 'POST') {
      console.log('🔎 POST', req.originalUrl)
      console.log('🔎 content-type:', req.headers['content-type'])
      console.log('🔎 body:', req.body)
    }
    next()
  })

// -------------------------------------Student Appointment ----------------------------------------
router.post('/appointments', (req, res) => {
  console.log('✅ Received body:', req.body)
  const {
    user_id,
    category_id,
    student_email,
    appointment_date,
    staff_offtime,
    student_note,
    status
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const sql = `INSERT INTO appointment
    (user_id, category_id, student_email, status, appointment_date, staff_offtime, student_note)
    VALUES (?, ?, ?, ?, ?, ?, ?)`

  db.query(sql, [user_id, category_id, student_email, status, appointment_date, staff_offtime, student_note], (err, result) => {
    if (err) {
      console.error('SQL Error:', err)
      return res.status(500).json({ error: 'Database insert failed' })
    }

    res.json({ success: true, appointmentId: result.insertId })
  });
});


// check status
// router.get('/appointments', (req, res) => {
//   const jwt = require('jsonwebtoken')
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY) // ใช้ secret เดียวกับตอน login
//     const userId = decoded.user_id

//     const sql = 'SELECT * FROM appointment WHERE user_id = ? ORDER BY appointment_date DESC'
//     db.query(sql, [userId], (err, results) => {
//       if (err) {
//         console.error('DB error:', err)
//         return res.status(500).json({ success: false, message: 'Database error' })
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ success: false, message: 'No appointment found' })
//       }

//       res.json({ success: true, appointments: results })
//     })
//   } catch (err) {
//     console.error('JWT error:', err)
//     res.status(403).json({ success: false, message: 'Invalid or expired token' })
//   }
// })

// history 
// router.get('/history', authMiddleware, (req, res) => {
//   const studentId = req.user.id || req.user.user_id; // ✅ รองรับทั้ง 2 แบบเผื่อ token ต่างเวอร์ชัน
//   console.log('📥 Student ID from token:', studentId);

//   if (!studentId) {
//     return res.status(400).json({ success: false, message: 'User ID not found in token' });
//   }

//   const sql = `
//     SELECT 
//       a.appointment_date, 
//       a.category_id, 
//       c.type AS topic,
//       a.status,
//       a.student_note
//     FROM appointment AS a
//     JOIN categories AS c ON a.category_id = c.category_id
//     WHERE a.user_id = ?
//     ORDER BY a.appointment_date DESC
//   `;

//   db.query(sql, [studentId], (err, results) => {
//     if (err) {
//       console.error('🔥 SQL error (history):', err);
//       return res.status(500).json({ success: false, message: 'Database error' });
//     }

//     if (results.length === 0) {
//       console.warn('⚠️ No history found for user:', studentId);
//       return res.status(404).json({ success: false, message: 'No history found' });
//     }

//     console.log('✅ Results from JOIN (history):', results);
//     res.json({ success: true, historyItems: results });
//   });
// });

//-------------------------------------- Student Documents ----------------------------------------

router.post(
    '/documents',
    authMiddleware,
    upload.single('document_image'), // <-- เพิ่ม Middleware ของ Multer
    (req, res) => {
      console.log('📩 Hit /documents (with file upload)')
      console.log('✅ Received body (text data):', req.body) // <-- ข้อมูล text
      console.log('✅ Received file (image data):', req.file) // <-- ข้อมูลไฟล์

      const {
        user_id,
        category_id,
        student_email,
        submit_date,
        finish_date,
        student_note,
        status,
      } = req.body // <-- ดึงข้อมูล text จาก req.body

      // (เช็ค req.body เหมือนเดิม)
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' })
      }
      if (!student_note) {
        return res
          .status(400)
          .json({ error: 'student_note (sub_topic) is required' })
      }

      // ✅ 4. เช็คว่ามีไฟล์ถูกอัปโหลดมาหรือไม่
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'document_image (file) is required' })
      }

      // ✅ 5. ดึง path ของไฟล์ (จากรูปที่คุณส่งมา คุณใช้ "image_path")
      const imagePath = req.file.path

      // ✅ 6. อัปเดต SQL ให้มี `image_path`
      const sql = `INSERT INTO document_tracking
        (user_id, category_id, student_email, status, submit_date, finish_date, student_note, image_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

      const params = [
        user_id,
        category_id,
        student_email,
        status,
        submit_date,
        finish_date,
        student_note,
        imagePath, // <-- เพิ่ม imagePath เข้าไป
      ]

      db.query(sql, params, (err, result) => {
        if (err) {
          console.error('SQL Error:', err)
          return res.status(500).json({ error: 'Database insert failed' })
        }

        // ✅ 7. ส่ง "document_id" กลับไปให้ Frontend
        // (สำคัญมากสำหรับ Modal ที่แสดง ID)
        res.json({
          success: true,
          message: 'Document created',
          document_id: result.insertId, // <-- ส่ง ID ที่เพิ่งสร้างกลับไป
        })
      })
    }
  )
// router.post('/documents', authMiddleware, (req, res) => {
//   console.log('📩 Hit /documents')
//   console.log('✅ Received body:', req.body)
//   const {
//     user_id,
//     category_id,
//     student_email,
//     submit_date,
//     finish_date,
//     student_note,
//     status
//   } = req.body;

//   if (!user_id) {
//     return res.status(400).json({ error: 'user_id is required' });
//   }
// if (!req.body) {
//   return res.status(400).json({ error: 'Request body is missing' })
// }

//   const sql = `INSERT INTO document_tracking
//     (user_id, category_id, student_email, status, submit_date, finish_date, student_note)
//     VALUES (?, ?, ?, ?, ?, ?, ?)`

//   db.query(sql, [user_id, category_id, student_email, status, submit_date, finish_date, student_note], (err, result) => {
//     if (err) {
//       console.error('SQL Error:', err)
//       return res.status(500).json({ error: 'Database insert failed' })
//     }

//     res.json({ success: true, message: 'Document created', data: { user_id } })
//   });
// });
// ===============================================================
// 📘 GET /student/categories-with-staff
// ดึงรายชื่อหมวดหมู่ + เจ้าหน้าที่ที่รับผิดชอบแต่ละหมวด
// ===============================================================
router.get('/categories-with-staff', (req, res) => {
  const sql = `
    SELECT 
      c.category_id,
      c.type,
      CONCAT(u.name, ' ', u.surname) AS staff_name
    FROM categories c
    LEFT JOIN user_category uc ON c.category_id = uc.category_id
    LEFT JOIN user u ON uc.user_id = u.user_id AND u.role = 2
    ORDER BY c.category_id;
  `
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Error fetching categories-with-staff:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
    console.log('✅ categories-with-staff count:', rows.length)
    res.json(rows)
  })
})

//----------------------------------- chack status of documents ----------------------------------------
router.get('/api/documents/:studentId', (req, res) => {
  const studentId = req.params.studentId

  const sql = `
  SELECT 
    d.document_id, 
    c.type AS doc_title,         
    d.submit_date, 
    d.status,
    d.student_note,
    d.finish_date,
    f.comment AS feedback         -- ✅ เปลี่ยนจาก f.feedback เป็น f.comment
  FROM document_tracking d
  LEFT JOIN categories c ON d.category_id = c.category_id
  LEFT JOIN feedback_document_tracking f ON f.document_id = d.document_id
  WHERE d.user_id = ?
`


  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
    res.json(results)
  })
})

// ----------------------------------------- history document-----------------------------------------
router.get('/document/history', authMiddleware, (req, res) => {
  const studentId = req.user.user_id
  console.log('📥 Student ID from token:', studentId)

  const sql = `
    SELECT d.*, c.type AS category_name
    FROM document_tracking d
    JOIN categories c ON d.category_id = c.category_id
    WHERE d.user_id = ?
    ORDER BY d.submit_date DESC
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('❌ SQL Error:', err);
      return res.status(500).json({ success: false, message: 'Query failed' });
    }

    res.json({ success: true, documents: results });
  });
});
// -------------------------------------- Feedback Appointment -----------------------------------------
// ไว้บนสุดของไฟล์ 
// helper: สถานะที่ถือว่าอนุมัติ (เปลี่ยนได้ตามระบบคุณ)
const APPROVED_STATUSES = [1]; // เช่น 1 = Approved
function buildInPlaceholders(arr){ return arr.map(()=>'?').join(','); }
function parseApprovedSet(req){
  const raw = (req.query.approved_set || '').toString().trim();
  if (!raw) return APPROVED_STATUSES;
  const nums = raw.split(',').map(s => Number(s)).filter(Number.isInteger);
  return nums.length ? nums : APPROVED_STATUSES;
}

// function parseApprovedSet(req) {
//   const raw = (req.query.approved_set || '').toString().trim();
//   if (!raw) return APPROVED_STATUSES;
//   const nums = raw.split(',').map(s => Number(s)).filter(n => Number.isInteger(n));
//   return nums.length ? nums : APPROVED_STATUSES;
// }

router.get('/appointments_ALL', (req, res) => {
  const sql = `
    SELECT 
      a.appointment_id AS id,
      DATE(a.appointment_date) AS date,
      TIME(a.appointment_date) AS time,
      a.student_note AS note,
      c.type AS topic,
      'Appointments' AS category,
      a.status
    FROM appointment a
    LEFT JOIN categories c ON c.category_id = a.category_id
    LEFT JOIN feedback_appointment f ON f.appointment_id = a.appointment_id
    WHERE f.appointment_id IS NULL
      AND UPPER(TRIM(a.status)) IN ('APPROVE','APPROVED','อนุมัติ')
    ORDER BY a.appointment_date DESC
  `
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching appointments:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(results)
  })
})
// ส่งข้อมูล feedback
router.post('/feedback/appointments', authMiddleware, (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'invalid_user_id' });
  }

  const { appointment_id, ratings, comment } = req.body;

  if (!appointment_id || !Array.isArray(ratings) || ratings.length < 3) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const sql = `
    INSERT INTO feedback_appointment
      (appointment_id, score_count1, score_count2, score_count3, comment, created_at)
    VALUES (?, ?, ?, ?, '', NOW())
  `;

  const params = [appointment_id, ratings[0], ratings[1], ratings[2], comment || null];

  db.query(sql, params, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Feedback already exists' });
      }
      console.error('❌ Error inserting feedback:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, id: result.insertId });
  });
});


// 🔎 ดึงรายการเดียวเพื่อให้คะแนน (ต้อง Approve และยังไม่มี feedback)
// FE: GET /student/users/10/appointments/for-feedback?approved_set=1
router.get('/appointments/for-feedback', authMiddleware, (req, res) => { 
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'invalid_user_id' });
  }

  const sql = `
  SELECT 
    a.appointment_id AS id, 
    a.appointment_date AS date, 
    COALESCE(c.type, 'Unknown') AS topic, 
    a.student_note AS note
  FROM appointment a
  LEFT JOIN categories c ON c.category_id = a.category_id
  LEFT JOIN feedback_appointment f ON f.appointment_id = a.appointment_id  -- ✅ ต้องมี
  WHERE a.user_id = ?
    AND a.status = 1
    AND f.appointment_id IS NULL
  ORDER BY a.appointment_date DESC
`;
;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('❌ fetch appointments error:', err);
      return res.status(500).json({ success: false, message: 'db_error' });
    }
    res.json({ success: true, items: rows });
  });
});


// GET /api/appointment/:id/for-feedback
router.get('/appointment/:id/for-feedback', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ found: false, reason: 'invalid_id' });

  const sql = `
    SELECT 
      a.appointment_id AS id,
      DATE(a.appointment_date) AS date,
      TIME(a.appointment_date) AS time,
      a.student_note AS note,
      c.type AS topic,
      'Appointments' AS category,
      a.status,
      CASE WHEN f.appointment_id IS NULL THEN 0 ELSE 1 END AS has_feedback
    FROM appointment a
    LEFT JOIN categories c ON c.category_id = a.category_id
    LEFT JOIN feedback_appointment f ON f.appointment_id = a.appointment_id
    WHERE a.appointment_id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching appointment by id:', err);
      return res.status(500).json({ found: false, reason: 'db_error' });
    }
    if (!rows || rows.length === 0) {
      return res.json({ found: false, reason: 'not_found' });
    }

    const row = rows[0];
    if (Number(row.has_feedback) === 1) {
      return res.json({ found: false, reason: 'already_feedback' });
    }

    const approvedSet = parseApprovedSet(req);
    if (!approvedSet.includes(Number(row.status))) {
      return res.json({ found: false, reason: 'not_approved', status: row.status, approved_set: approvedSet });
    }

    return res.json({
      found: true,
      appointment: {
        id: row.id,
        date: row.date || null,
        time: row.time || null,
        note: row.note || '',
        topic: row.topic || 'Unknown',
        category: 'Appointments',
        status: row.status
      }
    });
  });
});

// ✅ GET: ดึงหัวข้อของ user
// ✅ GET: ดึงเฉพาะหัวข้อของ appointment ที่อนุมัติแล้วและยังไม่มี feedback
router.get('/appointment-topics', authMiddleware, (req, res) => {
  const userId = req.user.user_id || req.user.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'invalid_user_id' });
  }

  const sql = `
    SELECT DISTINCT COALESCE(c.type, 'Unknown') AS topic
    FROM appointment a
    LEFT JOIN categories c ON c.category_id = a.category_id
    LEFT JOIN feedback_appointment f ON f.appointment_id = a.appointment_id
    WHERE a.user_id = ?
      AND a.status = 1
      AND f.appointment_id IS NULL   -- ✅ ยังไม่มี feedback
    ORDER BY topic;
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('❌ fetch appointment topics error:', err);
      return res.status(500).json({ success: false, message: 'db_error' });
    }

    if (!rows.length) {
      return res.json({ success: false, message: 'Not found' });
    }

    res.json({
      success: true,
      topics: rows.map(r => r.topic).filter(Boolean),
    });
  });
});


// -----------------------------------Feedback Document -----------------------------------------
// GET: ดึงเอกสารทั้งหมดที่ยังไม่มี feedback และอนุมัติแล้ว
router.get('/documents_ALL', authMiddleware, (req, res) => {
  const sql = `
    SELECT 
      d.document_id AS id,
      DATE(d.finish_date) AS date,
      d.student_note AS note,
      c.type AS topic,
      'Documents' AS category,
      d.status
    FROM document_tracking d
    LEFT JOIN categories c ON c.category_id = d.category_id
    LEFT JOIN feedback_document_tracking f ON f.document_id = d.document_id
    WHERE f.document_id IS NULL
      AND UPPER(TRIM(d.status)) IN ('APPROVE','APPROVED','อนุมัติ')
    ORDER BY d.finish_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching documents:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(results)
  })
})

// POST: ส่ง feedback สำหรับเอกสาร
router.post('/feedback/documents', authMiddleware, (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(400).json({ success: false, message: 'invalid_user_id' });

  const { document_id, ratings, comment } = req.body;
  if (!document_id || !Array.isArray(ratings) || ratings.length < 3) {
    return res.status(400).json({ success: false, message: 'Invalid payload' })
  }

  const sql = `
    INSERT INTO feedback_document_tracking
      (document_id, score_count1, score_count2, score_count3, comment, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `

  const params = [document_id, ratings[0], ratings[1], ratings[2], comment || '']

//   const updateSql = 'UPDATE documents SET feedback_status = 1 WHERE document_id = ?';
// db.query(updateSql, [req.body.document_id]);
  db.query(sql, params, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Feedback already exists' })
      }
      console.error('❌ Error inserting feedback:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
    res.json({ success: true, id: result.insertId })
  })
})

// GET: ดึงเอกสารของ user สำหรับให้ feedback (เฉพาะที่อนุมัติและยังไม่มี feedback)
// GET /student/documents/for-feedback
router.get('/documents/for-feedback', authMiddleware, (req, res) => { 
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'invalid_user_id' });
  }

  const sql = `
    SELECT 
      d.document_id AS id, 
      DATE(d.finish_date) AS date, 
      COALESCE(c.type, 'Unknown') AS topic, 
      d.student_note AS note,
      CASE WHEN f.document_id IS NULL THEN 0 ELSE 1 END AS has_feedback  -- ✅ flag
    FROM document_tracking d
    LEFT JOIN categories c ON c.category_id = d.category_id
    LEFT JOIN feedback_document_tracking f ON f.document_id = d.document_id  -- ✅ ต้องมี join
    WHERE d.user_id = ?
      AND d.status = 2              -- ✅ 2 = อนุมัติแล้ว
      AND f.document_id IS NULL     -- ✅ ยังไม่มี feedback
    ORDER BY d.finish_date DESC
  
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('❌ fetch documents error:', err);
      return res.status(500).json({ success: false, message: 'db_error' });
    }

    res.json({ success: true, items: rows });
  });
});

// GET: ดึงเอกสารโดย id สำหรับให้ feedback
router.get('/documents/:id/for-feedback', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ found: false, reason: 'invalid_id' });

  const sql = `
    SELECT 
      d.document_id AS id,
      DATE(d.finish_date) AS date,
      d.student_note AS note,
      c.type AS topic,
      'Documents' AS category,
      d.status,
      CASE WHEN f.document_id IS NULL THEN 0 ELSE 2 END AS has_feedback
    FROM document_tracking d
    LEFT JOIN categories c ON c.category_id = d.category_id
    LEFT JOIN feedback_document_tracking f ON f.document_id = d.document_id
    WHERE d.document_id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching document by id:', err);
      return res.status(500).json({ found: false, reason: 'db_error' });
    }
    if (!rows || rows.length === 0) return res.json({ found: false, reason: 'not_found' });

    const row = rows[0];
    if (Number(row.has_feedback) === 1) return res.json({ found: false, reason: 'already_feedback' });

    const approvedSet = parseApprovedSet(req);
    if (!approvedSet.includes(Number(row.status))) {
      return res.json({ found: false, reason: 'not_approved', status: row.status, approved_set: approvedSet });
    }

    return res.json({
      found: true,
      document: {
        id: row.id,
        date: row.date || null,
        note: row.note || '',
        topic: row.topic || 'Unknown',
        category: 'Documents',
        status: row.status
      }
    });
  });
});

// GET: ดึงหัวข้อของ user สำหรับเอกสาร
// GET /student/document-topics
//หัวข้อ drop-down ในหน้าทำแบบประเมิน แสดงเฉพาะหัวข้อที่ยังไม่ได้ทำ
router.get('/document-topics', authMiddleware, (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'invalid_user_id' });
  }

  const sql = `
  SELECT DISTINCT COALESCE(c.type, 'Unknown') AS topic
  FROM document_tracking d
  LEFT JOIN categories c ON c.category_id = d.category_id
  LEFT JOIN feedback_document_tracking f ON f.document_id = d.document_id
  WHERE d.user_id = ?
    AND d.status = 2
    AND f.document_id IS NULL  
  ORDER BY topic;
`;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('❌ fetch document topics error:', err);
      return res.status(500).json({ success: false, message: 'db_error' });
    }

    if (!rows.length) {
      return res.json({ success: false, message: 'Not found' });
    }

    res.json({
      success: true,
      topics: rows.map(r => r.topic).filter(Boolean),
    });
  });
});




// ✅ GET: ดึงหัวข้อของ user สำหรับเอกสารทั้งหมด (ไม่จำกัดว่ามี feedback แล้วหรือยัง)
//  อันนี้จะค้างหัวข้อที่เคยทำรายการไว้ แม้จะทำแบบประเมินไปแล้ว
// router.get('/document-topics', authMiddleware, (req, res) => {
//   const userId = req.user.id;
//   if (!userId) {
//     return res.status(400).json({ success: false, message: 'invalid_user_id' });
//   }

//   const sql = `
//     SELECT DISTINCT COALESCE(c.type, 'Unknown') AS topic
//     FROM document_tracking d
//     LEFT JOIN categories c ON c.category_id = d.category_id
//     WHERE d.user_id = ?
//       AND d.status = 2    -- ✅ เฉพาะเอกสารที่อนุมัติแล้ว
//     ORDER BY topic;
//   `;

//   db.query(sql, [userId], (err, rows) => {
//     if (err) {
//       console.error('❌ fetch document topics error:', err);
//       return res.status(500).json({ success: false, message: 'db_error' });
//     }

//     if (!rows.length) {
//       return res.json({ success: false, message: 'Not found' });
//     }

//     res.json({
//       success: true,
//       topics: rows.map(r => r.topic).filter(Boolean),
//     });
//   });
// });


return router
}