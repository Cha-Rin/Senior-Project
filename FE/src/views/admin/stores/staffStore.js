//ใช้แทนdatabaseไปก่อน
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStaffStore = defineStore('staff', () => {
  const staffList = ref([
    {
      id: 'A',
      name: 'นางสาวพรทิพย์ ปัญญา',
      email: 'porntip.pan@mfu.ac.th',
      role: 'Course registration',
      active: true,
      avatar: '/src/assets/P_Aoi.png',
      rating: 4
    },
    {
      id: 'B',
      name: 'นางสาวทัตต์ชไม หวานชัยสีห์',
      email: 'tatchamay.wah@mfu.ac.th',
      role: 'Tuition fee deferment',
      active: true,
      avatar: '/src/assets/P_Angoon.png',
      rating: 4
    },
    {
      id: 'C',
      name: 'นางสาวรัตติกาล นางแล',
      email: 'rattikan.nan@mfu.ac.th',
      role: 'University activity',
      active: true,
      avatar: '/src/assets/P_Lek.png',
      rating: 5
    },
    {
      id: 'D',
      name: 'นางสาวสยุมพร ไชยชมภู',
      email: 'sayumporn.cha@mfu.ac.th',
      role: 'Student assistant',
      active: true,
      avatar: '/src/assets/P_Nim.png',
      rating: 5
    },
    {
      id: 'E',
      name: 'นายภาคภูมิ ล้ำประเสริฐ',
      email: 'pakpoom.lam@mfu.ac.th',
      role: 'Course registration',
      active: true,
      avatar: '/src/assets/P_Pong.png',
      rating: 3
    }
  ])

  const ratings = ref([]) // { staffId, userId, serviceProvider, serviceProcess, facilities, comment, timestamp }
  const usageLogs = ref([]) // { staffId, type, date }
  const historyRecords = ref([ // 🔁 สำหรับ History.vue
     // 🔹 Staff A
  { staffId: 'A', type: 'appointment', studentId: '6512345001', datetime: '2025-07-15T09:00', topic: 'Course registration', note: 'ยืนยันเอกสารแล้ว', status: 'Approve' },
  { staffId: 'A', type: 'document',    studentId: '6512345002', datetime: '2025-07-15T10:00', topic: 'Doc submission', note: 'ส่งเอกสารล่าช้า', status: 'Pending' },
  { staffId: 'A', type: 'appointment', studentId: '6512345003', datetime: '2025-07-16T08:00', topic: 'Course registration', note: 'นัดรอบสอง', status: 'Approve' },
  { staffId: 'A', type: 'document',    studentId: '6512345004', datetime: '2025-07-16T09:00', topic: 'Transcript request', note: 'รอการตรวจสอบ', status: 'Reject' },
  { staffId: 'A', type: 'appointment', studentId: '6512345005', datetime: '2025-07-17T10:00', topic: 'Tuition deferment', note: '', status: 'Approve' },
  { staffId: 'A', type: 'document',    studentId: '6512345006', datetime: '2025-07-17T11:00', topic: 'Grade appeal', note: '', status: 'Approve' },
  { staffId: 'A', type: 'appointment', studentId: '6512345007', datetime: '2025-07-18T08:00', topic: 'Internship form', note: 'แจ้งแก้ไขชื่อบริษัท', status: 'Pending' },
  { staffId: 'A', type: 'document',    studentId: '6512345008', datetime: '2025-07-18T09:00', topic: 'Certificate request', note: 'ขอใช้ด่วน', status: 'Approve' },
  { staffId: 'A', type: 'appointment', studentId: '6512345009', datetime: '2025-07-18T13:00', topic: 'Course add/drop', note: 'ขอเปลี่ยนวิชา', status: 'Reject' },
  { staffId: 'A', type: 'document',    studentId: '6512345010', datetime: '2025-07-18T14:00', topic: 'Scholarship letter', note: '', status: 'Approve' },

  // 🔹 Staff B
  { staffId: 'B', type: 'appointment', studentId: '6512345011', datetime: '2025-07-15T09:00', topic: 'Course registration', note: 'คุยเรื่องลงทะเบียน', status: 'Approve' },
  { staffId: 'B', type: 'document',    studentId: '6512345012', datetime: '2025-07-15T10:00', topic: 'Doc submission', note: 'แนบผิดไฟล์', status: 'Reject' },
  { staffId: 'B', type: 'appointment', studentId: '6512345013', datetime: '2025-07-16T08:00', topic: 'Tuition deferment', note: '', status: 'Pending' },
  { staffId: 'B', type: 'document',    studentId: '6512345014', datetime: '2025-07-16T09:30', topic: 'Transcript request', note: '', status: 'Approve' },
  { staffId: 'B', type: 'appointment', studentId: '6512345015', datetime: '2025-07-17T09:00', topic: 'Internship form', note: '', status: 'Approve' },
  { staffId: 'B', type: 'document',    studentId: '6512345016', datetime: '2025-07-17T10:00', topic: 'Grade appeal', note: '', status: 'Pending' },
  { staffId: 'B', type: 'appointment', studentId: '6512345017', datetime: '2025-07-18T11:00', topic: 'Course add/drop', note: '', status: 'Reject' },
  { staffId: 'B', type: 'document',    studentId: '6512345018', datetime: '2025-07-18T13:00', topic: 'Certificate request', note: '', status: 'Approve' },
  { staffId: 'B', type: 'appointment', studentId: '6512345019', datetime: '2025-07-18T14:00', topic: 'Leave request', note: '', status: 'Approve' },
  { staffId: 'B', type: 'document',    studentId: '6512345020', datetime: '2025-07-18T15:00', topic: 'Scholarship letter', note: '', status: 'Reject' },

  // 🔹 Staff C
  { staffId: 'C', type: 'appointment', studentId: '6512345021', datetime: '2025-07-15T09:00', topic: 'Activity record', note: '', status: 'Approve' },
  { staffId: 'C', type: 'document',    studentId: '6512345022', datetime: '2025-07-15T10:00', topic: 'Doc submission', note: '', status: 'Approve' },
  { staffId: 'C', type: 'appointment', studentId: '6512345023', datetime: '2025-07-16T08:00', topic: 'Activity inquiry', note: '', status: 'Pending' },
  { staffId: 'C', type: 'document',    studentId: '6512345024', datetime: '2025-07-16T09:00', topic: 'Transcript request', note: '', status: 'Approve' },
  { staffId: 'C', type: 'appointment', studentId: '6512345025', datetime: '2025-07-17T09:30', topic: 'University event', note: '', status: 'Reject' },
  { staffId: 'C', type: 'document',    studentId: '6512345026', datetime: '2025-07-17T10:30', topic: 'Activity proof', note: '', status: 'Approve' },
  { staffId: 'C', type: 'appointment', studentId: '6512345027', datetime: '2025-07-18T11:00', topic: 'Activity registration', note: '', status: 'Pending' },
  { staffId: 'C', type: 'document',    studentId: '6512345028', datetime: '2025-07-18T13:00', topic: 'Certificate', note: '', status: 'Reject' },
  { staffId: 'C', type: 'appointment', studentId: '6512345029', datetime: '2025-07-18T14:00', topic: 'Leave application', note: '', status: 'Approve' },
  { staffId: 'C', type: 'document',    studentId: '6512345030', datetime: '2025-07-18T15:00', topic: 'Letter request', note: '', status: 'Approve' },

  // 🔹 Staff D
  { staffId: 'D', type: 'appointment', studentId: '6512345031', datetime: '2025-07-15T09:00', topic: 'Assistant duty', note: '', status: 'Approve' },
  { staffId: 'D', type: 'document',    studentId: '6512345032', datetime: '2025-07-15T10:00', topic: 'Feedback report', note: '', status: 'Reject' },
  { staffId: 'D', type: 'appointment', studentId: '6512345033', datetime: '2025-07-16T08:30', topic: 'Meeting schedule', note: '', status: 'Approve' },
  { staffId: 'D', type: 'document',    studentId: '6512345034', datetime: '2025-07-16T09:30', topic: 'Doc submission', note: '', status: 'Pending' },
  { staffId: 'D', type: 'appointment', studentId: '6512345035', datetime: '2025-07-17T10:30', topic: 'Workshop signup', note: '', status: 'Approve' },
  { staffId: 'D', type: 'document',    studentId: '6512345036', datetime: '2025-07-17T11:00', topic: 'Certificate proof', note: '', status: 'Reject' },
  { staffId: 'D', type: 'appointment', studentId: '6512345037', datetime: '2025-07-18T08:00', topic: 'Volunteer hours', note: '', status: 'Pending' },
  { staffId: 'D', type: 'document',    studentId: '6512345038', datetime: '2025-07-18T09:00', topic: 'Event form', note: '', status: 'Approve' },
  { staffId: 'D', type: 'appointment', studentId: '6512345039', datetime: '2025-07-18T13:00', topic: 'System access', note: '', status: 'Reject' },
  { staffId: 'D', type: 'document',    studentId: '6512345040', datetime: '2025-07-18T14:00', topic: 'Leave request', note: '', status: 'Approve' },

  // 🔹 Staff E
  { staffId: 'E', type: 'appointment', studentId: '6512345041', datetime: '2025-07-15T09:00', topic: 'Course change', note: '', status: 'Approve' },
  { staffId: 'E', type: 'document',    studentId: '6512345042', datetime: '2025-07-15T10:00', topic: 'Course form', note: '', status: 'Approve' },
  { staffId: 'E', type: 'appointment', studentId: '6512345043', datetime: '2025-07-16T08:00', topic: 'Course registration', note: '', status: 'Reject' },
  { staffId: 'E', type: 'document',    studentId: '6512345044', datetime: '2025-07-16T09:00', topic: 'Grade proof', note: '', status: 'Approve' },
  { staffId: 'E', type: 'appointment', studentId: '6512345045', datetime: '2025-07-17T10:00', topic: 'Subject inquiry', note: '', status: 'Pending' },
  { staffId: 'E', type: 'document',    studentId: '6512345046', datetime: '2025-07-17T11:00', topic: 'Document check', note: '', status: 'Reject' },
  { staffId: 'E', type: 'appointment', studentId: '6512345047', datetime: '2025-07-18T08:00', topic: 'Schedule review', note: '', status: 'Approve' },
  { staffId: 'E', type: 'document',    studentId: '6512345048', datetime: '2025-07-18T09:00', topic: 'Request letter', note: '', status: 'Approve' },
  { staffId: 'E', type: 'appointment', studentId: '6512345049', datetime: '2025-07-18T13:00', topic: 'Intern update', note: '', status: 'Reject' },
  { staffId: 'E', type: 'document',    studentId: '6512345050', datetime: '2025-07-18T14:00', topic: 'Payment confirmation', note: '', status: 'Approve' }
  ])

  const addStaff = (staff) => {
    const id = `ID-${Date.now()}`
    staffList.value.push({ ...staff, id, active: true, avatar: '/src/assets/default.png', rating: 0 })
  }

  const editStaff = (index, updatedStaff) => {
    staffList.value[index] = { ...staffList.value[index], ...updatedStaff }
  }

  const toggleStatus = (index) => {
    staffList.value[index].active = !staffList.value[index].active
  }

  const addRating = ({ staffId, userId, serviceProvider, serviceProcess, facilities, comment }) => {
    ratings.value.push({
      staffId,
      userId,
      serviceProvider,
      serviceProcess,
      facilities,
      comment,
      timestamp: new Date().toISOString()
    })
  }

  const logService = ({ staffId, type }) => {
    usageLogs.value.push({
      staffId,
      type,
      date: new Date().toISOString().split('T')[0]
    })
  }

  const getAverageRating = (staffId) => {
    const staffRatings = ratings.value.filter(r => r.staffId === staffId)
    if (!staffRatings.length) return { serviceProvider: 0, serviceProcess: 0, facilities: 0 }

    const sum = staffRatings.reduce((acc, r) => {
      acc.serviceProvider += r.serviceProvider
      acc.serviceProcess += r.serviceProcess
      acc.facilities += r.facilities
      return acc
    }, { serviceProvider: 0, serviceProcess: 0, facilities: 0 })

    const count = staffRatings.length
    return {
      serviceProvider: +(sum.serviceProvider / count).toFixed(1),
      serviceProcess: +(sum.serviceProcess / count).toFixed(1),
      facilities: +(sum.facilities / count).toFixed(1)
    }
  }

  const avgRating = computed(() => {
    const all = ratings.value
    if (!all.length) return { serviceProvider: 0, serviceProcess: 0, facilities: 0 }

    const sum = all.reduce((acc, r) => {
      acc.serviceProvider += r.serviceProvider
      acc.serviceProcess += r.serviceProcess
      acc.facilities += r.facilities
      return acc
    }, { serviceProvider: 0, serviceProcess: 0, facilities: 0 })

    const count = all.length
    return {
      serviceProvider: +(sum.serviceProvider / count).toFixed(1),
      serviceProcess: +(sum.serviceProcess / count).toFixed(1),
      facilities: +(sum.facilities / count).toFixed(1)
    }
  })

  const getWeeklyServiceCount = (staffId, type, startDate, endDate) => {
    return usageLogs.value.filter(log =>
      log.staffId === staffId &&
      log.type === type &&
      log.date >= startDate &&
      log.date <= endDate
    ).length
  }

  const getStaffComments = (staffId) => {
    return ratings.value
      .filter(r => r.staffId === staffId)
      .map(r => ({ userId: r.userId, comment: r.comment, timestamp: r.timestamp }))
  }

  const getServiceUsage = (startDate, endDate) => {
    const dateMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' }
    const result = {}

    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const label = dateMap[d.getDay()]
      if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(label)) {
        result[label] = { appointment: 0, document: 0 }
      }
    }

    usageLogs.value.forEach(log => {
      const logDate = new Date(log.date)
      const label = dateMap[logDate.getDay()]
      if (
        log.date >= startDate &&
        log.date <= endDate &&
        result[label]
      ) {
        if (log.type === 'appointment') result[label].appointment++
        if (log.type === 'document') result[label].document++
      }
    })

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(label => ({
      day: label,
      appointment: result[label]?.appointment || 0,
      document: result[label]?.document || 0
    }))
  }

  const getHistoryByStaff = (staffId, type) => {
    return historyRecords.value
      .filter(record => record.staffId === staffId && record.type === type)
      .map((r, i) => ({
        no: `${type === 'appointment' ? 'A' : 'D'}${String(i + 1).padStart(3, '0')}`,
        studentId: r.studentId,
        datetime: formatDatetime(r.datetime),
        topic: r.topic,
        note: r.note,
        status: r.status
      }))
  }

  function formatDatetime(isoString) {
    const date = new Date(isoString)
    const day = date.toLocaleDateString('th-TH')
    const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    return `${day}\n${time}`
  }

  return {
    staffList,
    ratings,
    usageLogs,
    historyRecords,
    addStaff,
    editStaff,
    toggleStatus,
    addRating,
    logService,
    getAverageRating,
    getWeeklyServiceCount,
    getStaffComments,
    getServiceUsage,
    avgRating,
    getHistoryByStaff
  }
})
