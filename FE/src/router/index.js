import { createRouter, createWebHistory } from 'vue-router'
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
  const role = localStorage.getItem('userRole')

  // ถ้ายังไม่ได้ login และจะเข้า page ที่ไม่ใช่ login
  if (!role && to.name !== 'Login') {
    return next({ name: 'Login' })
  }

  // ถ้า login แล้ว จะเข้า login ซ้ำ → ไปยังหน้า role แทน
  if (role && to.name === 'Login') {
    if (role == 3) return next({ name: 'PathSelect' })
    // if (role == 2) return next({ name: 'StaffDashboard' })
    // if (role == 1) return next({ name: 'AdminControl' })
    return next('/') // fallback
  }

  next()
})

export default router
