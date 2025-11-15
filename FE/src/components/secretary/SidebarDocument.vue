<template>
  <div class="flex flex-col min-h-screen w-64 bg-[#003366] text-white p-6 box-border">

    <!-- 🏠 Homepage -->
    <router-link to="/homepage"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Homepage' }">
      <component :is="iconMap.home" class="w-5 h-5" />
      <span>Homepage</span>
    </router-link>

    <!-- 📝 Request Document -->
    <router-link to="/request-document"
      class="relative flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RequestDocument' }">
      <component :is="iconMap.request" class="w-5 h-5" />
      <span>Request Document</span>

      <!-- 🔴 Badge -->
      <span v-if="requestDocs > 0" class="badge-bottom" :title="`${requestDocs} pending requests`">
        {{ displayRequests }}
      </span>
    </router-link>

    <!-- ✅ Document Status -->
    <router-link to="/status" class="relative flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Status' }">
      <component :is="iconMap.status" class="w-5 h-5" />
      <span>Document Status</span>
      <!-- 🔴 Badge -->
      <span v-if="statusDocs > 0" class="badge-bottom" :title="`${statusDocs} total documents`">
        {{ displayStatus }}
      </span>
    </router-link>

    <!-- 🕒 History -->
    <router-link to="/history-document"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'HistoryDocument' }">
      <component :is="iconMap.history" class="icon" />
      <span>History</span>
    </router-link>

    <!-- 💬 Feedback -->
    <router-link to="/rating-document"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RatingDocument' }">
      <component :is="iconMap.feedback" class="icon" />
      <span>Feedback</span>
    </router-link>

    <!-- 🚪 Log out -->
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
import { FileCheck } from 'lucide-vue-next'
import {
  Home,
  FileText,
  Clock, 
  MessageSquare,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()

const iconMap = {
  home: Home,
  request: FileText,
  document: FileText,
  history: Clock,
  status: FileCheck, 
  feedback: MessageSquare,
  logout: LogOut
}


const requestDocs = ref(0)
const statusDocs = ref(0)
let intervalId = null

// ✅ base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 🚪 Logout
const logout = () => {
  localStorage.removeItem('userRole')
  localStorage.removeItem('authToken')
  localStorage.removeItem('token')
  router.push({ name: 'Login' })
}

// 🔢 แสดงแบบ 99+
const displayRequests = computed(() => (requestDocs.value > 99 ? '99+' : requestDocs.value))
const displayStatus = computed(() => (statusDocs.value > 99 ? '99+' : statusDocs.value))

// 🔔 ดึงจำนวน Request Document (เฉพาะของเลขาคนนั้น)
const fetchRequestDocs = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    const res = await axios.get(`${API_BASE}/api/noti/request-documents?user_id=${userId}`)
    requestDocs.value = res.data?.count || 0
  } catch (err) {
    console.error('❌ Error fetching request documents:', err)
    requestDocs.value = 0
  }
}

// 🔔 ดึงจำนวน Document Status (เฉพาะของเลขาคนนั้น)
const fetchStatusDocs = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    const res = await axios.get(`${API_BASE}/api/noti/document-status?user_id=${userId}`)
    statusDocs.value = res.data?.count || 0
  } catch (err) {
    console.error('❌ Error fetching status documents:', err)
    statusDocs.value = 0
  }
}

// ⏱ โหลดครั้งแรก + อัปเดตทุก 30 วิ
onMounted(() => {
  fetchRequestDocs()
  fetchStatusDocs()
  intervalId = setInterval(() => {
    fetchRequestDocs()
    fetchStatusDocs()
  }, 30000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
/* 🔴 badge มุมขวาล่าง */
.badge-bottom {
  position: absolute;
  bottom: 0.4rem;
  right: 0.7rem;
  min-width: 1.5rem;
  height: 1.3rem;
  padding: 0 0.3rem;
  border-radius: 9999px;
  background: #ef4444;
  color: #fff;
  font-weight: 800;
  font-size: 0.7rem;
  line-height: 1.3rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .25);
}
</style>
