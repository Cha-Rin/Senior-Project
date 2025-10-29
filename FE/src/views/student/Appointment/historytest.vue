<template>
    <Historyshere />
  <!-- <div class="page-content px-4 sm:px-8 pb-10 py-8">
    <h1
      class="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent pt-6 sm:pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2"
    >
      <span>History</span>
      <WeekPicker @weekSelected="onWeekChange" />
    </h1>

    
    <div
      class="bg-violet-50 rounded-xl px-4 py-3 sm:px-5 sm:py-3 mb-6 border border-violet-200 shadow-sm"
    >
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <span class="text-violet-600 text-xl">📅</span>
        <div class="relative w-full sm:w-auto" ref="calendarContainer">
          <div
            @click="toggleCalendar"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 min-w-[200px] sm:min-w-[240px]"
          >
            <span v-if="startDate && endDate" class="truncate text-sm sm:text-base">
              {{ formatDateDisplay(startDate) }} – {{ formatDateDisplay(endDate) }}
            </span>
            <span v-else class="text-gray-500 text-sm sm:text-base">Choose date range</span>
          </div>

          
          <div
            v-if="showCalendar"
            class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-72 sm:w-80"
          >
            <div class="flex justify-between items-center mb-3">
              <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded">‹</button>
              <span class="font-medium text-sm sm:text-base">
                {{ currentMonthName }} {{ currentYear }}
              </span>
              <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 rounded">›</button>
            </div>

            <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>

            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="day in calendarDays"
                :key="day.date"
                :class="[
                  'h-8 flex items-center justify-center rounded-md text-xs sm:text-sm cursor-pointer select-none',
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
              <button
                @click="resetDate"
                class="text-sm font-medium text-violet-600 hover:text-violet-800 underline"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="max-w-6xl mx-auto space-y-3 sm:space-y-4">
      <div
        v-if="filteredHistory.length === 0"
        class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300"
      >
        <p class="text-sm sm:text-base">No appointments found in selected date range.</p>
      </div>

      <div
        v-else
        v-for="item in filteredHistory"
        :key="item.appointment_id"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 p-4 sm:p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
      >
        <div class="flex flex-wrap items-center gap-3 sm:gap-6">
          <div class="font-bold text-indigo-700 text-base sm:text-lg">
            {{ item.appointment_id }}
          </div>
          <div class="text-gray-700 font-medium text-sm sm:text-base">
            {{ item.topic }}
          </div>
          <div class="text-gray-600 text-xs sm:text-sm space-y-0.5 sm:space-y-1">
            <div>Date: {{ formatDateTime(item.appointment_date).date }}</div>
            <div class="text-gray-500">Time: {{ formatDateTime(item.appointment_date).time }}</div>
          </div>
          <div class="items-center">{{ item.student_note }}</div>
        </div>

        <div
          class="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full flex items-center gap-1.5 w-fit self-start sm:self-auto"
          :class="{
            'bg-rose-100 text-rose-800': item.status === 2,
            'bg-emerald-100 text-emerald-800': item.status === 1,
            'bg-gray-100 text-gray-700': item.status === 0
          }"
        >
          <span v-if="item.status === 1">✅</span>
          <span v-else-if="item.status === 2">❌</span>
          {{ mapStatus(item.status) }}
        </div>
      </div>
    </div>
  </div> -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WeekPicker from '@/components/secretary/weekpicker.vue'
import Historyshere from '../../../layouts/Shared/Historyshere.vue'
// --- State ---
// const history = ref([])
// const startDate = ref('')
// const endDate = ref('')
// const showCalendar = ref(false)
// const currentMonth = ref(new Date().getMonth())
// const currentYear = ref(new Date().getFullYear())
// const calendarContainer = ref(null)

// // --- Utils ---
// const formatDateDisplay = (dateStr) => {
//   if (!dateStr) return ''
//   const d = new Date(dateStr)
//   return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
// }

// const formatDateTime = (isoDate) => {
//   if (!isoDate) return '-'
//   const d = new Date(isoDate.replace(' ', 'T'))
//   return {
//     date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`,
//     time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
//   }
// }

// // --- Calendar ---
// const toggleCalendar = () => (showCalendar.value = !showCalendar.value)

