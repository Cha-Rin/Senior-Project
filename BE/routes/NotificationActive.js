const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  // ------------------------------------------
  // ✅ GET /api/noti/active-now?user_id=XX
  // ------------------------------------------
//   router.get("/active-now", (req, res) => {
//     const userId = req.user.user_id || req.user.id;
//     if (!userId) {
//       return res.status(400).json({ error: "Missing user_id" });
//     }

//     const sql = `
//       SELECT 
//         a.appointment_id AS id,
//         CONCAT(u.name, ' ', u.surname) AS name,
//         c.type AS topic,
//         DATE_FORMAT(a.appointment_date, '%Y-%m-%d %H:%i') AS start_time,
//         DATE_FORMAT(a.staff_offtime, '%Y-%m-%d %H:%i') AS end_time
//       FROM appointment a
//       JOIN user u ON a.user_id = u.user_id
//       JOIN categories c ON a.category_id = c.category_id
//       JOIN user_category uc ON a.category_id = uc.category_id
//       WHERE 
//         uc.user_id = ?
//         AND a.status = 1
//         AND NOW() BETWEEN a.appointment_date AND a.staff_offtime
//       ORDER BY a.appointment_date ASC
//     `;

//     db.query(sql, [userId], (err, rows) => {
//       if (err) {
//         console.error("❌ SQL active-now error:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
//       res.json(rows);
//     });
//   });
router.get("/active-now/:staffId", (req, res) => {
    const staffId = req.params.staffId;
  if (!staffId) {
    return res.status(400).json({ error: "Missing staffId" });
  }
    const sql = `
      SELECT 
        a.appointment_id AS id,
        CONCAT(u.name, ' ', u.surname) AS name,
         DATE_FORMAT(a.appointment_date, '%H:%i') AS time,
        c.type AS topic
      FROM appointment a
      JOIN user u ON a.user_id = u.user_id
      JOIN categories c ON a.category_id = c.category_id
      JOIN user_category uc ON a.category_id = uc.category_id
      WHERE 
        uc.user_id = ?
        AND a.status = 1
      ORDER BY a.appointment_date ASC
    `;

    db.query(sql, [staffId], (err, rows) => {
      if (err) {
        console.log("SQL active-now error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    });
});

 // ------------------------------------------
  // ✅ POST /api/noti/active/:id/done  → ยืนยันสำเร็จ
  // ------------------------------------------
  router.post("/active/:id/done", (req, res) => {
  const appointmentId = req.params.id;  // ← ดึงจาก URL

  const sql = `
    UPDATE appointment
    SET status = 3
    WHERE appointment_id = ?
  `;

  db.query(sql, [appointmentId], (err, result) => {
    if (err) {
      console.error("❌ SQL done error:", err);
      return res.status(500).json({ error: "Update failed" });
    }
    res.json({ success: true, message: "Marked as done." });
  });
});

  // ------------------------------------------
  // ❌ POST /api/noti/active/:id/cancel → ยกเลิก
  // ------------------------------------------
  router.post("/active/:id/cancel", (req, res) => {
  const appointmentId = req.params.id;  // ← ดึงจาก URL

  const sql = `
    UPDATE appointment
    SET status = 2
    WHERE appointment_id = ?
  `;

  db.query(sql, [appointmentId], (err, result) => {
    if (err) {
      console.error("❌ SQL cancel error:", err);
      return res.status(500).json({ error: "Cancel failed" });
    }
    res.json({ success: true, message: "Appointment cancelled." });
  });
});


  return router;
};
