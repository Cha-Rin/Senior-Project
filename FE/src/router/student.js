import { createRouter, createWebHistory } from 'vue-router'
//-------------------------------- Student --------------------------------
import Login from '../Login.vue'
// Layouts
import AppointmentLayout from '../layouts/student/AppointmentLayout.vue'
import FeedbackLayout from '../layouts/student/FeedbackLayout.vue'
import DocumentLayout from '../layouts/student/DocumentLayout.vue'
// Views
import PathSelect from '../views/student/PathSelect.vue'
// Appointment pages
import ChooseTopic from '../views/student/Appointment/ChooseTopic.vue'
import CreateAppointment from '../views/student/Appointment/CreateApp.vue'
import ConfirmAppointment from '../views/student/Appointment/ConfirmApp.vue'
import CheckStatus from '../views/student/Appointment/CheckStatusApp.vue'
import HistoryAppointment from '../views/student/Appointment/HistoryAppointment.vue'
// Document pages
import TopicTracking from '../views/student/Document/TopicTracking.vue'
import CheckStatusdoc from '../views/student/Document/CheckStatus.vue'
import HistoryDocument from '../views/student/Document/HistoryDocument.vue'
// Feedback pages
import FeedbackForm from '../components/student/Feedback.vue'
import AppointmentsFeedback from '../views/student/AppointmentsFeedback.vue'
import DocumentsFeedback from '../views/student/DocumentsFeedback.vue'

export default [
  { path: '/student/path', name: 'PathSelect', component: PathSelect },

  {
    path: '/student/appointment',
    component: AppointmentLayout,
    children: [
      { path: 'topic', name: 'ChooseTopic', component: ChooseTopic },
      { path: 'create', name: 'CreateAppointment', component: CreateAppointment },
      { path: 'confirm', name: 'ConfirmAppointment', component: ConfirmAppointment },
      { path: 'check', name: 'CheckStatusApp', component: CheckStatus },
      { path: 'history', name: 'HistoryApp', component: HistoryAppointment }
    ]
  },

  {
    path: '/student/document',
    component: DocumentLayout,
    children: [
      { path: 'topictrack', name: 'TopicTrack', component: TopicTracking },
      { path: 'check', name: 'CheckStatusDoc', component: CheckStatusdoc },
      { path: 'history', name: 'HistoryDoc', component: HistoryDocument }
    ]
  },

  {
    path: '/student/feedback',
    component: FeedbackLayout,
    children: [
      { path: '', name: 'Feedback', component: FeedbackForm },
      { path: 'appointments', name: 'AppointmentsFeedback', component: AppointmentsFeedback },
      { path: 'documents', name: 'DocumentsFeedback', component: DocumentsFeedback }
    ]
  }
]


