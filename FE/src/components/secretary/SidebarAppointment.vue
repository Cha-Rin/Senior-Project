<!-- 📁 src/components/secretary/SidebarAppointment.vue -->
<template>
  <div class="flex flex-col min-h-screen w-64 bg-[#003366] text-white p-6 box-border">
    <!-- 🔹 Homepage -->
    <router-link to="/homepage" class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Homepage' }">
      <component :is="iconMap.home" class="w-5 h-5" />
      <span>Homepage</span>
    </router-link>

    <!-- 🔹 Appointment -->
    <router-link to="/appointment" class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Appointment' }">
      <component :is="iconMap.appointment" class="icon" />
      <span>Appointment</span>
    </router-link>

    <!-- 🔹 Request Appointment + badge -->
    <router-link to="/request-appointment"
      class="relative flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RequestAppointment' }">
      <component :is="iconMap.request" class="icon" />
      <span>Request Appointment</span>

      <!-- 🔴 Badge (แคป 99+) -->
      <span v-if="pendingCount > 0" class="badge" :title="`${pendingCount} pending`">
        {{ displayCount }}
      </span>
    </router-link>

    <!-- 🔹 History -->
    <router-link to="/history-appointment"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'HistoryAppointment' }">
      <component :is="iconMap.history" class="icon" />
      <span>History</span>
    </router-link>

    <!-- 🔹 Feedback -->
    <router-link to="/feedback" class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RatingAppointment' }">
      <component :is="iconMap.feedback" class="icon" />
      <span>Feedback</span>
    </router-link>

    <!-- 🔹 Logout -->
    <div class="flex items-center gap-3 p-4 mt-auto rounded-lg hover:bg-[#004080] cursor-pointer transition"
      @click="logout">
      <component :is="iconMap.logout" class="icon" />
      <span>Log out</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import {
  Home,
  Calendar,
  FileText,
  History,
  MessageSquare,
  LogOut
} from "lucide-vue-next"

const router = useRouter()

const iconMap = {
  home: Home,
  appointment: Calendar,
  request: FileText,
  history: History,
  feedback: MessageSquare,
  logout: LogOut
}

const pendingCount = ref(0)
let intervalId = null

// ✅ base URL (ถ้ามี Vite env จะใช้ค่านั้น, ไม่มีก็ใช้เส้นทาง proxy /api)
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// 🚪 Logout
const logout = () => {
  localStorage.removeItem('userRole')
  localStorage.removeItem('authToken')
  localStorage.removeItem('token')
  router.push({ name: 'Login' })
}

// 🔢 แสดงแบบ 99+
const displayCount = computed(() => (pendingCount.value > 99 ? '99+' : pendingCount.value))

// 🔔 โหลดจำนวนรายการรออนุมัติ
const fetchPendingCount = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      pendingCount.value = 0
      return
    }

    // แนะนำให้ใช้ path แบบ proxy เพื่อเลี่ยง CORS: /api/noti/...
    // ถ้าตั้ง VITE_API_BASE_URL จะกลายเป็น https://yourhost/api/noti/...
    const url = `${API_BASE}/api/noti/pending-now?user_id=${encodeURIComponent(userId)}`
    const res = await axios.get(url, {
      // ส่ง token ถ้าจำเป็น
      headers: {
        Authorization: localStorage.getItem('authToken')
          ? `Bearer ${localStorage.getItem('authToken')}`
          : undefined
      }
    })

    // รูปแบบที่รองรับ: { count: number } หรือ { success:true, count:number }
    const count = Number(res.data?.count ?? 0)
    pendingCount.value = Number.isFinite(count) && count >= 0 ? count : 0
  } catch (err) {
    console.error('❌ Error fetching pending count:', err?.response?.data || err.message)
    pendingCount.value = 0
  }
}

// ⏱️ เริ่มอัปเดตทุก 30 วินาที และหยุดเมื่อแท็บถูกซ่อน
const startPolling = () => {
  stopPolling()
  intervalId = setInterval(fetchPendingCount, 30_000)
}
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// 👀 หยุด/เริ่ม polling ตามการมองเห็นของแท็บ
const onVisibility = () => {
  if (document.hidden) stopPolling()
  else {
    fetchPendingCount()
    startPolling()
  }
}

onMounted(() => {
  fetchPendingCount()
  startPolling()
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.badge {
  position: absolute;
  right: 1.25rem;
  /* right-5 */
  top: 0.6rem;
  min-width: 1.5rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  border-radius: 9999px;
  background: #ef4444;
  /* red-500 */
  color: #fff;
  font-weight: 800;
  font-size: 0.7rem;
  /* text-xs */
  line-height: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .25);
  transform: translateY(-20%);
}
</style>
