<template>
  <div class="min-h-screen bg-white flex">
    <Sidebar />
    <div class="p-8 flex-1">
      <h1 class="text-2xl font-bold mb-6">History</h1>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="staff in staffList"
          :key="staff.id"
          @click="goToHistory(staff.id)"
          class="cursor-pointer p-4 bg-gray-100 rounded shadow hover:bg-gray-200"
        >
          <img :src="resolveAvatar(staff.avatar)" alt="staff" class="h-20 w-20 rounded-full mx-auto mb-2" />
          <p class="text-center font-semibold">{{ staff.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStaffStore } from '../stores/staffStore' // ✅ แก้เป็น relative path ที่คุณใช้
import Sidebar from '../components/Sidebar.vue'       // ✅ ใช้ path ตามภาพของคุณ

const router = useRouter()
const staffStore = useStaffStore()

// ✅ แสดงเฉพาะ staff ที่ active
const staffList = computed(() => staffStore.staffList.filter(s => s.active))

// ✅ แปลง path ภาพจาก /src/assets ให้ใช้ได้จริง
function resolveAvatar(path) {
  if (!path) return new URL('/src/assets/default.png', import.meta.url).href
  if (path.startsWith('/src/assets/')) {
    return new URL(path, import.meta.url).href
  }
  return path
}

// ✅ ไปหน้า history ตาม staff id
function goToHistory(id) {
  router.push(`/history/${id}`)
}
</script>
