const express = require('express')
const authMiddleware = require('../middleware/auth') ;
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
const APPROVED_STATUSES = [1, 2]; // ✅ เพิ่ม 2 = 'Complete' สำหรับเอกสาร
function buildInPlaceholders(arr){ return arr.map(()=>'?').join(','); }
function parseApprovedSet(req){
const raw = (req.query.approved_set || '').toString().trim();
if (!raw) return APPROVED_STATUSES;
const nums = raw.split(',').map(s => Number(s)).filter(Number.isInteger);
return nums.length ? nums : APPROVED_STATUSES;
}
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


  // prefix สำหรับแต่ละ category_id
const DOC_PREFIX = {
  1: "A",  // กิจกรรมนักศึกษา
  2: "C",  // สหกิจศึกษา
  3: "P",  // ผ่อนผัน
  4: "R",  // งานทะเบียน
  5: "B"   // บัณฑิตศึกษา
};

// ฟังก์ชันสร้าง document_code
function generateDocumentCode(db, category_id, callback) {
  const prefix = DOC_PREFIX[category_id] || "X";

  const sql = `
    SELECT document_code 
    FROM document_tracking
    WHERE category_id = ?
      AND document_code LIKE '${prefix}%'
    ORDER BY document_id DESC
    LIMIT 1
  `;

  db.query(sql, [category_id], (err, rows) => {
    if (err) return callback(err);

    let nextNumber = 1;

    if (rows.length > 0 && rows[0].document_code) {
      const lastCode = rows[0].document_code;   // เช่น R07
      const lastNum = parseInt(lastCode.replace(prefix, ""), 10);
      nextNumber = lastNum + 1;
      if (nextNumber > 99) nextNumber = 1;      // RESET
    }

    const newCode = prefix + String(nextNumber).padStart(2, "0");
    callback(null, newCode);
  });
}


router.post('/documents/create', authMiddleware, upload.none(), (req, res) => {
  const { user_id, category_id, student_email, status, submit_date, student_note } = req.body;

  generateDocumentCode(db, category_id, (err, documentCode) => {
    if (err) return res.status(500).json({ success: false, message: "Generate code failed" });

    const sql = `
      INSERT INTO document_tracking
        (user_id, category_id, student_email, status, submit_date, student_note, document_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql,
      [user_id, category_id, student_email, status, submit_date, student_note, documentCode],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database insert failed" });

        res.json({
          success: true,
          document_id: result.insertId,
          document_code: documentCode
        });
      }
    );
  });
});


// -------------------------------------Student Appointment ----------------------------------------
router.post('/appointments', (req, res) => {
  console.log('✅ Received body:', req.body);

  const {
    user_id,
    category_id,
    student_email,
    appointment_date,
    student_note,
    status
  } = req.body;

  // สำหรับนักเรียนที่ไม่ได้ส่ง staff_offtime
  const staff_offtime = req.body.staff_offtime || 'N/A';

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const sql = `INSERT INTO appointment
    (user_id, category_id, student_email, status, appointment_date, staff_offtime, student_note)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [user_id, category_id, student_email, status, appointment_date, staff_offtime, student_note], (err, result) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    res.json({ success: true, appointmentId: result.insertId });
  });
});

