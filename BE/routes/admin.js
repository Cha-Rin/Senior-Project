const express = require('express')
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
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
// ===================================== Staff Management ==================================

//✅ ดึงรายชื่อ Staff ทั้งหมด
router.get('/api/staffs', (req, res) => {
  const sql = `
    SELECT u.user_id AS id, u.name, u.surname, u.email,
           u.profile_pic AS avatar, u.status AS active, u.category_id,
           c.type AS category_name
    FROM user u
    LEFT JOIN categories c ON u.category_id = c.category_id
    WHERE u.role = 2`

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false })

    const data = results.map(row => ({
      id: row.id,
      firstName: row.name,
      lastName: row.surname,
      email: row.email,
      avatar: row.avatar ? `http://localhost:${PORT}${row.avatar}` : '',
      active: row.active,
      category_id: row.category_id,
      category_name: row.category_name
    }))

    res.json({ success: true, data })
  })
})

// routes/admin.js
router.get('/staffs', (req, res) => {
  const sql = 'SELECT * FROM user WHERE role = 2' // สมมติ role 2 = Staff
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ DB Error:', err)
      return res.status(500).json({ success: false, message: err.message })
    }
     res.json({ success: true, data: results })
  })
})


// Add Staff
router.post('/staffs/add', upload.single('avatar'), async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body
    const avatar = req.file ? `/uploads/${req.file.filename}` : ''

    // ตรวจสอบข้อมูล required
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    const defaultPassword = '1234'
    const role = 2   // สมมติ role 2 = Staff
    const status = 1 // สมมติ status 1 = Active

    const sql = `
      INSERT INTO user (profile_pic, name, surname, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const values = [avatar, firstName, lastName, email, defaultPassword, role, status]

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('❌ DB Error:', err)
        return res.status(500).json({ success: false, message: err.message })
      }

      res.json({ success: true, id: result.insertId })
    })
  } catch (err) {
    console.error('❌ Route Error:', err)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})

// Edit Staff
router.put('/staffs/:id', upload.single('avatar'), (req, res) => {
  const id = req.params.id
  const { firstName, lastName, email, category_id } = req.body
  const avatar = req.file ? `/uploads/${req.file.filename}` : null

  // if (!firstName || !lastName || !email || !category_id) {
  //   return res.status(400).json({ success: false, message: 'Missing required fields' })
  // }

  let sql, values
  if (avatar) {
    sql = `UPDATE user SET profile_pic=?, name=?, surname=?, email=?, category_id=? WHERE user_id=?`
    values = [avatar, firstName, lastName, email, category_id, id]
  } else {
    sql = `UPDATE user SET name=?, surname=?, email=?, category_id=? WHERE user_id=?`
    values = [firstName, lastName, email, category_id, id]
  }

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Update failed' })
    res.json({ success: true })
  })
})

//  เปลี่ยนสถานะใช้งาน Staff (Active/Disable)
router.patch('/staffs/:id/status', (req, res) => {
  const id = req.params.id
  const { status } = req.body
  db.query('UPDATE user SET status = ? WHERE user_id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ success: false })
    res.json({ success: true })
  })
})


// แนะนำ: เพิ่ม UNIQUE เพื่อกันใส่ซ้ำ (รันใน MySQL หนึ่งครั้ง)
// ALTER TABLE feedback_appointment ADD UNIQUE KEY uniq_apt (appointment_id);

//history
router.get('/history/:UserId', (req, res) => {
  const studentId = req.params.UserId;
  console.log('📥 Received studentId (from frontend):', UserId);

  const sql = `
  SELECT a.appointment_date, a.category_id, c.type AS topic
  FROM appointment AS a
  JOIN categories AS c ON a.category_id 
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

return router}