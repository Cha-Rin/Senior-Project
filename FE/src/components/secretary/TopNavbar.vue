<template>
  <div
    class="fixed top-0 left-0 w-full z-50 bg-[#003366] text-white px-4 py-2 shadow-md flex items-center justify-between"
  >
    <!-- 🔹 โลโก้ -->
    <div class="flex items-center space-x-3">
      <img src="@/assets/logo.jpg" alt="logo" class="h-8" />
    </div>

    <!-- 🔹 ด้านขวา -->
    <div class="flex items-center space-x-4">
      <!-- 🔔 Notification -->
<div class="relative">
  <button
    @click="togglePopover"
    class="h-10 px-4 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>

    <span
      v-if="activeStore.activeCount > 0"
      class="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
    >
      {{ activeStore.activeCount }}
    </span>
  </button>

  <!-- Popup -->
  <div
    v-if="isPopoverOpen"
    class="absolute right-0 mt-2 w-72 md:w-80 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
  >
    <div class="py-2 px-4 border-b border-gray-200 font-bold">
      รายการรอดำเนินการ ({{ activeStore.activeCount }})
    </div>

    <ul class="max-h-80 overflow-y-auto">
      <li
        v-if="activeStore.activeCount === 0"
        class="p-4 text-center text-gray-500"
      >
        ไม่มีการแจ้งเตือน
      </li>

      <li
  v-for="app in activeStore.activeList"
  :key="app.id"
  class="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
>
  <div class="mb-2">
    <div class="flex justify-between">
      <span class="font-semibold">{{ app.name }}</span>
      <span class="text-sm text-gray-600">{{ app.topic }}</span>
    </div>

    <!-- 🟦 เพิ่ม ID นัดหมาย -->
    <div class="text-xs text-gray-500 mt-1">
      <strong>ID:</strong> {{ app.id }}
    </div>

    <!-- ⏰ เพิ่มเวลา (ถ้ามี) -->
    <div class="text-xs text-gray-500">
      <strong>เวลา:</strong> {{ app.time || '-' }}
    </div>
  </div>

  <div class="flex justify-end space-x-2">
    <button
      @click="activeStore.markDone(app.id)"
      class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
    >
      สำเร็จการนัดหมาย
    </button>

    <button
      @click="activeStore.cancel(app.id)"
      class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
    >
      ปฏิเสธ
    </button>
  </div>
</li>

    </ul>
  </div>
</div>


      <!-- 👩‍💼 ชื่อผู้ใช้ -->
      <p class="text-sm font-semibold hidden sm:block">
        👩‍💼 <strong>{{ userFullName }}</strong>
      </p>

      <!-- 🌐 ปุ่มเปลี่ยนภาษา -->
      <button @click="toggleLang" class="text-xs font-bold">
        {{ currentLang === 'th' ? 'EN / TH' : 'TH / EN' }}
      </button>

      <!-- 🚪 Logout -->
      <button
        @click="logout"
        class="w-10 h-10 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="w-6 h-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5m0 0l-5-5m5 5H3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActiveNotificationStore } from '@/stores/useActiveNotificationStore.js'
import axios from 'axios'
import jwt_decode from 'jwt-decode'

const router = useRouter()
const currentLang = ref('th')
const activeStore = useActiveNotificationStore()
const isPopoverOpen = ref(false)

// ✅ user object ที่ใช้ใน template
const user = ref({
  id: null,
  name: '',
  surname: '',
  avatar: ''
})

// ✅ ชื่อเต็ม (fallback เป็น Guest)
const userFullName = computed(() => {
  const n = (user.value.name || '').trim()
  const s = (user.value.surname || '').trim()
  const full = `${n} ${s}`.trim()
  return full || 'Guest'
})
onMounted(() => {
  const token = localStorage.getItem("authToken")
  if (!token) return

  const decoded = jwt_decode(token)
  const userId = decoded.user_id

  activeStore.fetchActiveAppointments(userId)
  setInterval(() => activeStore.fetchActiveAppointments(userId), 15000)
})

// 🌐 เปลี่ยนภาษา
function toggleLang() {
  currentLang.value = currentLang.value === 'th' ? 'en' : 'th'
}

// 🔔 toggle popover
const togglePopover = () => {
  isPopoverOpen.value = !isPopoverOpen.value
}

// 📦 mock/fallback: สร้าง avatar ง่าย ๆ จาก userId
function getUserAvatar(userId) {
  // ปรับให้เข้ากับระบบจริงได้ เช่น ดึงจาก CDN/Backend
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userId || 'MFU'}`
}

// 🧩 no-op ป้องกัน error อ้างอิงฟังก์ชันที่ยังไม่ใส่
async function fetchDropdownOptions () { /* intentionally empty */ }
async function fetchRatings () { /* intentionally empty */ }

// 🚀 โหลดโปรไฟล์ผู้ใช้
onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (token) {
      const decoded = jwt_decode(token)
      const userId = Number(decoded.user_id)
      if (!Number.isNaN(userId)) {
        const res = await axios.get(`/api/profile/${userId}`)
        user.value = {
          id: userId,
          name: res.data?.name || '',
          surname: res.data?.surname || '',
          avatar: res.data?.avatar || getUserAvatar(userId)
        }
      }
    }

    // ✅ Fallback: ถ้าไม่มี token หรือโหลดไม่สำเร็จ ให้ใช้ localStorage
    if (!user.value.name && !user.value.surname) {
      const name = localStorage.getItem('name') || ''
      const surname = localStorage.getItem('surname') || ''
      user.value = {
        id: null,
        name,
        surname,
        avatar: getUserAvatar(null)
      }
    }

    // ⭐️ เรียกฟังก์ชันเพิ่มเติม (เป็น no-op ปัจจุบัน)
    await fetchDropdownOptions()
    await fetchRatings()
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', err)
    // Fallback ซ้ำอีกชั้น
    const name = localStorage.getItem('name') || ''
    const surname = localStorage.getItem('surname') || ''
    user.value = {
      id: null,
      name,
      surname,
      avatar: getUserAvatar(null)
    }
  }
})
// โหลด active notification ทันที
onMounted(() => {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  const decoded = jwt_decode(token);
  const secretaryId = decoded.user_id; 

  activeStore.fetchActiveAppointments(secretaryId);

  // รีเฟรชทุก 15 วิ
  setInterval(() => {
    activeStore.fetchActiveAppointments(secretaryId);
  }, 15000);
});

// 🚪 Logout ออกจากระบบ
const logout = () => {
  localStorage.clear()
  router.push({ name: 'Login' })
}
</script>