// ===============================================================
// 📘 GET /student/categories-with-staff
// ดึงรายชื่อหมวดหมู่ + เจ้าหน้าที่ที่รับผิดชอบแต่ละหมวด
// ===============================================================
router.get('/categories-with-staff', (req, res) => {
  const sql = `
    SELECT 
      c.category_id,
      c.type,
      u.user_id,
      CONCAT(u.name, ' ', u.surname) AS staff_name,
      u.profile_pic AS profile_image
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

// -------------------------------------- Feedback Appointment -----------------------------------------

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
    AND a.status = 3
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
      AND a.status = 3
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


// ⭐ GET: จำนวน feedback ที่ยังไม่ได้ทำทั้งหมด
// (ลบโค้ดเวอร์ชันเก่าที่ comment ไว้ออกไปได้เลย)

// ⭐ GET: จำนวน feedback ที่ยังไม่ได้ทำทั้งหมด
router.get('/feedback/pending', authMiddleware, (req, res) => {
  const userId = req.user.user_id || req.user.id;

  if (!userId) {
    return res.json({ count: 0, appointments: [], documents: [] });
  }

  // ดึง appointments ที่ยังไม่มี feedback
  const sqlAppointments = `
    SELECT 
      a.appointment_id AS id,
      a.appointment_date AS date,
      a.student_note AS note,
      COALESCE(c.type, 'Appointment') AS topic,
      a.status
    FROM appointment a
    LEFT JOIN categories c ON c.category_id = a.category_id
    LEFT JOIN feedback_appointment f ON f.appointment_id = a.appointment_id
    WHERE a.user_id = ?
      AND a.status = 3
      AND f.appointment_id IS NULL
    ORDER BY a.appointment_date DESC
  `;

  // ดึง documents ที่ยังไม่มี feedback
  const sqlDocuments = `
    SELECT 
      d.document_id AS id,
      d.finish_date AS date,
      d.student_note AS note,
      COALESCE(c.type, 'Document') AS topic,
      d.status
    FROM document_tracking d
    LEFT JOIN categories c ON c.category_id = d.category_id
    LEFT JOIN feedback_document_tracking f ON f.document_id = d.document_id
    WHERE d.user_id = ?
      AND d.status = 2
      AND f.document_id IS NULL
    ORDER BY d.submit_date DESC
  `;

  db.query(sqlAppointments, [userId], (err1, appointments) => {
    if (err1) {
      console.error('SQL Error (Appointments):', err1);
      return res.status(500).json({ success: false, message: 'Database error on appointments' });
    }

    db.query(sqlDocuments, [userId], (err2, documents) => {
      if (err2) {
        console.error('SQL Error (Documents):', err2);
        return res.status(500).json({ success: false, message: 'Database error on documents' });
      }

      res.json({
        count: (appointments?.length || 0) + (documents?.length || 0),
        appointments: appointments || [],
        documents: documents || []
      });
    });
  });
});

//-------------------------------------- Student Documents ----------------------------------------
  router.post(
    '/documents',
    authMiddleware,
    upload.single('photo'),
    (req, res) => {
      console.log('📩 Hit /documents (with file upload)')
      console.log('✅ Received body (text data):', req.body)
      console.log('✅ Received file (image data):', req.file)

      const {
        user_id,
        category_id,
        student_email,
        submit_date,
        finish_date,
        student_note,
        status,
      } = req.body

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' })
      }
      if (!student_note) {
        return res
          .status(400)
          .json({ error: 'student_note (sub_topic) is required' })
      }
      if (!req.file) {
        return res.status(400).json({ error: 'photo (file) is required' })
      }

      const imagePath = req.file.path

      const sql = `
        INSERT INTO document_tracking
          (user_id, category_id, student_email, status, submit_date, finish_date, student_note, image_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
      const params = [
        user_id,
        category_id,
        student_email,
        status,
        submit_date,
        finish_date,
        student_note,
        imagePath,
      ]

      db.query(sql, params, (err, result) => {
        if (err) {
          console.error('❌ SQL Error:', err)
          return res.status(500).json({ error: 'Database insert failed' })
        }

        console.log('✅ Document inserted, ID:', result.insertId)
        res.json({
          success: true,
          message: 'Document created',
          document_id: result.insertId,
        })
      })
    }
  )

  // ⭐ CREATE document (no image yet)
// router.post('/documents/create', authMiddleware, upload.none(), (req, res) => {
//   const { user_id, category_id, student_email, status, submit_date, student_note } = req.body;

//   const sql = `
//     INSERT INTO document_tracking
//       (user_id, category_id, student_email, status, submit_date, student_note)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;

//   db.query(sql,
//     [user_id, category_id, student_email, status, submit_date, student_note],
//     (err, result) => {
//       if (err) return res.status(500).json({ success: false });
//       res.json({ success: true, document_id: result.insertId });
//     }
//   );
// });



// ⭐ UPLOAD photo to existing document
router.post('/documents/upload', authMiddleware, upload.single('photo'), (req, res) => {
  const { document_id } = req.body;
  const imagePath = req.file.path;

  const sql = `UPDATE document_tracking SET image_path = ? WHERE document_id = ?`;

  db.query(sql, [imagePath, document_id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});



  //----------------------------------- Check status of documents ----------------------------------------
  router.get('/documents/:studentId', (req, res) => {
    const studentId = req.params.studentId

    const sql = `
      SELECT 
        d.document_id, 
        c.type AS doc_title,         
        d.submit_date, 
        d.status,
        d.student_note,
        d.finish_date,
        d.image_path,
        f.comment AS feedback
      FROM document_tracking d
      LEFT JOIN categories c ON d.category_id = c.category_id
      LEFT JOIN feedback_document_tracking f ON f.document_id = d.document_id
      WHERE d.user_id = ?
      ORDER BY d.submit_date DESC
    `

    db.query(sql, [studentId], (err, results) => {
      if (err) {
        console.error('🔥 Database error:', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }
      const formatted = results.map((row) => {
        let imagePath = row.image_path ? row.image_path.replace(/\\/g, '/') : null
        if (imagePath && !imagePath.startsWith('uploads/documents/')) {
          imagePath = `uploads/documents/${imagePath}`
        }
        return { ...row, image_path: imagePath }
      })
      res.json(formatted)
    })
  })

 
  //----------------------------------- Feedback Document -----------------------------------------
  router.get('/documents/for-feedback/:userId', authMiddleware, (req, res) => {
    const userId = req.user.id || req.user.user_id
    if (!userId) {
      return res.status(400).json({ success: false, message: 'invalid_user_id' })
    }

    const sql = `
      SELECT 
        d.document_id AS id, 
        d.student_note AS note, 
        d.finish_date AS date, 
        COALESCE(c.type, 'Unknown') AS topic, 
        d.status , 
        'Documents' AS category
      FROM document_tracking d
      LEFT JOIN categories c ON c.category_id = d.category_id
      WHERE d.status = 2
        AND NOT EXISTS (
          SELECT 1 FROM feedback_document_tracking f WHERE f.document_id = d.document_id
        )
      ORDER BY d.submit_date DESC
    `
    db.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error('❌ SQL error (for-feedback):', err)
        return res.status(500).json({ success: false, message: 'Database error' })
      }
      res.json({ success: true, items: rows || [] })
    })
  })

  // POST: ส่ง feedback สำหรับเอกสาร
  router.post('/feedback/documents', authMiddleware, express.json(), (req, res) => {
    const userId = req.user.id
    if (!userId) return res.status(400).json({ success: false, message: 'invalid_user_id' })

    const { document_id, ratings, comment } = req.body
    if (!document_id || !Array.isArray(ratings) || ratings.length < 3) {
      return res.status(400).json({ success: false, message: 'Invalid payload' })
    }

    const sql = `
      INSERT INTO feedback_document_tracking
        (document_id, score_count1, score_count2, score_count3, comment, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `
    const params = [document_id, ratings[0], ratings[1], ratings[2], comment || '']
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

  // GET: ดึงเอกสารโดย id สำหรับให้ feedback
  router.get('/documents/:id/for-feedback', authMiddleware, (req, res) => {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ found: false, reason: 'invalid_id' })

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
    `

    db.query(sql, [id], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching document by id:', err)
        return res.status(500).json({ found: false, reason: 'db_error' })
      }
      if (!rows || rows.length === 0) return res.json({ found: false, reason: 'not_found' })

      const row = rows[0]
      if (Number(row.has_feedback) === 1)
        return res.json({ found: false, reason: 'already_feedback' })

      const approvedSet = parseApprovedSet(req)
      if (!approvedSet.includes(Number(row.status))) {
        return res.json({
          found: false,
          reason: 'not_approved',
          status: row.status,
          approved_set: approvedSet,
        })
      }

      return res.json({
        found: true,
        document: {
          id: row.id,
          date: row.date || null,
          note: row.note || '',
          topic: row.topic || 'Unknown',
          category: 'Documents',
          status: row.status,
        },
      })
    })
  })

  // GET: ดึงหัวข้อของ user สำหรับเอกสาร
  router.get('/document-topics', authMiddleware, (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'invalid_user_id' });
  }

  const sql = `
    SELECT DISTINCT COALESCE(c.type, 'Unknown') AS topic
    FROM document_tracking d
    LEFT JOIN categories c ON c.category_id = d.category_id
    WHERE d.user_id = ?
      AND d.status = 2    -- ✅ เฉพาะเอกสารที่อนุมัติแล้ว
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
return router
}