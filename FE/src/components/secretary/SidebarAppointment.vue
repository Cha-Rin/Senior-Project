<!-- 📁 src/components/secretary/SidebarAppointment.vue -->
<template>
  <div class="flex flex-col min-h-screen w-64 bg-[#003366] text-white p-6 box-border ">
    <router-link
      to="/homepage"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Homepage' }"
    >
      <span class="text-xl">🏠</span>
      Homepage
    </router-link>

    <router-link
      to="/appointment"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Appointment' }"
    >
      <span class="text-xl">📅</span>
      Appointment
    </router-link>

    <router-link
      to="/request-appointment"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RequestAppointment' }"
    >
      <span class="text-xl">📝</span>
      Request Appointment
    </router-link>

    <router-link
      to="/history"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'HistoryAppointment' }"
    >
      <span class="text-xl">🕒</span>
      History
    </router-link>

    <router-link
      to="/feedback"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RatingAppointment' }"
    >
      <span class="text-xl">💬</span>
      Feedback
    </router-link>

    <div
      class="flex items-center gap-3 p-4 mt-auto rounded-lg hover:bg-[#004080] cursor-pointer transition"
      @click="logout"
    >
      <span class="text-xl">🚪</span>
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
