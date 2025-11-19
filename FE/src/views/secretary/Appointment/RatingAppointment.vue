<template>
  <SecreLayout>
    <div class="p-8 min-h-screen bg-gray-50">
      <!-- Header Bar -->
      <div class="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow">
        <div class="flex items-center gap-4">
          <img :src="user.avatar" alt="User Avatar" class="w-12 h-12 rounded-full" />
          <div class="text-gray-800">
            <span class="block text-sm text-gray-500">Name</span>
            <strong>{{ `${user.name} ${user.surname}` }}</strong>
          </div>
        </div>

        <!-- ✅ Date Range Filter (แทน Semester/Year) -->
        <div class="bg-violet-50 rounded-xl px-5 py-3 border border-violet-200 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-violet-600 text-xl">📅</span>
            <div class="relative" ref="calendarContainer">
              <div
                @click="toggleCalendar"
                class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 min-w-[260px]"
              >
                <span v-if="startDate && endDate">
                  {{ formatDateDisplay(startDate) }} – {{ formatDateDisplay(endDate) }}
                </span>
                <span v-else class="text-gray-500">Choose date range</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-gray-500 ml-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <!-- ปฏิทิน -->
              <div
                v-if="showCalendar"
                class="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-80"
              >
                <div class="flex justify-between items-center mb-3">
                  <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded text-lg">‹</button>
                  <span class="font-medium">{{ currentMonthName }} {{ currentYear }}</span>
                  <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 rounded text-lg">›</button>
                </div>

                <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
                  <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                </div>

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

                <div class="mt-3 flex justify-between">
                  <button
                    @click="selectTodayRange()"
                    class="text-sm font-medium text-gray-600 hover:text-gray-800"
                    title="เลือกเฉพาะวันนี้"
                  >
                    Today
                  </button>
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
      </div>

      <!-- Main Card -->
      <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg flex flex-col gap-8">
        <!-- Overall Rating -->
        <div class="flex items-center gap-6">
          <span class="text-5xl font-bold">
            {{ ratingsEmpty ? '0.0' : ratingsAverage }}
          </span>
        </div>

        <!-- Content Row -->
        <div class="flex flex-wrap gap-6">
          <!-- Chart Container -->
          <div class="flex-1 min-w-[300px] bg-white text-gray-800 rounded-xl p-6 shadow">
            <div class="text-lg font-bold text-center mb-4">Rating</div>

            <!-- Empty state -->
            <template v-if="ratingsEmpty">
              <div class="text-center text-gray-500 py-16">
                ยังไม่มี feedback สำหรับช่วงเวลานี้ 😔
              </div>
            </template>

            <!-- BarChart -->
            <template v-else>
              <Barchart
                :labels="['Staff Friendliness', 'Service Efficiency', 'Communication']"
                :data="[ratings.friendliness, ratings.efficiency, ratings.communication]"
                :colors="['#10b981', '#3b82f6', '#f59e0b']"
              />
            </template>

            <!-- Legend -->
            <div class="flex flex-wrap justify-center gap-6 mt-4 text-xs">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm" style="background:#10b981"></div>
                <span>Staff Friendliness</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm" style="background:#3b82f6"></div>
                <span>Service Efficiency</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm" style="background:#f59e0b"></div>
                <span>Communication</span>
              </div>
            </div>

            <button 
              @click="exportToExcel" 
              class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Export
            </button>
          </div>

          <!-- Comments Container -->
          <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow flex flex-col text-black">
            <div class="flex-1 overflow-y-auto pr-2 space-y-3 max-h-72">
              
              <div v-for="(comment, i) in comments" :key="i" class="flex gap-3 p-3 bg-white rounded-lg shadow">
                <div class="text-xl text-gray-400 flex items-center justify-center">👤</div>
                <div class="flex-1">
                  <p class="text-sm text-gray-700 leading-relaxed">{{ comment.text }}</p>
                </div>
              </div>

              <div v-if="comments.length === 0" class="text-center text-gray-400 pt-16">
                ไม่มีคอมเมนต์ในช่วงเวลานี้
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import Barchart from '@/components/secretary/Barchart.vue'

import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'
import userimg from '@/assets/user.png'

// ✅ Calendar states
const showCalendar = ref(false)
const startDate = ref(null)
const endDate = ref(null)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const calendarContainer = ref(null)

function getUserAvatar(userId) {
  switch (userId) {
    case 2: return Aoi
    case 4: return Lek
    case 3: return Ang
    case 6: return phum
    default: return userimg
  }
}

const user = ref({ name: '', surname: '', avatar: '' })
const comments = ref([])

// Ratings state
const ratings = ref({
  friendliness: 0,
  efficiency: 0,
  communication: 0
})

// Computed empty state
const ratingsEmpty = computed(() =>
  (Number(ratings.value.friendliness) + 
   Number(ratings.value.efficiency) + 
   Number(ratings.value.communication)) === 0
)

// Computed average
const ratingsAverage = computed(() => {
  if (ratingsEmpty.value) return '0.0'
  const r = ratings.value
  const f = Number(r.friendliness) || 0
  const e = Number(r.efficiency) || 0
  const c = Number(r.communication) || 0
  return ((f + e + c) / 3).toFixed(1)
})

