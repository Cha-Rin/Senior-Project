<template>
  <nav class="w-64 bg-[#003366] text-white p-6 space-y-4 h-screen flex flex-col">
    <div class="space-y-2 flex-1">
      <SidebarItem icon="🏠" label="Homepage" to="/homepage" />
      <SidebarItem icon="🕒" label="History" to="/history" />
      <SidebarItem icon="💬" label="Feedback" to="/feedback" />
    </div>

    <SidebarItem icon="🚪" label="Log out" @click="logout" />
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import SidebarItem from './SidebarItemSecretary.vue'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('userRole')
  localStorage.removeItem('authToken')
  router.push({ name: 'Login' })
}
</script>
