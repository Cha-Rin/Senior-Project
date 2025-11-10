// 📁 BE/routes/Notification.js
const express = require('express')
const authMiddleware = require('../middleware/auth')

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

  // ----------------------------------------------------------
  // ✅ นัดหมายที่รออนุมัติ (Pending Appointment)
  // ----------------------------------------------------------
  router.get('/pending-now', (req, res) => {
    const secretaryId = req.query.user_id
    if (!secretaryId) {
      return res.status(400).json({ success: false, message: 'Missing user_id' })
    }

    const sql = `
      SELECT COUNT(*) AS count
      FROM appointment AS a
      JOIN user_category AS uc ON a.category_id = uc.category_id
      JOIN user AS u ON a.user_id = u.user_id
      WHERE a.status = 0
        AND uc.user_id = ?
    `

    db.query(sql, [secretaryId], (err, results) => {
      if (err) {
        console.error('SQL Error (pending-now):', err)
        return res.status(500).json({ success: false, message: 'Database query failed' })
      }
      const count = results[0]?.count || 0
      res.json({ success: true, count })
    })
  })

  // ----------------------------------------------------------
  // ✅ Request Document (เฉพาะของเลขาคนนั้น และ status = 0)
  // ----------------------------------------------------------
  router.get('/request-documents', (req, res) => {
    const secretaryId = req.query.user_id
    if (!secretaryId) {
      return res.status(400).json({ success: false, message: 'Missing user_id' })
    }

    const sql = `
      SELECT COUNT(DISTINCT d.document_id) AS count
      FROM document_tracking AS d
      JOIN user_category AS uc ON d.category_id = uc.category_id
      WHERE uc.user_id = ?
        AND d.status = 0
    `

    db.query(sql, [secretaryId], (err, results) => {
      if (err) {
        console.error('SQL Error (request-documents):', err)
        return res.status(500).json({ success: false, message: 'Database query failed' })
      }
      const count = results[0]?.count || 0
      res.json({ success: true, count })
    })
  })

  // ----------------------------------------------------------
  // ✅ Document Status (เฉพาะของเลขาคนนั้น นับทุกสถานะ)
  // ----------------------------------------------------------
  router.get('/document-status', (req, res) => {
    const secretaryId = req.query.user_id
    if (!secretaryId) {
      return res.status(400).json({ success: false, message: 'Missing user_id' })
    }

    const sql = `
      SELECT COUNT(DISTINCT d.document_id) AS count
      FROM document_tracking AS d
      JOIN user_category AS uc ON d.category_id = uc.category_id
      WHERE uc.user_id = ?
    `

    db.query(sql, [secretaryId], (err, results) => {
      if (err) {
        console.error('SQL Error (document-status):', err)
        return res.status(500).json({ success: false, message: 'Database query failed' })
      }
      const count = results[0]?.count || 0
      res.json({ success: true, count })
    })
  })

  // ----------------------------------------------------------
  // ✅ อนุมัตินัดหมาย
  // ----------------------------------------------------------
  router.post('/:id/approve', (req, res) => {
    const idToApprove = req.params.id
    const sql = `
      UPDATE appointment 
      SET status = 1 
      WHERE appointment_id = ?
    `
    db.query(sql, [idToApprove], (err, result) => {
      if (err) {
        console.error('SQL Error (approve):', err)
        return res.status(500).json({ success: false, message: 'Database update failed' })
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' })
      }
      res.status(200).json({ success: true, message: 'Appointment approved successfully' })
    })
  })

  // ----------------------------------------------------------
  // ✅ ปฏิเสธนัดหมาย
  // ----------------------------------------------------------
  router.post('/:id/reject', (req, res) => {
    const idToReject = req.params.id
    const sql = `
      UPDATE appointment 
      SET status = 2 
      WHERE appointment_id = ?
    `
    db.query(sql, [idToReject], (err, result) => {
      if (err) {
        console.error('SQL Error (reject):', err)
        return res.status(500).json({ success: false, message: 'Database update failed' })
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found' })
      }
      res.status(200).json({ success: true, message: 'Appointment rejected successfully' })
    })
  })

  return router
}
