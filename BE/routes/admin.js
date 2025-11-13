// admin.js
const express = require('express')
const path = require('path')

module.exports = (db) => {
  console.log('✅ Admin routes loaded successfully!')
  const router = express.Router()
  router.use(express.json())
  router.use(express.urlencoded({ extended: true }))
  
  // ✅ อนุญาต static file จาก uploads/
  router.use('/uploads', express.static(path.join(process.cwd(), 'uploads/')))

  // ---------------------- 📸 ตั้งค่า Upload ----------------------
  const multer = require('multer')

  // สร้าง storage แบบกำหนดชื่อไฟล์เอง
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads/'))
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, uniqueSuffix + path.extname(file.originalname))
    }
  })

  const upload = multer({ storage })

  // ============================================================
  // 🟢 1. ดึงรายชื่อ Staff ทั้งหมด + ค่าเฉลี่ยคะแนนรวม
  // ============================================================
  router.get('/staffs', (req, res) => {
    const sql = `
      SELECT 
        u.user_id AS id,
        u.name AS firstName,
        u.surname AS lastName,
        u.email,
        u.profile_pic AS avatar,
        u.status,
        GROUP_CONCAT(c.type SEPARATOR ', ') AS categories,

        -- 🎯 ค่าเฉลี่ยจาก appointment
        (
          SELECT ROUND(AVG((fa.score_count1 + fa.score_count2 + fa.score_count3) / 3), 2)
          FROM feedback_appointment fa
          JOIN appointment a ON fa.appointment_id = a.appointment_id
          WHERE a.category_id IN (
            SELECT category_id FROM user_category WHERE user_id = u.user_id
          )
        ) AS avg_appointment,

        -- 🎯 ค่าเฉลี่ยจาก document_tracking
        (
          SELECT ROUND(AVG((fd.score_count1 + fd.score_count2 + fd.score_count3) / 3), 2)
          FROM feedback_document_tracking fd
          JOIN document_tracking d ON fd.document_id = d.document_id
          WHERE d.category_id IN (
            SELECT category_id FROM user_category WHERE user_id = u.user_id
          )
        ) AS avg_document

      FROM user u
      LEFT JOIN user_category uc ON u.user_id = uc.user_id
      LEFT JOIN categories c ON uc.category_id = c.category_id
      WHERE u.role = 2
      GROUP BY u.user_id
    `

    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error fetching staffs:', err)
        return res.status(500).json({ success: false, error: err.message })
      }

      results.forEach((s) => {
        // ✅ แก้ไข: เปลี่ยนจาก /admin/uploads/ เป็น /uploads/
        if (s.avatar)
          s.avatar = `http://localhost:3000/uploads/${s.avatar}`
        else 
          s.avatar = 'http://localhost:3000/uploads/default.png'

        // ✅ แปลงเป็นตัวเลขและรวมค่าเฉลี่ยจาก 2 ระบบ
        const a = Number(s.avg_appointment) || 0
        const d = Number(s.avg_document) || 0

        if (a > 0 && d > 0) s.rating = ((a + d) / 2).toFixed(2)
        else s.rating = (a || d).toFixed(2)
      })

      console.table(results.map(r => ({
        name: `${r.firstName} ${r.lastName}`,
        appointment: r.avg_appointment,
        document: r.avg_document,
        final_rating: r.rating
      })))

      res.json({ success: true, data: results })
    })
  })

  // ============================================================
  // 🟢 2. ดึง responsibilities (categories)
  // ============================================================
  router.get('/categories', (req, res) => {
    db.query('SELECT category_id, type FROM categories', (err, results) => {
      if (err) {
        console.error('❌ Error fetching categories:', err)
        return res.status(500).json({ success: false, error: err.message })
      }
      res.json({ success: true, data: results })
    })
  })

  // ============================================================
  // 🟢 3. ดึง responsibilities ของ staff คนเดียว
  // ============================================================
  router.get('/staff/:id/categories', (req, res) => {
    const { id } = req.params
    const sql = `
      SELECT uc.category_id, c.type
      FROM user_category uc
      JOIN categories c ON uc.category_id = c.category_id
      WHERE uc.user_id = ?
    `
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('❌ Error fetching user categories:', err)
        return res.status(500).json({ success: false, error: err.message })
      }
      res.json({ success: true, data: results })
    })
  })

  // ============================================================
  // 🟢 4. เพิ่ม Staff ใหม่
  // ============================================================
  router.post('/staffs', upload.single('avatar'), (req, res) => {
    console.log('📥 Add Staff Request:', req.body)
    console.log('📦 Uploaded file:', req.file)

    const { firstName, lastName, email, categoryIds } = req.body
    const avatarFile = req.file ? req.file.filename : 'default.png'
    console.log('🖼 Avatar filename:', avatarFile)

    let categories = []
    try {
      categories = JSON.parse(categoryIds || '[]')
    } catch (err) {
      console.error('⚠️ JSON parse error:', err.message)
    }

    console.log('🧩 Parsed categories:', categories)

    const sqlUser = `
      INSERT INTO user (name, surname, email, role, profile_pic, status)
      VALUES (?, ?, ?, 2, ?, 1)
    `
    const params = [firstName, lastName, email, avatarFile]

    db.query(sqlUser, params, (err, result) => {
      if (err) {
        console.error('❌ Error adding staff:', err)
        return res.status(500).json({ success: false, error: err.message })
      }

      const userId = result.insertId
      console.log('✅ Added new staff with user_id:', userId)

      if (Array.isArray(categories) && categories.length > 0) {
        const sqlUC = 'INSERT INTO user_category (user_id, category_id) VALUES ?'
        const values = categories.map((cid) => [userId, cid])
        db.query(sqlUC, [values], (err2) => {
          if (err2) {
            console.error('⚠️ Error adding user_category:', err2)
            return res.status(500).json({ success: false, error: err2.message })
          }
          console.log('✅ Added user_category:', values)
          res.json({ success: true, message: 'Staff added successfully with responsibilities' })
        })
      } else {
        console.log('ℹ️ No responsibilities assigned.')
        res.json({ success: true, message: 'Staff added successfully (no categories)' })
      }
    })
  })

  // ============================================================
  // 🟢 5. แก้ไข Staff
  // ============================================================
  router.patch('/staffs/:id/update', upload.single('avatar'), (req, res) => {
    const { id } = req.params
    const { firstName, lastName, email, categoryIds } = req.body
    const categories = JSON.parse(categoryIds || '[]')
    const avatarFile = req.file ? req.file.filename : null

    console.log('🛠 Update Staff ID:', id)
    console.log('📧 Email:', email)
    console.log('📦 New avatar:', avatarFile)
    console.log('🧩 Categories:', categories)

    const sqlUser = `
      UPDATE user 
      SET name=?, surname=?, email=? ${avatarFile ? ', profile_pic=?' : ''} 
      WHERE user_id=?
    `
    const params = avatarFile
      ? [firstName, lastName, email, avatarFile, id]
      : [firstName, lastName, email, id]

    db.query(sqlUser, params, (err) => {
      if (err) {
        console.error('❌ Error updating staff:', err)
        return res.status(500).json({ success: false, error: err.message })
      }

      db.query('DELETE FROM user_category WHERE user_id=?', [id], (err2) => {
        if (err2) {
          console.error('⚠️ Error deleting old categories:', err2)
          return res.status(500).json({ success: false, error: err2.message })
        }

        if (Array.isArray(categories) && categories.length > 0) {
          const sqlUC = 'INSERT INTO user_category (user_id, category_id) VALUES ?'
          const values = categories.map((cid) => [id, cid])
          db.query(sqlUC, [values], (err3) => {
            if (err3) {
              console.error('⚠️ Error adding new categories:', err3)
              return res.status(500).json({ success: false, error: err3.message })
            }

            console.log('✅ Updated categories for user_id:', id, values)
            return res.json({ success: true, message: 'Staff updated successfully with categories' })
          })
        } else {
          console.log('ℹ️ No categories assigned after update.')
          return res.json({ success: true, message: 'Staff updated successfully (no categories)' })
        }
      })
    })
  })

  // ============================================================
  // 🟢 6. เปลี่ยนสถานะ Staff
  // ============================================================
  router.patch('/staffs/:id/status', (req, res) => {
    const { id } = req.params
    const { status } = req.body
    db.query('UPDATE user SET status = ? WHERE user_id = ?', [status, id], (err) => {
      if (err) {
        console.error('❌ Error updating status:', err)
        return res.status(500).json({ success: false, error: err.message })
      }
      res.json({ success: true })
    })
  })

  // ============================================================
  // 📊 7. Weekly Summary (Dashboard)
  // ============================================================
  router.get('/weekly-summary', (req, res) => {
    const { start, end } = req.query
    const sqlAppointments = `
      SELECT DAYNAME(appointment_date) AS day_name, COUNT(*) AS count
      FROM appointment
      WHERE status = 3
        AND DATE(appointment_date) BETWEEN ? AND ?
      GROUP BY DAYNAME(appointment_date)
    `
    const sqlDocuments = `
      SELECT DAYNAME(submit_date) AS day_name, COUNT(*) AS count
      FROM document_tracking
      WHERE status = 2
        AND DATE(submit_date) BETWEEN ? AND ?
      GROUP BY DAYNAME(submit_date)
    `

    db.query(sqlAppointments, [start, end], (errA, appResults) => {
      if (errA) return res.status(500).json({ success: false, error: errA.message })

      db.query(sqlDocuments, [start, end], (errD, docResults) => {
        if (errD) return res.status(500).json({ success: false, error: errD.message })

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        const summary = days.map(day => ({
          day,
          appointments: appResults.find(r => r.day_name === day)?.count || 0,
          documents: docResults.find(r => r.day_name === day)?.count || 0
        }))

        res.json({ success: true, data: summary })
      })
    })
  })

  // ============================================================
  // 📊 8. Average Rating (Dashboard)
  // ============================================================
  router.get('/average-rating', (req, res) => {
    const { start, end } = req.query

    if (!start || !end) {
      return res.status(400).json({ success: false, error: 'Missing start or end date' })
    }

    const sqlApt = `
      SELECT 
        AVG(f.score_count1) AS sp, 
        AVG(f.score_count2) AS spc, 
        AVG(f.score_count3) AS fac
      FROM feedback_appointment f
      JOIN appointment a ON f.appointment_id = a.appointment_id
      WHERE DATE(a.appointment_date) BETWEEN ? AND ?
    `
    const sqlDoc = `
      SELECT 
        AVG(f.score_count1) AS sp, 
        AVG(f.score_count2) AS spc, 
        AVG(f.score_count3) AS fac
      FROM feedback_document_tracking f
      JOIN document_tracking d ON f.document_id = d.document_id 
      WHERE DATE(d.submit_date) BETWEEN ? AND ?
    `

    db.query(sqlApt, [start, end], (errA, aptResults) => {
      if (errA) {
        console.error('❌ Error fetching average appointment ratings:', errA)
        return res.status(500).json({ success: false, error: errA.message })
      }

      db.query(sqlDoc, [start, end], (errD, docResults) => {
        if (errD) {
          console.error('❌ Error fetching average document ratings:', errD)
          return res.status(500).json({ success: false, error: errD.message })
        }

        const apt = aptResults[0] || {}
        const doc = docResults[0] || {}

        res.json({
          success: true,
          data: {
            appointment: {
              service_provider: Number(apt.sp || 0).toFixed(2),
              service_process: Number(apt.spc || 0).toFixed(2),
              facilities: Number(apt.fac || 0).toFixed(2)
            },
            document: {
              service_provider: Number(doc.sp || 0).toFixed(2),
              service_process: Number(doc.spc || 0).toFixed(2),
              facilities: Number(doc.fac || 0).toFixed(2)
            }
          }
        })
      })
    })
  })

  // ============================================================
  // 📊 9. Staff Rating
  // ============================================================
  router.get('/staff/:id/rating', (req, res) => {
    const { id } = req.params
    const { year, semester, type } = req.query

    if (!year || !semester || !type) {
      return res.status(400).json({ success: false, message: 'Missing year, semester, or type' })
    }

    let sql = ''

    if (type === 'appointment') {
      sql = `
        SELECT 
          AVG(fa.score_count1) AS service_provider,
          AVG(fa.score_count2) AS service_process,
          AVG(fa.score_count3) AS facilities
        FROM feedback_appointment fa
        JOIN appointment a ON fa.appointment_id = a.appointment_id
        JOIN user_category uc ON a.category_id = uc.category_id
        JOIN academic_period ap 
          ON DATE(a.appointment_date) BETWEEN ap.start_date AND ap.end_date
        WHERE 
          uc.user_id = ?   
          AND ap.academic_year = ? 
          AND ap.semester = ?
      `
    } else if (type === 'document') {
      sql = `
        SELECT 
          AVG(fd.score_count1) AS service_provider,
          AVG(fd.score_count2) AS service_process,
          AVG(fd.score_count3) AS facilities
        FROM feedback_document_tracking fd
        JOIN document_tracking d ON fd.document_id = d.document_id
        JOIN user_category uc ON d.category_id = uc.category_id
        JOIN academic_period ap 
          ON DATE(d.submit_date) BETWEEN ap.start_date AND ap.end_date
        WHERE 
          uc.user_id = ?   
          AND ap.academic_year = ? 
          AND ap.semester = ?
      `
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type' })
    }

    db.query(sql, [id, year, semester], (err, results) => {
      if (err) {
        console.error('❌ Error fetching staff rating:', err)
        return res.status(500).json({ success: false, error: err.message })
      }

      console.log(`📊 Staff Rating Query Result (user_id=${id}, type=${type}, year=${year}, sem=${semester}):`)
      console.table(results)

      res.json({ success: true, data: results[0] || {} })
    })
  })

  // ============================================================
  // 💬 10. Staff Comments
  // ============================================================
  router.get('/staff/:id/comments', (req, res) => {
    const { id } = req.params
    const { type, year, semester } = req.query

    if (!type || !year || !semester) {
      return res.status(400).json({ success: false, message: 'Missing type, year, or semester' })
    }

    let sql = ''
    if (type === 'appointment') {
      sql = `
        SELECT 
          ROUND((fa.score_count1 + fa.score_count2 + fa.score_count3) / 3) AS avg_score,
          fa.comment
        FROM feedback_appointment fa
        JOIN appointment a ON fa.appointment_id = a.appointment_id
        JOIN user_category uc ON a.category_id = uc.category_id
        JOIN academic_period ap 
          ON DATE(a.appointment_date) BETWEEN ap.start_date AND ap.end_date
        WHERE 
          uc.user_id = ?   
          AND ap.academic_year = ? 
          AND ap.semester = ?
          AND fa.comment IS NOT NULL 
          AND fa.comment != ''
      `
    } else if (type === 'document') {
      sql = `
        SELECT 
          ROUND((fd.score_count1 + fd.score_count2 + fd.score_count3) / 3) AS avg_score,
          fd.comment
        FROM feedback_document_tracking fd
        JOIN document_tracking d ON fd.document_id = d.document_id
        JOIN user_category uc ON d.category_id = uc.category_id
        JOIN academic_period ap 
          ON DATE(d.submit_date) BETWEEN ap.start_date AND ap.end_date
        WHERE 
          uc.user_id = ?   
          AND ap.academic_year = ? 
          AND ap.semester = ?
          AND fd.comment IS NOT NULL 
          AND fd.comment != ''
      `
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type' })
    }

    db.query(sql, [id, year, semester], (err, results) => {
      if (err) {
        console.error('❌ Error fetching staff comments:', err)
        return res.status(500).json({ success: false, error: err.message })
      }
      res.json({ success: true, data: results })
    })
  })

  return router
}