// const changeMonth = (offset) => {
//   currentMonth.value += offset
//   if (currentMonth.value < 0) { currentMonth.value = 11; currentYear.value-- }
//   else if (currentMonth.value > 11) { currentMonth.value = 0; currentYear.value++ }
// }

// const selectDate = (date) => {
//   if (!startDate.value) startDate.value = date
//   else if (!endDate.value || date < startDate.value) {
//     endDate.value = startDate.value
//     startDate.value = date
//   } else endDate.value = date
// }

// const createDayObj = (date, isCurrentMonth) => {
//   const dateStr = date.toISOString().slice(0, 10)
//   const isSelected = dateStr === startDate.value || dateStr === endDate.value
//   const isInRange = startDate.value && endDate.value && dateStr >= startDate.value && dateStr <= endDate.value
//   const isToday = dateStr === new Date().toISOString().slice(0, 10)
//   return { day: date.getDate(), date: dateStr, isCurrentMonth, isSelected, isInRange, isToday }
// }

// const calendarDays = computed(() => {
//   const days = []
//   const firstDay = new Date(currentYear.value, currentMonth.value, 1)
//   const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
//   const startDayOfWeek = firstDay.getDay()

//   for (let i = 0; i < startDayOfWeek; i++) {
//     const prevDate = new Date(firstDay)
//     prevDate.setDate(firstDay.getDate() - (startDayOfWeek - i))
//     days.push(createDayObj(prevDate, false))
//   }

//   for (let d = 1; d <= lastDay.getDate(); d++) {
//     days.push(createDayObj(new Date(currentYear.value, currentMonth.value, d), true))
//   }

//   const total = days.length
//   const remaining = 42 - total
//   for (let i = 1; i <= remaining; i++) {
//     const nextDate = new Date(lastDay)
//     nextDate.setDate(lastDay.getDate() + i)
//     days.push(createDayObj(nextDate, false))
//   }

//   return days
// })

// const currentMonthName = computed(() =>
//   new Date(currentYear.value, currentMonth.value).toLocaleString('default', { month: 'long' })
// )

// // --- Filter ---
// const filteredHistory = computed(() => {
//   if (!startDate.value || !endDate.value) return history.value
//   const start = new Date(startDate.value + 'T00:00:00')
//   const end = new Date(endDate.value + 'T23:59:59')
//   return history.value.filter(item => {
//     const d = new Date(item.appointment_date.replace(' ', 'T'))
//     return d >= start && d <= end
//   })
// })

// // --- Map Status ---
// function mapStatus(status) {
//   switch (Number(status)) {
//     case 0: return 'Pending'
//     case 1: return 'Approve'
//     case 2: return 'Reject'
//     default: return 'Unknown'
//   }
// }

// // --- Load Data ---
// onMounted(async () => {
//   const token = localStorage.getItem('authToken')
//   const userId = localStorage.getItem('userId')
//   if (!userId) return

//   try {
//     const res = await fetch(`http://localhost:3000/student/history`, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     })
//     const data = await res.json()
//     console.log('📥 API:', data)
//     if (data.success && Array.isArray(data.historyItems)) {
//       history.value = data.historyItems
//       if (history.value.length) resetDate()
//     } else {
//       history.value = []
//     }
//   } catch (err) {
//     console.error('❌ Fetch error:', err)
//   }
// })

// // --- Reset Date ---
// const resetDate = () => {
//   if (!history.value.length) { startDate.value = ''; endDate.value = ''; return }
//   const dates = history.value.map(i => new Date(i.appointment_date.replace(' ', 'T')))
//   startDate.value = new Date(Math.min(...dates)).toISOString().slice(0, 10)
//   endDate.value = new Date(Math.max(...dates)).toISOString().slice(0, 10)
//   showCalendar.value = false
// }

// // --- Handle outside click ---
// const handleClickOutside = (e) => {
//   if (calendarContainer.value && !calendarContainer.value.contains(e.target)) {
//     showCalendar.value = false
//   }
// }
// onMounted(() => document.addEventListener('click', handleClickOutside))
// onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// // --- WeekPicker ---
// const onWeekChange = ([start, end]) => {
//   startDate.value = start
//   endDate.value = end
// }
</script>
