<template>
  <div class="min-h-screen bg-white p-8">
    <h1 class="text-2xl font-bold mb-4">History</h1>

    <!-- Staff info -->
    <div v-if="staff" class="flex items-center gap-4 mb-6">
      <img :src="avatar" alt="avatar" class="h-16 w-16 rounded-full border border-gray-300" />
      <div class="text-gray-600 text-lg">{{ staff.firstName }} {{ staff.lastNam }}</div>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-4 border-b mb-6">
      <button
        @click="activeTab = 'appointment'"
        :class="activeTab === 'appointment' ? activeTabClass : inactiveTabClass"
      >
        Appointment
      </button>
      <button
        @click="activeTab = 'document'"
        :class="activeTab === 'document' ? activeTabClass : inactiveTabClass"
      >
        Document Tracking
      </button>
    </div>

    <!-- รายการประวัติ -->
    <div class="max-w-6xl mx-auto space-y-4">
      <div v-if="activeData.length === 0" class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        No {{ activeTab }} found.
      </div>

      <div v-else v-for="item in activeData" :key="item.appointment_id" class="history-item flex items-center justify-between p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-6">
          <div class="font-bold text-lg text-indigo-700">{{ item.appointment_id }}</div>
          <div class="text-gray-700 font-medium">{{ item.studentId }}</div>
          <div class="text-gray-600 text-sm space-y-1">
            <div class="font-medium">Date: {{ formatDateTime(item.appointment_date).date }}</div>
            <div class="text-gray-500">Time: {{ formatDateTime(item.appointment_date).time }}</div>
          </div>
          <div class="text-gray-800 font-medium">{{ item.topic }}</div>
        </div>
        <div>{{ item.student_note }}</div>
        <div
          class="px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-1.5"
          :class="{
            'bg-rose-100 text-rose-800': item.status.code === 2,
            'bg-emerald-100 text-emerald-800': item.status.code === 1,
            'bg-orange-100 text-orange-800': item.status.code === 0,
            'bg-blue-100 text-blue-800': item.status.code === 3
          }"
        >
          <span v-if="item.status.code === 1">✅</span>
          <span v-else-if="item.status.code === 2">❌</span>
          <span v-else-if="item.status.code === 0">⏳</span>
          <span v-else-if="item.status.code === 3">✔️</span>
          {{ item.status.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useStaffStore } from './stores/staffStore'
import jwtDecode from 'jwt-decode'
const route = useRoute()
const staffStore = useStaffStore()

const activeTab = ref('appointment')
const staffId = ref(route.params.id || null)
const staff = computed(() => {
  const s = staffStore.staffList.find(s => s.id === Number(staffId.value))
  if (!s) return null
  return {
    ...s,
    firstName: s.firstName || s.first_name,
    lastName: s.lastName || s.last_name
  }
})
const avatar = computed(() => staff?.value?.avatar || new URL('/src/assets/default.png', import.meta.url).href)

const appointmentData = ref([])
const documentData = ref([])

const activeData = computed(() =>
  activeTab.value === 'appointment' ? appointmentData.value : documentData.value
)

const activeTabClass = 'pb-2 px-4 font-semibold text-blue-600 border-b-2 border-blue-600'
const inactiveTabClass = 'pb-2 px-4 text-gray-500 hover:text-blue-500'

// fetch history from backend
// const fetchHistory = async () => {
//   try {
//     const token = localStorage.getItem('authToken')
//     if (!token) throw new Error('No token found')

//     const res = await axios.get('http://localhost:3000/history/historyall', {
//       headers: { Authorization: `Bearer ${token}` },
//       params: { staffId: staffId.value }
//     })

//     if (res.data.success) {
//       // สำหรับตอนนี้ถือว่า API คืน appointment ทั้งหมด
//       appointmentData.value = res.data.historyItems
//       // ถ้ามี document data ให้ใส่ documentData.value = ...
//     }
//   } catch (err) {
//     console.error(err)
//   }
// }

const formatDateTime = (datetime) => {
  const d = new Date(datetime)
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (token) {
    await staffStore.fetchStaffById(staffId.value, token)
    await staffStore.fetchHistoryAll(token, staffId.value)
    appointmentData.value = staffStore.historyRecords
  }
})
</script>
