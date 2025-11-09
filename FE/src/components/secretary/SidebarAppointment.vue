<!-- 📁 src/components/secretary/SidebarAppointment.vue -->
<template>
  <div class="flex flex-col min-h-screen w-64 bg-[#003366] text-white p-6 box-border">
    <!-- 🔹 Homepage -->
    <router-link
      to="/homepage"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Homepage' }"
    >
      <span class="text-xl">🏠</span>
      Homepage
    </router-link>

    <!-- 🔹 Appointment -->
    <router-link
      to="/appointment"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Appointment' }"
    >
      <span class="text-xl">📅</span>
      Appointment
    </router-link>

    <!-- 🔹 Request Appointment + badge -->
    <router-link
      to="/request-appointment"
      class="relative flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RequestAppointment' }"
    >
      <span class="text-xl">📝</span>
      <span>Request Appointment</span>

      <!-- 🔴 Badge -->
      <span
        v-if="pendingCount > 0"
        class="absolute right-5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
      >
        {{ pendingCount }}
      </span>
    </router-link>

    <!-- 🔹 History -->
    <router-link
      to="/history-appointment"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'HistoryAppointment' }"
    >
      <span class="text-xl">🕒</span>
      History
    </router-link>

    <!-- 🔹 Feedback -->
    <router-link
      to="/feedback"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RatingAppointment' }"
    >
      <span class="text-xl">💬</span>
      Feedback
    </router-link>

    <!-- 🔹 Logout -->
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
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const pendingCount = ref(0)
let intervalId = null

// 🚪 Logout
const logout = () => {
  localStorage.removeItem('userRole')
  localStorage.removeItem('authToken')
  router.push({ name: 'Login' })
}

// 🔔 ฟังก์ชันโหลดจำนวนรายการรออนุมัติ
const fetchPendingCount = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) return

    const res = await axios.get(`http://localhost:3000/api/noti/pending-now?user_id=${userId}`)
    pendingCount.value = res.data?.count || 0
  } catch (err) {
    console.error('❌ Error fetching pending count:', err)
    pendingCount.value = 0
  }
}

// 🕒 โหลดครั้งแรก + ตั้ง interval ทุก 30 วิ
onMounted(() => {
  fetchPendingCount()
  intervalId = setInterval(fetchPendingCount, 30000)
})

// 🧹 เคลียร์ interval ตอนออกจากหน้า
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
