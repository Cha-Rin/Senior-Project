const express = require('express')
const authMiddleware = require('../middleware/auth') ;
const multer = require('multer')
const path = require('path')
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

const APPROVED_STATUSES = [1, 2]; // ✅ เพิ่ม 2 = 'Complete' สำหรับเอกสาร
function buildInPlaceholders(arr){ return arr.map(()=>'?').join(','); }
function parseApprovedSet(req){
const raw = (req.query.approved_set || '').toString().trim();
if (!raw) return APPROVED_STATUSES;
const nums = raw.split(',').map(s => Number(s)).filter(Number.isInteger);
return nums.length ? nums : APPROVED_STATUSES;
}
const upload = multer({ storage: storage })
module.exports = (db) => {
  const router = express.Router()
   router.use((req, res, next) => {
    if (req.method === 'POST') {
      console.log('🔎 POST', req.originalUrl)
      console.log('🔎 content-type:', req.headers['content-type'])
      console.log('🔎 body:', req.body)
    }
    next()
  })
  
// -----------------------------------------------------
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