// ✅ Calendar computed properties
const currentMonthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long' })
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0)
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month days
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevLastDay.getDate() - i)
    days.push({
      date: date,
      day: date.getDate(),
      isCurrentMonth: false,
      isSelected: isDateSelected(date),
      isInRange: isDateInRange(date),
      isToday: date.getTime() === today.getTime()
    })
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push({
      date: date,
      day: i,
      isCurrentMonth: true,
      isSelected: isDateSelected(date),
      isInRange: isDateInRange(date),
      isToday: date.getTime() === today.getTime()
    })
  }

  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      date: date,
      day: i,
      isCurrentMonth: false,
      isSelected: isDateSelected(date),
      isInRange: isDateInRange(date),
      isToday: date.getTime() === today.getTime()
    })
  }

  return days
})

// ✅ Calendar functions
const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const changeMonth = (delta) => {
  currentMonth.value += delta
  if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value++
  } else if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value--
  }
}

const selectDate = (date) => {
  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = date
    endDate.value = null
  } else {
    if (date < startDate.value) {
      endDate.value = startDate.value
      startDate.value = date
    } else {
      endDate.value = date
    }
    showCalendar.value = false
  }
}

const isDateSelected = (date) => {
  if (!startDate.value) return false
  const dateTime = date.getTime()
  const startTime = startDate.value.getTime()
  const endTime = endDate.value ? endDate.value.getTime() : startTime
  return dateTime === startTime || dateTime === endTime
}

const isDateInRange = (date) => {
  if (!startDate.value || !endDate.value) return false
  const dateTime = date.getTime()
  return dateTime > startDate.value.getTime() && dateTime < endDate.value.getTime()
}

const formatDateDisplay = (date) => {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const selectTodayRange = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  startDate.value = today
  endDate.value = today
  showCalendar.value = false
}

const resetDate = () => {
  startDate.value = null
  endDate.value = null
  showCalendar.value = false
}

// ✅ Close calendar on outside click
const handleClickOutside = (event) => {
  if (calendarContainer.value && !calendarContainer.value.contains(event.target)) {
    showCalendar.value = false
  }
}

// Fetch user profile
onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return
    
    const decoded = jwt_decode(token)
    const email = decoded.email
    
    const res = await axios.get(`/api/profile/${email}`)
    user.value = res.data
    user.value.avatar = getUserAvatar(decoded.user_id)
    
    // ✅ Set default date range (current month)
    const today = new Date()
    startDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
    endDate.value = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    await fetchRatings()
    
    // ✅ Add event listener for outside click
    document.addEventListener('click', handleClickOutside)
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', err)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// ✅ Fetch ratings function
const fetchRatings = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return
    
    const decoded = jwt_decode(token)
    const staffId = Number(decoded.user_id)

    if (!staffId || !startDate.value || !endDate.value) {
      console.warn('ข้อมูลไม่ครบ')
      return
    }

    // ✅ Format dates to YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date)
      return d.toISOString().split('T')[0]
    }

    const res = await axios.get('/api/secretary/rating-Appointment', {
      params: { 
        startDate: formatDate(startDate.value),
        endDate: formatDate(endDate.value),
        staffId: staffId
      }
    })
    
    console.log('📊 Raw rating data from backend:', res.data.data)

    if (res.data.success && res.data.data) {
      ratings.value = res.data.data.averages
      comments.value = res.data.data.comments
    } else {
      ratings.value = { friendliness: 0, efficiency: 0, communication: 0 }
      comments.value = []
    }
  } catch (err) {
    console.error('Failed to fetch ratings:', err)
    ratings.value = { friendliness: 0, efficiency: 0, communication: 0 }
    comments.value = []
  }
}

const exportToExcel = () => {
  console.log('Exporting to Excel...')

  const start = formatDateDisplay(startDate.value)
  const end = formatDateDisplay(endDate.value)
  const r = ratings.value
  const avg = ratingsAverage.value

  let csvContent = '\uFEFF'

  csvContent += 'สรุปผลการประเมิน\n'
  csvContent += `ช่วงเวลา,${start} - ${end}\n`
  csvContent += `คะแนนเฉลี่ยรวม,${avg}\n\n`

  csvContent += 'ข้อมูลกราฟ (คะแนนเฉลี่ยรายข้อ)\n'
  csvContent += 'หัวข้อ,คะแนน\n'
  csvContent += `Staff Friendliness,${r.friendliness}\n`
  csvContent += `Service Efficiency,${r.efficiency}\n`
  csvContent += `Communication,${r.communication}\n\n`

  csvContent += 'ความคิดเห็นทั้งหมด\n'
  csvContent += 'ความคิดเห็น,คะแนน(ถ้ามี)\n'
  
  comments.value.forEach(comment => {
    const text = `"${comment.text.replace(/"/g, '""')}"`
    const stars = comment.stars || 'N/A'
    csvContent += `${text},${stars}\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `rating_export_${start.replace(/\s/g, '_')}_to_${end.replace(/\s/g, '_')}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// ✅ Watch date changes
watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    fetchRatings()
  }
})
</script>