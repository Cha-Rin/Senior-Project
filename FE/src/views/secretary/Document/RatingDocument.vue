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

        <!-- 🗓️ Date Range Filter -->
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

              <!-- Calendar dropdown -->
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
                    :key="day.date.getTime()"
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

      <!-- Main Stats Card -->
      <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg flex flex-col gap-8">
        <!-- Overall rating -->
        <div class="flex items-center gap-6">
          <span class="text-5xl font-bold">
            {{ ratingsEmpty ? '0.0' : ratingsAverage }}
          </span>
          <span class="text-xl">⭐</span>
        </div>

        <!-- Charts + Comments -->
        <div class="flex flex-wrap gap-6">
          <!-- Rating Chart -->
          <div class="flex-1 min-w-[300px] bg-white text-gray-800 rounded-xl p-6 shadow">
            <div class="text-lg font-bold text-center mb-4">Rating</div>

            <template v-if="ratingsEmpty">
              <div class="text-center text-gray-500 py-16">
                ยังไม่มี feedback สำหรับช่วงเวลานี้ 😔
              </div>
            </template>

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
                <div class="w-3 h-3 rounded-sm bg-emerald-500"></div>
                <span>Staff Friendliness</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm bg-blue-500"></div>
                <span>Service Efficiency</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm bg-amber-500"></div>
                <span>Communication</span>
              </div>
            </div>

            <button
              @click="exportToExcel"
              class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Export CSV
            </button>
          </div>

          <!-- Comments -->
          <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow flex flex-col text-black">
            <div class="flex-1 overflow-y-auto pr-2 space-y-3 max-h-72">
              <div v-for="(comment, i) in comments" :key="i" class="flex gap-3 p-3 bg-white rounded-lg shadow">
                <div class="text-xl text-gray-400 flex items-center justify-center">👤</div>
                <div class="flex-1">
                  <p class="text-sm text-gray-700 leading-relaxed">{{ comment.text }}</p>
                  <div v-if="comment.stars" class="mt-1 flex items-center text-xs text-amber-600">
                    <span>{{ comment.stars }} ⭐</span>
                  </div>
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

// Avatars
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'
import userimg from '@/assets/user.png'

// 🔹 Calendar & Date State
const showCalendar = ref(false)
const startDate = ref(null)
const endDate = ref(null)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const calendarContainer = ref(null)

// 🔹 User & Rating State
const user = ref({ name: '', surname: '', avatar: '' })
const comments = ref([])

const ratings = ref({
  friendliness: 0,
  efficiency: 0,
  communication: 0
})

// 🔹 Computed: Ratings
const ratingsEmpty = computed(() =>
  (Number(ratings.value.friendliness) + 
   Number(ratings.value.efficiency) + 
   Number(ratings.value.communication)) === 0
)

const ratingsAverage = computed(() => {
  if (ratingsEmpty.value) return '0.0'
  const r = ratings.value
  const avg = (Number(r.friendliness) + Number(r.efficiency) + Number(r.communication)) / 3
  return avg.toFixed(1)
})

// 🔹 Calendar Helpers
const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString('en-US', { month: 'long' })
})

const calendarDays = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(currentYear.value, currentMonth.value, 1)
  const startDay = start.getDay() // 0 = Sun
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()

  const days = []

  // Previous month
  const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthDays - i)
    days.push(makeDayObj(date, today))
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push(makeDayObj(date, today))
  }

  // Next month
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push(makeDayObj(date, today))
  }

  return days
})

function makeDayObj(date, todayRef) {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  
  const isSel = isDateSelected(normalized)
  const isInRange = isDateInRange(normalized)
  const isToday = normalized.getTime() === todayRef.getTime()

  return {
    date: normalized,
    day: date.getDate(),
    isCurrentMonth: date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value,
    isSelected: isSel,
    isInRange,
    isToday
  }
}

// 🔹 Calendar Actions
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
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)

  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = normalized
    endDate.value = null
  } else {
    if (normalized < startDate.value) {
      endDate.value = startDate.value
      startDate.value = normalized
    } else {
      endDate.value = normalized
    }
    showCalendar.value = false
  }
}

const isDateSelected = (date) => {
  if (!startDate.value) return false
  const d = date.getTime()
  const s = startDate.value.getTime()
  const e = endDate.value ? endDate.value.getTime() : s
  return d === s || d === e
}

const isDateInRange = (date) => {
  if (!startDate.value || !endDate.value) return false
  const d = date.getTime()
  return d > startDate.value.getTime() && d < endDate.value.getTime()
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

const handleClickOutside = (event) => {
  if (calendarContainer.value && !calendarContainer.value.contains(event.target)) {
    showCalendar.value = false
  }
}

// 🔹 Avatar mapping
function getUserAvatar(userId) {
  switch (userId) {
    case 2: return Aoi
    case 4: return Lek
    case 3: return Ang
    case 6: return phum
    default: return userimg
  }
}

// 🔹 Fetch & Export
const fetchRatings = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return
    
    const decoded = jwt_decode(token)
    const staffId = Number(decoded.user_id)

    if (!staffId || !startDate.value || !endDate.value) return

    const formatDate = (d) => new Date(d).toISOString().split('T')[0]
    
    const res = await axios.get('/api/secretary/rating-Document', {
      params: {
        startDate: formatDate(startDate.value),
        endDate: formatDate(endDate.value),
        staffId
      }
    })

    if (res.data.success && res.data.data) {
      ratings.value = res.data.data.averages || { friendliness: 0, efficiency: 0, communication: 0 }
      comments.value = res.data.data.comments || []
    } else {
      resetRatings()
    }
  } catch (err) {
    console.error('❌ Failed to fetch ratings:', err)
    resetRatings()
  }
}

const resetRatings = () => {
  ratings.value = { friendliness: 0, efficiency: 0, communication: 0 }
  comments.value = []
}

const exportToExcel = () => {
  const startStr = startDate.value ? formatDateDisplay(startDate.value) : 'N/A'
  const endStr = endDate.value ? formatDateDisplay(endDate.value) : 'N/A'

  let csv = '\uFEFF'
  csv += 'สรุปผลการประเมิน,,\n'
  csv += `ช่วงเวลา,${startStr} - ${endStr},\n`
  csv += `คะแนนเฉลี่ยรวม,${ratingsAverage.value},\n`
  csv += ',,\n'
  
  csv += 'หัวข้อ,คะแนน,\n'
  csv += `Staff Friendliness,${ratings.value.friendliness},\n`
  csv += `Service Efficiency,${ratings.value.efficiency},\n`
  csv += `Communication,${ratings.value.communication},\n`
  csv += ',,\n'
  
  csv += 'ความคิดเห็น,คะแนน,\n'
  comments.value.forEach(c => {
    const text = `"${c.text.replace(/"/g, '""')}"`
    csv += `${text},${c.stars || 'N/A'},\n`
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rating_${startStr.replaceAll(' ', '_')}_to_${endStr.replaceAll(' ', '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// 🔹 Lifecycle
onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return
    
    const decoded = jwt_decode(token)
    const res = await axios.get(`/api/profile/${decoded.email}`)
    user.value = res.data
    user.value.avatar = getUserAvatar(decoded.user_id)

    // Default to current month range
    const now = new Date()
    startDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate.value = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    await fetchRatings()
    document.addEventListener('click', handleClickOutside)
  } catch (err) {
    console.error('❌ Failed to load user:', err)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 🔹 Watch date changes
watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    fetchRatings()
  }
})
</script>