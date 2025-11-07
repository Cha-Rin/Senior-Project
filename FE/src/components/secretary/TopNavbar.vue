<template>
  <div class="fixed top-0 left-0 w-full z-50 bg-[#003366] text-white px-4 py-2 shadow-md flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <img src="@/assets/logo.jpg" alt="logo" class="h-8" />
    </div>

    <div class="flex items-center space-x-4">
      
      <div class="relative">
        <button
          @click="togglePopover"
          class="h-10 px-4 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          
          <span
            v-if="notificationStore.hasPending"
            class="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ notificationStore.pendingCount }}
          </span>
        </button>

        <div
          v-if="isPopoverOpen"
          class="absolute right-0 mt-2 w-72 md:w-80 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div class="py-2 px-4 border-b border-gray-200 font-bold">
            รายการรอดำเนินการ ({{ notificationStore.pendingCount }})
          </div>
          
          <ul class="max-h-80 overflow-y-auto">
            <li v-if="!notificationStore.hasPending" class="p-4 text-center text-gray-500">
              ไม่มีการแจ้งเตือน
            </li>
            
            <li
              v-for="app in notificationStore.pendingAppointments"
              :key="app.id"
              class="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold">{{ app.name }}</span>
                <span class="text-sm text-gray-600">{{ app.time }}</span>
              </div>
              <div class="flex justify-end space-x-2">
                <button
                  @click="notificationStore.approveAppointment(app.id)"
                  class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  สำเร็จการนัดหมาย
                </button>
                <button
                  @click="notificationStore.rejectAppointment(app.id)"
                  class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  ปฏิเสธ
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- <button @click="toggleLang" class="text-xs font-bold">
        {{ currentLang === 'th' ? 'EN / TH' : 'TH / EN' }}
      </button> -->
      
      <button
        @click="logout"
        class="w-10 h-10 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13.5 7.5L10.5 10.75M13.5 7.5L10.5 4.5M13.5 7.5L4 7.5M8 13.5H1.5L1.5 1.5L8 1.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const currentLang = ref('th')

const notificationStore = useNotificationStore()
const isPopoverOpen = ref(false)

function toggleLang() {
  currentLang.value = currentLang.value === 'th' ? 'en' : 'th'
}

const logout = () => {
  localStorage.removeItem('userRole')
  router.push({ name: 'Login' })
}

const togglePopover = () => {
  isPopoverOpen.value = !isPopoverOpen.value
}
</script>