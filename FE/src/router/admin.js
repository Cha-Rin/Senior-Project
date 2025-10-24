import MainLayout from '@/layouts/admin/MainLayout.vue'
import Dashboard from '@/views/admin/DashboardView.vue'
import HistoryPage from '../views/admin/HistoryPage.vue'

export default [
  {
    path: '/admin',
    component: MainLayout,
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      {
          path: '/history',
          name: 'History',
          component: HistoryPage
        },
      {
  path: 'staff-rating/:id',
  name: 'StaffRatingView',
  component: () => import('@/views/admin/StaffRatingView.vue'),
  props: true
}

    ],
  },
]
