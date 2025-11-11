import MainLayout from '@/layouts/admin/MainLayout.vue'
import Dashboard from '@/views/admin/DashboardView.vue'
import StaffManager from '@/views/admin/StaffManager.vue'
import HistoryPage from '@/views/admin/HistoryPage.vue'
import StaffList from '@/views/admin/StaffList.vue'

export default [
  {
    path: '/admin',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'manage',
        name: 'StaffManager',
        component: StaffManager
      },
      {
        path: 'staffList',
        name: 'StaffList',
        component: StaffList
      },
      {
        path: 'history',
        name: 'History',
        component: HistoryPage
      },
      {
        path: 'staff-rating/:id',
        name: 'StaffRatingView',
        component: () => import('@/views/admin/StaffRatingView.vue'),
        props: true
      },
      {
        path: '/admin/history/:id',
        name: 'History',
        component: () => import('@/views/admin/HistoryPage.vue'),
        props: true  // ✅ ให้ส่ง id เป็น prop เข้าไปได้
},

    ]
  }
]
