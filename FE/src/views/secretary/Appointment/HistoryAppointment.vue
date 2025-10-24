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
        <input
          type="date"
          v-model="startDate"
          class="border border-violet-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
        <span class="text-gray-500 font-medium">–</span>
        <input
          type="date"
          v-model="endDate"
          class="border border-violet-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
        <button
          @click="resetDate"
          class="ml-2 text-sm font-medium text-violet-600 hover:text-violet-800 underline"
        >
          Reset
        </button>
      </div>

      <!-- รายการประวัติ -->
      <div class="max-w-6xl mx-auto space-y-4">
        <div
          v-for="item in filteredHistory"
          :key="item.no"
          class="flex items-center justify-between p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center gap-6">
            <div class="font-bold text-lg text-indigo-700">{{ item.no }}</div>
            <div class="text-gray-700 font-medium">{{ item.studentId }}</div>
            <div class="text-gray-600 text-sm space-y-1">
              <div class="font-medium">Date: {{ formatDate(item.date) }}</div>
              <div class="text-gray-500">Time: {{ item.time }}</div>
            </div>
            <div class="text-gray-800 font-medium">{{ item.topic }}</div>
          </div>
          <div
            class="px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-1.5"
            :class="{
              'bg-rose-100 text-rose-800': item.status === 'Reject',
              'bg-emerald-100 text-emerald-800': item.status === 'Approve'
            }"
          >
            <span v-if="item.status === 'Approve'">✅</span>
            <span v-else>❌</span>
            {{ item.status }}
          </div>
        </div>

        <!-- กรณีไม่มีข้อมูล -->
        <div
          v-if="filteredHistory.length === 0"
          class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          No appointments found in selected date range.
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

// ข้อมูลประวัติ (ใช้รูปแบบ ISO: YYYY-MM-DD)
const history = ref([
  { no: 'A001', studentId: '65xxxxxxxx', date: '2025-04-21', time: '8:00 - 9:00AM', topic: 'Course registration', status: 'Reject' },
  { no: 'A002', studentId: '65xxxxxxxx', date: '2025-04-22', time: '9:00 - 10:00AM', topic: 'Course registration', status: 'Approve' },
  { no: 'A003', studentId: '65xxxxxxxx', date: '2025-04-23', time: '10:00 - 11:00AM', topic: 'Course registration', status: 'Reject' },
  { no: 'A004', studentId: '65xxxxxxxx', date: '2025-04-24', time: '11:00 - 12:00PM', topic: 'Advising session', status: 'Approve' },
  { no: 'A005', studentId: '65xxxxxxxx', date: '2025-04-25', time: '1:00 - 2:00PM', topic: 'Internship approval', status: 'Reject' }
])

// วันที่เริ่มต้นและสิ้นสุด (ค่าเริ่มต้น: 21-25 APR 2025)
const startDate = ref('2025-04-21')
const endDate = ref('2025-04-25')

// กรองประวัติตามช่วงวันที่
const filteredHistory = computed(() => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return history.value.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= start && itemDate <= end
  })
})

// รีเซ็ตเป็นช่วงวันเริ่มต้น
const resetDate = () => {
  startDate.value = '2025-04-21'
  endDate.value = '2025-04-25'
}

// ฟอร์แมตวันที่ให้เป็น DD/MM/YY (เช่น 21/04/25)
const formatDate = (isoDate) => {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>