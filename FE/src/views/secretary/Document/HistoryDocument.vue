<!-- 📁 src/views/secretary/Document/HistoryDocument.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <!-- ✅ หัวข้อใช้ gradient -->
      <h1 class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        History
      </h1>

      <!-- 🔸 Date Range Selector (แบบใหม่ — เหมือน HistoryAppointment.vue) -->
      <div class="bg-violet-50 rounded-xl px-5 py-3 mb-6 border border-violet-200 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="text-violet-600 text-xl">📅</span>
          <div class="relative" ref="calendarContainer">
            <!-- ช่องแสดงผลรวม -->
            <div 
              @click="toggleCalendar"
              class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 min-w-[240px]"
            >
              <span v-if="startDate && endDate">
                {{ formatDateDisplay(startDate) }} – {{ formatDateDisplay(endDate) }}
              </span>
              <span v-else class="text-gray-500">Choose date range</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7l4-4m0 0l4 4m-4-4v18" />
              </svg>
            </div>

            <!-- ปฎิทิน dropdown -->
            <div v-if="showCalendar" class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-80">
              <div class="flex justify-between items-center mb-3">
                <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded"><</button>
                <span class="font-medium">{{ currentMonthName }} {{ currentYear }}</span>
                <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 rounded">></button>
              </div>

              <!-- หัวตารางวันในสัปดาห์ -->
              <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>

              <!-- ตารางวัน -->
              <div class="grid grid-cols-7 gap-1">
                <div 
                  v-for="day in calendarDays" 
                  :key="day.date" 
                  :class="[
                    'h-8 flex items-center justify-center rounded-md text-sm cursor-pointer',
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                    day.isSelected ? 'bg-indigo-600 text-white' : '',
                    day.isInRange ? 'bg-indigo-100' : '',
                    day.isToday ? 'border border-indigo-500' : ''
                  ]"
                  @click="selectDate(day.date)"
                >
                  {{ day.day }}
                </div>
              </div>

              <div class="mt-3 flex justify-end">
                <button @click="resetDate" class="text-sm font-medium text-violet-600 hover:text-violet-800 underline">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔸 Table -->
      <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <!-- ✅ Header ตารางใช้พื้นหลังสีม่วงอ่อน (เหมือนภาพ) -->
        <div class="grid grid-cols-6 px-6 py-4 bg-indigo-50 font-semibold text-indigo-800 border-b border-gray-200">
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
          <div class="flex items-center">
            <span
              v-if="item.status === 'Complete'"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </span>
            <span
              v-else-if="item.status === 'Reject'"
              class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-red-100 text-red-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </span>
            <span v-else class="text-gray-500 text-sm">—</span>
          </div>
          <div class="flex justify-center">
            <button
              @click="viewFile(item)"
              class="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors shadow-sm"
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
          No documents found in selected date range.
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// วันที่เลือก
const startDate = ref('2025-04-21')
const endDate = ref('2025-04-25')

// ควบคุมปฎิทิน
const showCalendar = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const calendarContainer = ref(null)

// ========== ฟังก์ชันช่วย ==========
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const changeMonth = (offset) => {
  currentMonth.value += offset
  if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value--
  } else if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value++
  }
}

const selectDate = (date) => {
  if (!startDate.value) {
    startDate.value = date
  } else if (!endDate.value || date < startDate.value) {
    endDate.value = startDate.value
    startDate.value = date
  } else {
    endDate.value = date
  }
}

const calendarDays = computed(() => {
  const days = []
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDayOfWeek = firstDayOfMonth.getDay()

  for (let i = 0; i < startDayOfWeek; i++) {
    const prevDate = new Date(firstDayOfMonth)
    prevDate.setDate(prevDate.getDate() - (startDayOfWeek - i))
    days.push(createDayObj(prevDate, false))
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const dateObj = new Date(currentYear.value, currentMonth.value, day)
    days.push(createDayObj(dateObj, true))
  }

  const total = days.length
  const remaining = 42 - total
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(lastDayOfMonth)
    nextDate.setDate(nextDate.getDate() + i)
    days.push(createDayObj(nextDate, false))
  }

  return days
})

const createDayObj = (date, isCurrentMonth) => {
  const dateStr = date.toISOString().slice(0, 10)
  const isSelected = dateStr === startDate.value || dateStr === endDate.value
  const isInRange = startDate.value && endDate.value && dateStr >= startDate.value && dateStr <= endDate.value
  const isToday = dateStr === new Date().toISOString().slice(0, 10)

  return {
    day: date.getDate(),
    date: dateStr,
    isCurrentMonth,
    isSelected,
    isInRange,
    isToday
  }
}

const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('default', { month: 'long' })
})

// ========== กรองประวัติ ==========
const filteredHistory = computed(() => {
  if (!startDate.value || !endDate.value) return history.value
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return history.value.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= start && itemDate <= end
  })
})

// ========== รีเซ็ตวันที่ ==========
const resetDate = () => {
  startDate.value = '2025-04-21'
  endDate.value = '2025-04-25'
  showCalendar.value = false
}

// ========== ฟอร์แมตวันที่สำหรับตาราง ==========
const formatDate = (isoDate) => {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

// ========== ดูไฟล์ ==========
const viewFile = (item) => {
  if (!item?.fileUrl) return
  window.open(item.fileUrl, '_blank', 'noopener,noreferrer')
}

// ========== จัดการ click นอกปฎิทิน ==========
const handleClickOutside = (event) => {
  if (calendarContainer.value && !calendarContainer.value.contains(event.target)) {
    showCalendar.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>