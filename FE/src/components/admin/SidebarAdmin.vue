<!-- 📁 src/components/secretary/SidebarSecretary.vue -->
<template>
  <aside class="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] overflow-y-auto bg-[#003366] z-40">
  <nav class="w-64 bg-[#003366] text-white p-6 space-y-6">
 
    <!-- Dashboard -->
    <router-link to="/admin/dashboard" class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'bg-[#004080]': $route.path === '/admin/dashboard' }">
      <component :is="iconMap.home" class="w-5 h-5" />
      <span>Dashboard</span>
    </router-link>

    <!-- Management -->
    <router-link to="/admin/manage" class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'bg-[#004080]': $route.path === '/admin/manage' }">
      <component :is="iconMap.user" class="w-5 h-5" />
      <span>Management</span>
    </router-link>

    <!-- History -->
    <router-link to="/admin/staffList" class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'bg-[#004080]': $route.path === '/admin/staffList' }">
      <component :is="iconMap.clock" class="w-5 h-5" />
      <span>History</span>
    </router-link>

    <!-- Log out -->
    <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#004080] transition cursor-pointer" @click="logout">
      <component :is="iconMap['log-out']" class="w-5 h-5" />
      <span>Log out</span>
    </div>

  </nav>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  Home,
  Users,
  Clock,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()

// 🎯 ไอคอนทั้งหมดของ Sidebar
const iconMap = {
  home: Home,
  user: Users,
  clock: Clock,
  "log-out": LogOut
}

const logout = () => {
  localStorage.removeItem('userRole')
  router.push({ name: 'Login' })
}
</script>
