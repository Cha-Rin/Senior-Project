const express = require('express');
const multer = require('multer');

module.exports = (db) => {
  console.log("✅ Admin routes loaded successfully!");
  const router = express.Router();

  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  const upload = multer({ dest: 'uploads/' });

  // =====================================
  // 👩‍💼 Staff Management
  // =====================================

  // ✅ ดึงรายชื่อ Staff ทั้งหมด + คำนวณคะแนนเฉลี่ยจาก feedback
  router.get('/staffs', (req, res) => {
    const sql = `
      SELECT 
        u.user_id AS id,
        u.name AS firstName,
        u.surname AS lastName,
        u.email,
        u.profile_pic AS avatar,
        c.type AS category,
        u.status,
        (
          SELECT AVG((fa.score_count1 + fa.score_count2 + fa.score_count3) / 3)
          FROM feedback_appointment fa
          JOIN appointment a ON fa.appointment_id = a.appointment_id
          WHERE a.staff_user_id = u.user_id
        ) AS rating
      FROM user u
      LEFT JOIN categories c ON u.category_id = c.category_id
      WHERE u.role = 2
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ DB Error:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, data: results });
    });
  });

  // ✅ เพิ่ม Staff
  router.post('/staffs/add', upload.single('avatar'), (req, res) => {
    const { firstName, lastName, email } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : '';
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const sql = `
      INSERT INTO user (profile_pic, name, surname, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [avatar, firstName, lastName, email, '1234', 2, 1];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, id: result.insertId });
    });
  });

  // ✅ แก้ไข Staff
  router.put('/staffs/:id', upload.single('avatar'), (req, res) => {
    const id = req.params.id;
    const { firstName, lastName, email, category_id } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    let sql, values;
    if (avatar) {
      sql = `UPDATE user SET profile_pic=?, name=?, surname=?, email=?, category_id=? WHERE user_id=?`;
      values = [avatar, firstName, lastName, email, category_id, id];
    } else {
      sql = `UPDATE user SET name=?, surname=?, email=?, category_id=? WHERE user_id=?`;
      values = [firstName, lastName, email, category_id, id];
    }

    db.query(sql, values, (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Update failed' });
      res.json({ success: true });
    });
  });

  // ✅ เปลี่ยนสถานะ Staff
  router.patch('/staffs/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    db.query('UPDATE user SET status = ? WHERE user_id = ?', [status, id], (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    });
  });

  // =====================================
  // 📊 Dashboard: Weekly Summary (กราฟ 1)
  // =====================================
  router.get('/weekly-summary', (req, res) => {
    const { start, end } = req.query;

    const sqlAppointments = `
      SELECT DAYNAME(appointment_date) AS day_name, COUNT(*) AS count
      FROM appointment
      WHERE status = 1
        AND DATE(appointment_date) BETWEEN ? AND ?
      GROUP BY DAYNAME(appointment_date)
    `;

    const sqlDocuments = `
      SELECT DAYNAME(submit_date) AS day_name, COUNT(*) AS count
      FROM document_tracking
      WHERE status = 1
        AND DATE(submit_date) BETWEEN ? AND ?
      GROUP BY DAYNAME(submit_date)
    `;

    db.query(sqlAppointments, [start, end], (errA, appResults) => {
      if (errA) {
        console.error('❌ DB Error (Appointments):', errA);
        return res.status(500).json({ success: false, error: errA.message });
      }

      db.query(sqlDocuments, [start, end], (errD, docResults) => {
        if (errD) {
          console.error('❌ DB Error (Documents):', errD);
          return res.status(500).json({ success: false, error: errD.message });
        }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        const summary = days.map(day => ({
          day,
          appointments: appResults.find(r => r.day_name === day)?.count || 0,
          documents: docResults.find(r => r.day_name === day)?.count || 0
        }));

        res.json({ success: true, data: summary });
      });
    });
  });

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
    `;

    const sqlDoc = `
      SELECT 
        AVG(score_count1) AS sp,
        AVG(score_count2) AS spc,
        AVG(score_count3) AS fac
      FROM feedback_document_tracking
    `;

    db.query(sqlApt, (errA, aptResults) => {
      if (errA) return res.status(500).json({ success: false, error: errA.message });

      db.query(sqlDoc, (errD, docResults) => {
        if (errD) return res.status(500).json({ success: false, error: errD.message });

        const apt = aptResults[0] || {};
        const doc = docResults[0] || {};

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
        };

        res.json({ success: true, data: result });
      });
    });
  });

  return router;
};
