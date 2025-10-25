const express = require('express')
const multer = require('multer')

module.exports = (db) => {
  console.log("✅ Admin routes loaded successfully!")
  const router = express.Router()

  router.use(express.json())
  router.use(express.urlencoded({ extended: true }))

  const upload = multer({ dest: 'uploads/' })

  // =====================================
  // 👩‍💼 Staff Management
  // =====================================

  // ✅ Mapping: staff_user_id => category_id[]
  const staffCategoryMap = {
    6: [1, 2], // ภาคภูมิ ล้ำประเสริฐ — กิจกรรมนักศึกษา, สหกิจศึกษา
    3: [3],    // ทัตต์ชไม หวานชัยสีห์ — ผ่อนผัน
    4: [5],    // รัตติกาล นางแล — บัณฑิตศึกษา
    2: [4]     // พรทิพย์ ปัญญา — งานทะเบียน
  }

  // ✅ ดึงรายชื่อ Staff ทั้งหมด + คำนวณคะแนนเฉลี่ยจาก category ที่รับผิดชอบ
  router.get('/staffs', (req, res) => {
    const sqlStaff = `
      SELECT user_id AS id, name AS firstName, surname AS lastName, 
             email, profile_pic AS avatar, status
      FROM user
      WHERE role = 2;
    `

    db.query(sqlStaff, async (err, staffList) => {
      if (err) {
        console.error('❌ Error fetching staff:', err)
        return res.status(500).json({ success: false, message: err.message })
      }

      const promises = staffList.map(staff => {
        const catIds = staffCategoryMap[staff.id] || []
        if (catIds.length === 0) {
          return Promise.resolve({
            ...staff,
            avatar: staff.avatar ? `http://localhost:3000${staff.avatar}` : '/default-avatar.png',
            rating: 0
          })
        }

        const placeholders = catIds.map(() => '?').join(',')

        const sql1 = `
          SELECT AVG((fa.score_count1 + fa.score_count2 + fa.score_count3)/3) AS avg1
          FROM feedback_appointment fa
          JOIN appointment a ON fa.appointment_id = a.appointment_id
          WHERE a.category_id IN (${placeholders});
        `

        const sql2 = `
          SELECT AVG((fd.score_count1 + fd.score_count2 + fd.score_count3)/3) AS avg2
          FROM feedback_document_tracking fd
          JOIN document_tracking d ON fd.document_id = d.document_id
          WHERE d.category_id IN (${placeholders});
        `

        return new Promise(resolve => {
          db.query(sql1, catIds, (err1, r1) => {
            db.query(sql2, catIds, (err2, r2) => {
              const avg1 = r1?.[0]?.avg1 || 0
              const avg2 = r2?.[0]?.avg2 || 0
              const rating = Number(((parseFloat(avg1) + parseFloat(avg2)) / 2).toFixed(2))
              resolve({
                ...staff,
                avatar: staff.avatar ? `http://localhost:3000${staff.avatar}` : '/default-avatar.png',
                rating
              })
            })
          })
        })
      })

      const data = await Promise.all(promises)
      res.json({ success: true, data })
    })
  })

  // ✅ เพิ่ม Staff
  router.post('/staffs/add', upload.single('avatar'), (req, res) => {
    const { firstName, lastName, email } = req.body
    const avatar = req.file ? `/uploads/${req.file.filename}` : ''
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    const sql = `
      INSERT INTO user (profile_pic, name, surname, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const values = [avatar, firstName, lastName, email, '1234', 2, 1]

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message })
      res.json({ success: true, id: result.insertId })
    })
  })

  // ✅ เปลี่ยนสถานะ Staff
  router.patch('/staffs/:id/status', (req, res) => {
    const id = req.params.id
    const { status } = req.body
    db.query('UPDATE user SET status = ? WHERE user_id = ?', [status, id], (err) => {
      if (err) return res.status(500).json({ success: false })
      res.json({ success: true })
    })
  })

  // =====================================
  // 📊 Dashboard: Weekly Summary (กราฟ 1)
  // =====================================
  router.get('/weekly-summary', (req, res) => {
    const { start, end } = req.query

    const sqlAppointments = `
      SELECT DAYNAME(appointment_date) AS day_name, COUNT(*) AS count
      FROM appointment
      WHERE status = 1
        AND DATE(appointment_date) BETWEEN ? AND ?
      GROUP BY DAYNAME(appointment_date)
    `

    const sqlDocuments = `
      SELECT DAYNAME(submit_date) AS day_name, COUNT(*) AS count
      FROM document_tracking
      WHERE status = 1
        AND DATE(submit_date) BETWEEN ? AND ?
      GROUP BY DAYNAME(submit_date)
    `

    db.query(sqlAppointments, [start, end], (errA, appResults) => {
      if (errA) return res.status(500).json({ success: false, error: errA.message })
      db.query(sqlDocuments, [start, end], (errD, docResults) => {
        if (errD) return res.status(500).json({ success: false, error: errD.message })

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const summary = days.map(day => ({
          day,
          appointments: appResults.find(r => r.day_name === day)?.count || 0,
          documents: docResults.find(r => r.day_name === day)?.count || 0
        }))

        res.json({ success: true, data: summary })
      })
    })
  })

  // =====================================
  // ⭐ Average Rating (กราฟ 2)
  // =====================================
  router.get('/average-rating', (req, res) => {
    const sqlApt = `
      SELECT 
        AVG(score_count1) AS sp,
        AVG(score_count2) AS spc,
        AVG(score_count3) AS fac
      FROM feedback_appointment
    `
    const sqlDoc = `
      SELECT 
        AVG(score_count1) AS sp,
        AVG(score_count2) AS spc,
        AVG(score_count3) AS fac
      FROM feedback_document_tracking
    `
    db.query(sqlApt, (errA, aptResults) => {
      if (errA) return res.status(500).json({ success: false, error: errA.message })
      db.query(sqlDoc, (errD, docResults) => {
        if (errD) return res.status(500).json({ success: false, error: errD.message })

        const apt = aptResults[0] || {}
        const doc = docResults[0] || {}

        const result = {
          appointment: {
            service_provider: apt.sp ? Number(parseFloat(apt.sp).toFixed(2)) : 0,
            service_process: apt.spc ? Number(parseFloat(apt.spc).toFixed(2)) : 0,
            facilities: apt.fac ? Number(parseFloat(apt.fac).toFixed(2)) : 0
          },
          document: {
            service_provider: doc.sp ? Number(parseFloat(doc.sp).toFixed(2)) : 0,
            service_process: doc.spc ? Number(parseFloat(doc.spc).toFixed(2)) : 0,
            facilities: doc.fac ? Number(parseFloat(doc.fac).toFixed(2)) : 0
          }
        }
        res.json({ success: true, data: result })
      })
    })
  })

  return router
}
