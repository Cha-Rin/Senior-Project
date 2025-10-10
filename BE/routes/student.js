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
router.get('/appointments/id/:id', (req, res) => {
  const id = req.params.id
  const sql = 'SELECT * FROM appointment WHERE user_id = ? ORDER BY appointment_date DESC'
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No appointment found' })
    }

    res.json({ success: true, appointments: results }) 
  })
})

// history 
router.get('/history', authMiddleware, (req, res) => {
  const studentId = req.user.id; // ✅ ดึงจาก token แทน req.params
  console.log('📥 Student ID from token:', studentId);

  const sql = `
    SELECT a.appointment_date, a.category_id, c.type AS topic
    FROM appointment AS a
    JOIN categories AS c ON a.category_id = c.id
    WHERE a.user_id = ?
    ORDER BY a.appointment_date DESC
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('🔥 SQL error:', err);
      return res.status(500).json({ success: false });
    }

    console.log('✅ Results from JOIN:', results);
    res.json({ success: true, historyItems: results });
  });
});
//-------------------------------------- Student Documents ----------------------------------------
router.post('/documents', authMiddleware, (req, res) => {
  console.log('📩 Hit /documents')
  console.log('✅ Received body:', req.body)
  const {
    user_id,
    category_id,
    student_email,
    submit_date,
    finish_date,
    student_note,
    status
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
if (!req.body) {
  return res.status(400).json({ error: 'Request body is missing' })
}

  const sql = `INSERT INTO document_tracking
    (user_id, category_id, student_email, status, submit_date, finish_date, student_note)
    VALUES (?, ?, ?, ?, ?, ?, ?)`

  db.query(sql, [user_id, category_id, student_email, status, submit_date, finish_date, student_note], (err, result) => {
    if (err) {
      console.error('SQL Error:', err)
      return res.status(500).json({ error: 'Database insert failed' })
    }

    res.json({ success: true, message: 'Document created', data: { user_id } })
  });
});
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
router.get('/api/document/history/:studentId', (req, res) => {
  const studentId = req.params.studentId;

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

router.post('/feedback/appointments', (req, res) => {
  const { appointment_id, ratings, comment } = req.body
  if (!appointment_id || !Array.isArray(ratings) || ratings.length < 3) {
    return res.status(400).json({ success: false, message: 'Invalid payload' })
  }

  const sql = `
    INSERT INTO feedback_appointment
      (appointment_id, score_count1, score_count2, score_count3, comment, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `
  const params = [appointment_id, ratings[0], ratings[1], ratings[2], comment || null]

  db.query(sql, params, (err, result) => {
    if (err) {
      // ถ้าใส่ซ้ำเพราะ UNIQUE
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Feedback already exists' })
      }
      console.error('❌ Error inserting feedback:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
    res.json({ success: true, id: result.insertId })
  })
})

// 🔎 ดึงรายการเดียวเพื่อให้คะแนน (ต้อง Approve และยังไม่มี feedback)
// FE: GET /student/users/10/appointments/for-feedback?approved_set=1
router.get('/users/:userId/appointments/for-feedback', (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ success: false, message: 'invalid_user_id' });

  const approvedSet = parseApprovedSet(req); // รองรับ ?approved_set=1,2
  const placeholders = buildInPlaceholders(approvedSet);

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
    WHERE a.user_id = ?
      AND f.appointment_id IS NULL
      AND a.status IN (${placeholders})
    ORDER BY a.appointment_date DESC
  `;
  db.query(sql, [userId, ...approvedSet], (err, rows) => {
    if (err) {
      console.error('❌ fetch user appointments error:', err);
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
// /api/users/:userId/appointment-topics
// - default: scope=all (ดึงทุกหัวข้อของ user)
// - optional: scope=pending (เฉพาะนัดที่อนุมัติ+ยังไม่มี feedback)
router.get('/users/:userId/appointment-topics', (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ success:false, message:'invalid_user_id' });

  const scope = (req.query.scope || 'all').toString().toLowerCase();
  const approvedSet = parseApprovedSet(req);
  const placeholders = buildInPlaceholders(approvedSet);

  const base = `
    FROM appointment a
    LEFT JOIN categories c ON c.category_id = a.category_id
    ${scope === 'pending' ? 'LEFT JOIN feedback_appointment f ON f.appointment_id = a.appointment_id' : ''}
    WHERE a.user_id = ?
    ${scope === 'pending' ? `AND f.appointment_id IS NULL AND a.status IN (${placeholders})` : ''}
  `;

  const sql = `
    SELECT DISTINCT COALESCE(c.type, 'Unknown') AS topic
    ${base}
    ORDER BY topic
  `;

  const params = scope === 'pending' ? [userId, ...approvedSet] : [userId];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ fetch topics error:', err);
      return res.status(500).json({ success:false, message:'db_error' });
    }
    res.json({ success:true, topics: rows.map(r => r.topic).filter(Boolean) });
  });
});

// -----------------------------------Feedback Document -----------------------------------------
router.post('/feedback/documents', (req, res) => {
const sql = `
    SELECT 
      a.document_id AS id,
      a.student_note AS note,
      a.finish_date AS date,
      c.type AS topic,
      'Documents' AS category,
      a.status
    FROM document_tracking a
    LEFT JOIN categories c ON c.category_id = a.category_id
    LEFT JOIN feedback_document_tracking f ON f.document_id = a.document_id
    WHERE f.document_id IS NULL
      AND UPPER(TRIM(a.status)) IN ('APPROVE','APPROVED','อนุมัติ')
      ORDER BY a.finish_date DESC
  `
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching document:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(results)
  })
})

