<!-- 📁 src/components/secretary/SidebarSecretary.vue -->
<template>
  <nav class="w-64 bg-[#003366] text-white p-6 space-y-6">
    <SidebarItem icon="home" label="Homepage" to="/homepage" />
    <SidebarItem icon="clock" label="History" to="/history" />
    <SidebarItem icon="message-square" label="Feedback" to="/feedback" />
    <SidebarItem icon="log-out" label="Log out" @click="logout" />
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import SidebarItem from './SidebarItemSecretary.vue'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('userRole')
  router.push({ name: 'Login' })
}
</script>