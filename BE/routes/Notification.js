const express = require('express')
const authMiddleware = require('../middleware/auth') ;
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
//   นัดหมายปลอมสำรหับทดสอบ
let mockAppointments = [
  {
    id: 1,
    name: 'คุณสมชาย',
    appointment_time: '2025-11-06T10:00:00+07:00', // 10 โมงเช้า (ผ่านมาแล้ว)
    status: 0 // สถานะ: รอดำเนินการ
  },
  {
    id: 2,
    name: 'คุณสมหญิง',
    appointment_time: '2025-11-06T23:00:00+07:00', // 5 ทุ่ม (ยังไม่ถึงเวลา)
    status: 0
  },
  {
    id: 3,
    name: 'คุณวิชัย',
    appointment_time: '2025-11-06T11:00:00+07:00', // 11 โมงเช้า (ผ่านมาแล้ว)
    status: 0 // สถานะ: อนุมัติไปแล้ว
  },
  {
    id: 4,
    name: 'คุณพรทิพย์',
    appointment_time: '2025-11-06T15:00:00+07:00', // บ่าย 3 (ผ่านมาแล้ว)
    status: 0// สถานะ: รอดำเนินการ
  }
];
// ----------------------------------------------------------------------------------------------------
// API Endpoint สำหรับดึงนัดหมายที่ถึงเวลาแล้วและยังไม่อนุมัติ
router.get('/pending-now', (req, res) => {
  const now = new Date(); // เวลาปัจจุบัน

  const pendingNow = mockAppointments.filter(app => {
    const appointmentTime = new Date(app.appointment_time);
    
    return app.status === 0 && appointmentTime <= now;
  });

  
  console.log(`[${now.toLocaleTimeString()}] FE query: Found ${pendingNow.length} pending appointments.`);
  res.json(pendingNow);
});
// ----------------------------------------------------------------------------------------------------
// API Endpoint สำหรับอนุมัตินัดหมาย
router.post('/:id/approve', (req, res) => {
 
  const idToApprove = parseInt(req.params.id, 10);

 
  const appointment = mockAppointments.find(app => app.id === idToApprove);

  if (appointment) {
    if (appointment.status === 2) {
      return res.status(400).json({ message: 'This appointment was already rejected.' });
    }

    appointment.status = 1;
    
    console.log(`Appointment ID ${idToApprove} was APPROVED.`);
    res.status(200).json({ message: 'Appointment approved successfully' });
  } else {
    res.status(404).json({ message: 'Appointment not found' });
  }
});
// ----------------------------------------------------------------------------------------------------
// API Endpoint สำหรับปฏิเสธนัดหมาย
router.post('/:id/reject', (req, res) => {
  const idToReject = parseInt(req.params.id, 10);
  
  const appointment = mockAppointments.find(app => app.id === idToReject);

  if (appointment) {
    appointment.status = 2;
    
    console.log(`Appointment ID ${idToReject} was REJECTED.`);
    res.status(200).json({ message: 'Appointment rejected successfully' });
  } else {
    res.status(404).json({ message: 'Appointment not found' });
  }
});

  return router;
}