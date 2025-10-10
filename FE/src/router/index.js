import { createRouter, createWebHistory } from 'vue-router'
import jwt_decode from 'jwt-decode'
import Login from '@/Login.vue'

// import routes จาก role ต่างๆ
import studentRoutes from './student'
import secretaryRoutes from './secretary'
import adminRoutes from './admin'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  ...studentRoutes,
  ...secretaryRoutes,
  ...adminRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


//-------------------------------- Navigation Guard เอาไว้ท้ายสุดของโค้ด --------------------------------
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken')
  const role = localStorage.getItem('userRole')

  // 🕒 ตรวจสอบว่า token หมดอายุหรือยัง
  if (token) {
    try {
      const decoded = jwt_decode(token)
      const now = Date.now() / 1000 // แปลงเป็นวินาที

      if (decoded.exp && decoded.exp < now) {
        // ❌ หมดอายุแล้ว
        localStorage.removeItem('authToken')
        localStorage.removeItem('userRole')
        return next({ name: 'Login' })
      }
    } catch (err) {
      console.error('Token decode error:', err)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      return next({ name: 'Login' })
    }
  }

  // 🧱 ถ้าไม่มี token และหน้า requireAuth → กลับไป login
  if (!token && to.meta.requiresAuth) {
    return next({ name: 'Login' })
  }

  // 🔒 ถ้ายังไม่ได้ login และจะเข้า page ที่ไม่ใช่ login
  if (!role && to.name !== 'Login') {
    return next({ name: 'Login' })
  }

  // 🚫 ถ้า login แล้ว แต่พยายามเข้า /login ซ้ำ
  if (role && to.name === 'Login') {
    if (role == 3) return next({ name: 'PathSelect' })
    if (role == 2) return next({ name: 'Appointment' })
    if (role == 1) return next({ name: 'Dashboard' })
    return next('/')
  }

  next()
})


export default router
