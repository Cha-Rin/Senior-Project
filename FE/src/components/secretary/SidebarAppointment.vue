<!-- 📁 src/components/secretary/SidebarAppointment.vue -->
<template>
  <div class="sidebar-appointment">
    <router-link to="/homepage" class="menu-item" :class="{ active: $route.name === 'Homepage' }">
      <span class="icon">🏠</span>
      Homepage
    </router-link>
    <router-link to="/appointment" class="menu-item" :class="{ active: $route.name === 'Appointment' }">
      <span class="icon">📅</span>
      Appointment
    </router-link>
    <router-link to="/request-appointment" class="menu-item" :class="{ active: $route.name === 'RequestAppointment' }">
      <span class="icon">📝</span>
      Request Appointment
    </router-link>
    <router-link to="/history" class="menu-item" :class="{ active: $route.name === 'HistoryAppointment' }">
      <span class="icon">🕒</span>
      History
    </router-link>
    <router-link to="/feedback" class="menu-item" :class="{ active: $route.name === 'RatingAppointment' }">
      <span class="icon">💬</span>
      Feedback
    </router-link>
    <div class="menu-item" @click="logout">
      <span class="icon">🚪</span>
      Log out
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('userRole')
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.sidebar-appointment {
  background: #003366;
  color: white;
  width: 250px;
  height: 100vh;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.menu-item {
  padding: 1rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background 0.2s;
  position: relative;
}

.menu-item:hover {
  background: #004080;
}

.menu-item.active {
  background: #003366;
  border-bottom: 3px solid #3b82f6;
  padding-bottom: 0.75rem;
}

.icon {
  font-size: 1.2rem;
}
</style>