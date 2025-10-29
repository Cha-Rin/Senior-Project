<template>
  <div class="min-h-screen bg-white flex">
    <!-- <Sidebar /> -->
    <div class="p-8 flex-1">
      <h1 class="text-2xl font-bold mb-6">History</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
  v-for="staff in staffStore.staffList"
  :key="staff.id"
  class="bg-white border rounded-xl shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition cursor-pointer"
  @click="goToHistory(staff.id)" 
>
  <img
    :src="staff.avatar"
    class="w-24 h-24 object-cover rounded-full border mb-3"
    alt="staff avatar"
  />
  <h3 class="text-lg font-semibold">{{ staff.firstName }} {{ staff.lastName }}</h3>
  <p class="text-gray-500 text-sm mb-1">{{ staff.email }}</p>
  <div>
    <button
  @click.stop="goToHistory(staff.id)"
  class="mt-2 px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
>
  View History
</button>
  </div>
</div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStaffStore } from './stores/staffStore' // ✅ แก้เป็น relative path ที่คุณใช้

const router = useRouter()
// const staffStore = useStaffStore()

// // ✅ แสดงเฉพาะ staff ที่ active
// const staffList = computed(() => staffStore.staffList.filter(s => s.active))

// // ✅ แปลง path ภาพจาก /src/assets ให้ใช้ได้จริง
// function resolveAvatar(path) {
//   if (!path) return new URL('/src/assets/default.png', import.meta.url).href
//   if (path.startsWith('/src/assets/')) {
//     return new URL(path, import.meta.url).href
//   }
//   return path
// }

const staffStore = useStaffStore()
const token = localStorage.getItem('authToken')

const resolveAvatar = (path) => {
  if (!path) return new URL('/src/assets/default.png', import.meta.url).href
  if (path.startsWith('/src/assets/')) {
    return new URL(path, import.meta.url).href
  }
  return path
}

const resolvedAvatar = computed(() => resolveAvatar(staff.value?.profile_pic))


onMounted(async () => {
  if (token) {
    await staffStore.fetchAllStaff(token)
  } else {
    console.error('❌ No token found in localStorage')
  }
})
// ✅ ไปหน้า history ตาม staff id
function goToHistory(id) {
  router.push(`/admin/history/${id}`)
}
</script>
