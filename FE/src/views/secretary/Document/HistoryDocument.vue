<!-- 📁 src/views/secretary/Document/HistoryDocument.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <!-- ✅ หัวข้อใช้ gradient -->
      <h1 class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        History
      </h1>

      <!-- 🔸 Date Range Selector (Week View) -->
      <div class="flex items-center gap-3 bg-violet-50 rounded-xl px-5 py-3 mb-6 border border-violet-200 shadow-sm">
        <span class="text-violet-600 text-xl">📅</span>
        <input
          type="date"
          v-model="startDate"
          @change="updateWeekRange"
          class="border border-violet-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
        <span class="text-gray-500 font-medium">–</span>
        <input
          type="date"
          v-model="endDate"
          @change="updateWeekRange"
          class="border border-violet-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
        <button
          @click="resetDate"
          class="ml-2 text-sm font-medium text-violet-600 hover:text-violet-800 underline"
        >
          Reset
        </button>
      </div>

      <!-- 🔸 Table -->
      <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <!-- ✅ Header ตารางใช้ gradient อ่อน -->
        <div class="grid grid-cols-6 px-6 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 font-bold text-indigo-800 border-b border-gray-200">
          <div>No</div>
          <div>ID</div>
          <div>Date</div>
          <div>Topic</div>
          <div>Status</div>
          <div>File</div>
        </div>

        <div
          v-for="item in filteredHistory"
          :key="item.no"
          class="grid grid-cols-6 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div class="font-bold text-gray-900">{{ item.no }}</div>
          <div class="text-gray-700">{{ item.studentId }}</div>
          <div class="text-gray-700">{{ formatDate(item.date) }}</div>
          <div class="text-gray-800 font-medium">{{ item.topic }}</div>
          <div class="flex items-center gap-1.5">
            <span
              v-if="item.status === 'Complete'"
              class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800"
            >
              <span>✅</span>
              <span class="ml-1">Complete</span>
            </span>
            <span
              v-else-if="item.status === 'Reject'"
              class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-rose-100 text-rose-800"
            >
              <span>❌</span>
              <span class="ml-1">Reject</span>
            </span>
            <span v-else class="text-gray-500 text-sm">—</span>
          </div>
          <div class="flex justify-center">
            <button
              @click="viewFile(item)"
              class="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm hover:shadow-md"
              title="View File"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- กรณีไม่มีข้อมูล -->
        <div
          v-if="filteredHistory.length === 0"
          class="text-center py-10 text-gray-500 bg-gray-50 border-t border-dashed border-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          No documents found in selected week.
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
  {
    no: 'A001',
    studentId: '65xxxxxxxx',
    date: '2025-04-21',
    topic: 'Course registration',
    status: 'Complete',
    fileUrl: '/files/req-A001.pdf'
  },
  {
    no: 'A002',
    studentId: '65xxxxxxxx',
    date: '2025-04-22',
    topic: 'Course registration',
    status: 'Reject',
    fileUrl: '/files/receipt-A002.png'
  },
  {
    no: 'A003',
    studentId: '65xxxxxxxx',
    date: '2025-04-23',
    topic: 'Course registration',
    status: 'Complete',
    fileUrl: '/files/req-A003.pdf'
  },
  {
    no: 'A004',
    studentId: '65xxxxxxxx',
    date: '2025-04-24',
    topic: 'Advising session',
    status: 'Reject',
    fileUrl: '/files/req-A004.pdf'
  },
  {
    no: 'A005',
    studentId: '65xxxxxxxx',
    date: '2025-04-25',
    topic: 'Internship approval',
    status: 'Reject',
    fileUrl: '/files/req-A005.pdf'
  }
])

// ตัวแปรสำหรับเลือกวัน
const startDate = ref('2025-04-21')
const endDate = ref('2025-04-25')

// ฟังก์ชันคำนวณวันจันทร์และศุกร์ของสัปดาห์ที่เลือก
const getWeekStartEnd = (date) => {
  const d = new Date(date)
  const day = d.getDay() // 0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // ปรับให้เป็นจันทร์
  const start = new Date(d)
  start.setDate(diff)
  const end = new Date(start)
  end.setDate(end.getDate() + 4) // จันทร์ + 4 วัน = ศุกร์
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

// อัปเดตช่วงวันเป็นสัปดาห์เมื่อเลือกวัน
const updateWeekRange = () => {
  if (!startDate.value || !endDate.value) return
  const week = getWeekStartEnd(startDate.value)
  startDate.value = week.start
  endDate.value = week.end
}

// รีเซ็ต
const resetDate = () => {
  startDate.value = '2025-04-21'
  endDate.value = '2025-04-25'
}

// กรองประวัติตามช่วงวันที่ (สัปดาห์)
const filteredHistory = computed(() => {
  if (!startDate.value || !endDate.value) return history.value
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return history.value.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= start && itemDate <= end
  })
})

// ฟอร์แมตวันที่ให้เป็น DD/MM/YY (เช่น 21/04/25)
const formatDate = (isoDate) => {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

// ดูไฟล์
const viewFile = (item) => {
  if (!item?.fileUrl) return
  window.open(item.fileUrl, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>