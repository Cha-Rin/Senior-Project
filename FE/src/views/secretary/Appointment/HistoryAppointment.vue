<!-- 📁 src/views/secretary/HistoryAppointment.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        History
        <WeekPicker @weekSelected="onWeekChange" />
      </h1>

      <!-- ตัวเลือกช่วงวันที่แบบใหม่ -->
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
                <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded"></button>
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
              <div class="text-gray-500">Time: {{ formatDateTime(item.appointment_date).time }}</div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import WeekPicker from '@/components/secretary/weekpicker.vue'

// ข้อมูลประวัติ
const history = ref([])

// วันที่เลือก
const startDate = ref('')
const endDate = ref('')

// ควบคุมการแสดงปฎิทิน
const showCalendar = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const calendarContainer = ref(null)

// ========== ฟังก์ชันแสดงผลวันที่ ==========
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// ========== จัดการปฎิทิน ==========
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
  // ไม่ปิดทันที เพื่อให้เลือกช่วงได้ต่อ
}

const calendarDays = computed(() => {
  const days = []
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

  // วันก่อนหน้า
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevDate = new Date(firstDayOfMonth)
    prevDate.setDate(prevDate.getDate() - (startDayOfWeek - i))
    days.push(createDayObj(prevDate, false))
  }

  // วันในเดือนนี้
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const dateObj = new Date(currentYear.value, currentMonth.value, day)
    days.push(createDayObj(dateObj, true))
  }

  // เติมให้ครบ 42 วัน (6 สัปดาห์)
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
  const start = new Date(startDate.value + 'T00:00:00')
  const end = new Date(endDate.value + 'T23:59:59')
  return history.value.filter(item => {
    const d = new Date(item.appointment_date.replace(' ', 'T'))
    return d >= start && d <= end
  })
})

// ========== รีเซ็ตวันที่ ==========
const resetDate = () => {
  if (history.value.length === 0) {
    startDate.value = ''
    endDate.value = ''
  } else {
    const dates = history.value.map(i => new Date(i.appointment_date.replace(' ', 'T')))
    startDate.value = new Date(Math.min(...dates)).toISOString().slice(0, 10)
    endDate.value = new Date(Math.max(...dates)).toISOString().slice(0, 10)
  }
  showCalendar.value = false
}

// ========== ฟอร์แมตวันที่สำหรับรายการ ==========
const formatDateTime = (isoDate) => { 
  if (!isoDate) return '-'
  const d = new Date(isoDate.replace(' ', 'T'))
  if (isNaN(d)) return '-'

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` }
}

// ========== WeekPicker ==========
const onWeekChange = ([start, end]) => {
  startDate.value = start
  endDate.value = end
}

// ========== โหลดข้อมูล ==========
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  const userId = localStorage.getItem('userId')
  if (!userId) return

  try {
    const res = await fetch(`http://localhost:3000/secretary/historyAppointment?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    history.value = data.historyItems || []
    if (history.value.length) resetDate()
  } catch (err) {
    console.error('❌ Fetch error:', err)
  }
})

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