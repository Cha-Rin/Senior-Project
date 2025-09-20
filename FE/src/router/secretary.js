import { createRouter, createWebHistory } from 'vue-router'
import Login from '../Login.vue'
// Layouts
import Appointment from '@/views/secretary/Appointment/Appointment.vue'

export default [
  { path: '/Appointment', name: 'Appointment', component: Appointment }, 
 
]


