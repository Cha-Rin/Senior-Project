const express = require('express')
const authMiddleware = require('../middleware/auth') ;
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
    // ------------------------------------------ Get current academic period -----------------------------------------
  router.get('/current', async (req, res) => {
  try {
    const [rows] = await db.query(`
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
   return router;
}