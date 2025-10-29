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
             email, profile_pic AS avatar, status, role
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

  // ✅ อัปเดตข้อมูล Staff
router.patch('/staffs/:id/update', upload.single('avatar'), (req, res) => {
  const id = req.params.id
  const { firstName, lastName, email, role } = req.body
  const avatar = req.file ? `/uploads/${req.file.filename}` : null

  const sql = avatar
    ? `UPDATE user SET name=?, surname=?, email=?, role=?, profile_pic=? WHERE user_id=?`
    : `UPDATE user SET name=?, surname=?, email=?, role=? WHERE user_id=?`

  const values = avatar
    ? [firstName, lastName, email, role, avatar, id]
    : [firstName, lastName, email, role, id]

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message })
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


router.get('/staff/:id/rating', (req, res) => {
  const staffId = parseInt(req.params.id);
  const { year, semester } = req.query; // 🧩 รับค่าปีและเทอมจาก frontend

  const catIds = staffCategoryMap[staffId] || [];
  if (catIds.length === 0) {
    return res.json({
      success: true,
      data: {
        appointment: { service_provider: 0, service_process: 0, facilities: 0 },
        document: { service_provider: 0, service_process: 0, facilities: 0 }
      }
    });
  }

  const placeholders = catIds.map(() => '?').join(',');

  // 🔹 Appointment feedback
  const sqlApt = `
    SELECT 
      AVG(fa.score_count1) AS service_provider,
      AVG(fa.score_count2) AS service_process,
      AVG(fa.score_count3) AS facilities
    FROM feedback_appointment fa
    JOIN appointment a ON fa.appointment_id = a.appointment_id
    WHERE a.category_id IN (${placeholders})
      AND a.academic_year = ?
      AND a.semester = ?;
  `;

  // 🔹 Document tracking feedback
  const sqlDoc = `
    SELECT 
      AVG(fd.score_count1) AS service_provider,
      AVG(fd.score_count2) AS service_process,
      AVG(fd.score_count3) AS facilities
    FROM feedback_document_tracking fd
    JOIN document_tracking d ON fd.document_id = d.document_id
    WHERE d.category_id IN (${placeholders})
      AND d.academic_year = ?
      AND d.semester = ?;
  `;

  // ✅ Execute queries
  db.query(sqlApt, [...catIds, year, semester], (errA, aptResults) => {
    if (errA) return res.status(500).json({ success: false, error: errA.message });

    db.query(sqlDoc, [...catIds, year, semester], (errD, docResults) => {
      if (errD) return res.status(500).json({ success: false, error: errD.message });

      const appointment = aptResults[0] || {};
      const document = docResults[0] || {};

      res.json({
        success: true,
        data: {
          appointment: {
            service_provider: parseFloat(appointment.service_provider || 0),
            service_process: parseFloat(appointment.service_process || 0),
            facilities: parseFloat(appointment.facilities || 0)
          },
          document: {
            service_provider: parseFloat(document.service_provider || 0),
            service_process: parseFloat(document.service_process || 0),
            facilities: parseFloat(document.facilities || 0)
          }
        }
      });
    });
  });
});





router.get('/staff/:id/comments', (req, res) => {
  const staffId = parseInt(req.params.id);
  const { type, year, semester } = req.query; // 🧩 เพิ่ม year + semester
  const catIds = staffCategoryMap[staffId] || [];

  if (catIds.length === 0) return res.json({ success: true, data: [] });

  const placeholders = catIds.map(() => '?').join(',');
  let sql;

  if (type === 'appointment') {
    sql = `
      SELECT 
        ((fa.score_count1 + fa.score_count2 + fa.score_count3)/3) AS avg_score,
        fa.comment
      FROM feedback_appointment fa
      JOIN appointment a ON fa.appointment_id = a.appointment_id
      WHERE a.category_id IN (${placeholders})
        AND a.academic_year = ?
        AND a.semester = ?
        AND fa.comment IS NOT NULL
        AND fa.comment <> '';
    `;
  } else {
    sql = `
      SELECT 
        ((fd.score_count1 + fd.score_count2 + fd.score_count3)/3) AS avg_score,
        fd.comment
      FROM feedback_document_tracking fd
      JOIN document_tracking d ON fd.document_id = d.document_id
      WHERE d.category_id IN (${placeholders})
        AND d.academic_year = ?
        AND d.semester = ?
        AND fd.comment IS NOT NULL
        AND fd.comment <> '';
    `;
  }

  db.query(sql, [...catIds, year, semester], (err, results) => {
    if (err) {
      console.error('❌ Error fetching staff comments:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, data: results });
  });
});

// ✅ 2. ดึงข้อมูล staff รายคน
router.get('/staff/:id', (req, res) => {
  const { id } = req.params
  const sql = `
    SELECT user_id AS id, name AS firstName, surname AS lastNam, profile_pic, email, role
    FROM user
    WHERE user_id = ?
  `
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err })
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Staff not found' })
    res.json({ success: true, staff: results[0] })
  })
})




  return router
}
