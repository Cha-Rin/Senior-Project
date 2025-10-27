<!-- 📁 src/views/secretary/HistoryAppointment.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        History
      </h1>

      <!-- ตัวเลือกช่วงวันที่ -->
      <div class="flex items-center gap-3 bg-violet-50 rounded-xl px-5 py-3 mb-6 border border-violet-200 shadow-sm">
        <span class="text-violet-600 text-xl">📅</span>
        <input type="date" v-model="startDate" class="border border-violet-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
        <span class="text-gray-500 font-medium">–</span>
        <input type="date" v-model="endDate" class="border border-violet-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
        <button @click="resetDate" class="ml-2 text-sm font-medium text-violet-600 hover:text-violet-800 underline">Reset</button>
      </div>

      <!-- รายการประวัติ -->
      <div class="max-w-6xl mx-auto space-y-4">
        <div v-if="filteredHistory.length === 0" class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          No appointments found in selected date range.
        </div>

        <div v-else v-for="item in filteredHistory" :key="item.appointment_id" class="history-item flex items-center justify-between p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-6">
            <div class="font-bold text-lg text-indigo-700">{{ item.appointment_id }}</div>
            <div class="text-gray-700 font-medium">{{ item.studentId }}</div>
            <div class="text-gray-600 text-sm space-y-1">
              <div class="font-medium">Date: {{ formatDateTime(item.appointment_date).date }}</div>
              <div class="text-gray-500">Time:{{ formatDateTime(item.appointment_date).time }}</div>
            </div>
            <div class="text-gray-800 font-medium">{{ item.topic }}</div>
          </div>
          <div>{{ item.student_note }}</div>
          <div
              class="px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-1.5"
              :class="{
                'bg-rose-100 text-rose-800': item.status === 2,
                'bg-emerald-100 text-emerald-800': item.status === 1
              }"
            >
              <span v-if="item.status === 1">✅</span>
              <span v-else-if="item.status === 2">❌</span>
              {{ item.status === 1 ? 'Approve' : 'Reject' }}
            </div>
            
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
// พี่อ้อย งานทะเบียน 4
const history = ref([]) // เริ่มต้นเป็น array ว่าง

const startDate = ref('')
const endDate = ref('')

// กรองประวัติตามวันที่
const filteredHistory = computed(() => {
  if (!startDate.value || !endDate.value) return history.value
  const start = new Date(startDate.value + 'T00:00:00') // เพิ่มเวลาเริ่มต้นวัน
  const end = new Date(endDate.value + 'T23:59:59')     // เพิ่มเวลาเสร็จสิ้นวัน
  return history.value.filter(item => {
    const d = new Date(item.appointment_date.replace(' ', 'T')) // แปลง "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS"
    return d >= start && d <= end
  })
})


// รีเซ็ตวันที่
const resetDate = () => {
  if (history.value.length === 0) return
  const dates = history.value.map(i => new Date(i.appointment_date.replace(' ', 'T')))
  startDate.value = new Date(Math.min(...dates)).toISOString().slice(0,10)
  endDate.value = new Date(Math.max(...dates)).toISOString().slice(0,10)
}


// แสดงวันที่
const formatDateTime = (isoDate) => { 
  if (!isoDate) return '-'
  const d = new Date(isoDate)
  if (isNaN(d)) return '-'

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` }
}


// โหลดข้อมูลจาก API
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  const userId = localStorage.getItem('userId')
  if (!userId) return

  try {
    const res = await fetch(`http://localhost:3000/secretary/historyAppointment?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    console.log('📥 API response:', data)
    history.value = data.historyItems || []
    // history.value = data
    if (history.value.length) resetDate()
  } catch (err) {
    console.error('❌ Fetch error:', err)
  }
})
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>