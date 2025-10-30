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
    // ------------------------------------------ Get current academic period -----------------------------------------
  router.get('/current', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT period_id, academic_year, semester 
      FROM academic_period 
      WHERE is_current = 1 
      LIMIT 1
    `)

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No current academic period found' })
    }

    res.json({ success: true, data: rows[0] })
  } catch (err) {
    console.error('❌ Error fetching current academic period:', err)
    res.status(500).json({ success: false, message: 'Database error' })
  }
})
    // ------------------------------------------ Get academic years and semesters -----------------------------------------
router.get('/academic-options', async (req, res) => {
  try {
    // 1. ดึง "ปีการศึกษา" ทั้งหมดที่มีในตาราง (แบบไม่ซ้ำ)
    //    เรียงจากมากไปน้อย (ปีล่าสุดขึ้นก่อน)
    const [yearRows] = await db.promise().query(`
      SELECT DISTINCT academic_year 
      FROM academic_period 
      ORDER BY academic_year DESC
    `)

    // 2. แปลงผลลัพธ์ [ { academic_year: '2568' }, { academic_year: '2567' } ]
    //    ให้กลายเป็น [ '2568', '2567' ]
    const years = yearRows.map(row => row.academic_year)

    // 3. ส่วนของเทอม เรากำหนดตายตัวได้เลย
    const semesters = [
      { value: '1', text: 'Semester 1' },
      { value: '2', text: 'Semester 2' }
    ]

    // 4. ส่งข้อมูลทั้งหมดกลับไป
    res.json({
      success: true,
      data: {
        semesters: semesters,
        years: years
      }
    })

  } catch (err) {
    console.error('❌ Error fetching academic options:', err)
    res.status(500).json({ success: false, message: 'Database error' })
  }
})
   return router;
}