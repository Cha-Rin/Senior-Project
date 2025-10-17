// 📁 src/router/secretary.js
import Homepage from '@/views/secretary/Homepage.vue'
import Appointment from '@/views/secretary/Appointment/Appointment.vue'
import RequestAppointment from '@/views/secretary/Appointment/RequestAppointment.vue'
import HistoryAppointment from '@/views/secretary/Appointment/HistoryAppointment.vue'
import RatingAppointment from '@/views/secretary/Appointment/RatingAppointment.vue'
import RequestDocument from '@/views/secretary/Document/RequestDocument.vue'
import HistoryDocument from '@/views/secretary/Document/HistoryDocument.vue'
import RatingDocument from '@/views/secretary/Document/RatingDocument.vue'
import Status from '@/views/secretary/Document/Status.vue'

export default [
  {
    path: '/homepage',
    name: 'Homepage',
    component: Homepage
  },
  {
    path: '/appointment',
    name: 'Appointment',
    component: Appointment
  },
  {
    path: '/request-appointment',
    name: 'RequestAppointment',
    component: RequestAppointment,
    props: (route) => ({
      topic: route.query.topic,
      date: route.query.date,
      time: route.query.time
    })
  },
  {
    path: '/history',
    name: 'HistoryAppointment',
    component: HistoryAppointment
  },
  {
    path: '/feedback', // ✅ เปลี่ยนจาก '/rating-appointment' → '/feedback'
    name: 'RatingAppointment',
    component: RatingAppointment
  },
  {
    path: '/request-document',
    name: 'RequestDocument',
    component: RequestDocument
  },
  {
    path: '/history-document',
    name: 'HistoryDocument',
    component: HistoryDocument
  },
  {
    path: '/rating-document',
    name: 'RatingDocument',
    component: RatingDocument
  },
  {
    path: '/status',
    name: 'Status',
    component: Status
  }
]