router.post('/feedback/documents', (req, res) => {
  const { document_id, ratings, comment } = req.body
  if (!document_id || !Array.isArray(ratings) || ratings.length < 3) {
    return res.status(400).json({ success: false, message: 'Invalid payload' })
  }

  const sql = `
    INSERT INTO feedback_document_tracking
      (document_id, score_count1, score_count2, score_count3, comment, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `
  const params = [document_id, ratings[0], ratings[1], ratings[2], comment || null]

  db.query(sql, params, (err, result) => {
    if (err) {
      // ถ้าใส่ซ้ำเพราะ UNIQUE
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Feedback already exists' })
      }
      console.error('❌ Error inserting feedback:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }
    res.json({ success: true, id: result.insertId })
  })
})


// 🔎 ดึงรายการเดียวเพื่อให้คะแนน (ต้อง Approve และยังไม่มี feedback)
// FE: GET /student/users/${userId}/document/for-feedback?approved_set=1
router.get('/users/:userId/documents/for-feedback', (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ success: false, message: 'invalid_user_id' });

  const approvedSet = parseApprovedSet(req); // รองรับ ?approved_set=1,2
  const placeholders = buildInPlaceholders(approvedSet);

  const sql = `
    SELECT 
      a.document_id AS id,
      DATE(a.finish_date) AS date,
      a.student_note AS note,
      c.type AS topic,
      'Documents' AS category,
      a.status
    FROM document_tracking a
    LEFT JOIN categories c ON c.category_id = a.category_id
    LEFT JOIN feedback_document_tracking f ON f.document_id = a.document_id
    WHERE a.user_id = ?
      AND f.document_id IS NULL
      AND a.status IN (${placeholders})
    ORDER BY a.finish_date DESC
  `;
  db.query(sql, [userId, ...approvedSet], (err, rows) => {
    if (err) {
      console.error('❌ fetch user documents error:', err);
      return res.status(500).json({ success: false, message: 'db_error' });
    }
    res.json({ success: true, items: rows });
  });
});

// GET /api/document/:id/for-feedback
router.get('/document/:id/for-feedback', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ found: false, reason: 'invalid_id' });

  const sql = `
    SELECT 
      a.document_id AS id,
      DATE(a.finish_date) AS date,
      a.student_note AS note,
      c.type AS topic,
      'Documents' AS category,
      a.status,
      CASE WHEN f.document_id IS NULL THEN 0 ELSE 1 END AS has_feedback
    FROM document_tracking a
    LEFT JOIN categories c ON c.category_id = a.category_id
    LEFT JOIN feedback_document_tracking f ON f.document_id = a.document_id
    WHERE a.document_id = ?
    LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching document by id:', err);
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

// ✅ GET: ดึงหัวข้อของ user
// - default: scope=all (ดึงทุกหัวข้อของ user)
// - optional: scope=pending (เฉพาะนัดที่อนุมัติ+ยังไม่มี feedback)
router.get('/users/:userId/document-topics', (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ success:false, message:'invalid_user_id' });

  const scope = (req.query.scope || 'all').toString().toLowerCase();
  const approvedSet = parseApprovedSet(req);
  const placeholders = buildInPlaceholders(approvedSet);

  const base = `
    FROM document_tracking a
    LEFT JOIN categories c ON c.category_id = a.category_id
    ${scope === 'pending' ? 'LEFT JOIN feedback_document_tracking f ON f.document_id = a.document_id' : ''}
    WHERE a.user_id = ?
    ${scope === 'pending' ? `AND f.document_id IS NULL AND a.status IN (${placeholders})` : ''}
  `;

  const sql = `
    SELECT DISTINCT COALESCE(c.type, 'Unknown') AS topic
    ${base}
    ORDER BY topic
  `;

  const params = scope === 'pending' ? [userId, ...approvedSet] : [userId];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ fetch topics error:', err);
      return res.status(500).json({ success:false, message:'db_error' });
    }
    res.json({ success:true, topics: rows.map(r => r.topic).filter(Boolean) });
  });
});

return router
}