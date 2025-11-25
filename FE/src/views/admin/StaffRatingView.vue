<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow">
      <div class="flex items-center gap-4">
        <img :src="resolvedAvatar" alt="Staff Avatar" class="w-16 h-16 rounded-full object-cover border" />
        <div class="text-gray-800 text-lg">
          <span class="block text-sm text-gray-500">Name</span>
          <strong>{{ staffName }}</strong>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="flex items-center gap-4">
        <div class="bg-violet-50 rounded-xl px-5 py-3 border border-violet-200 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-violet-600 text-xl">📅</span>
            <div class="relative" ref="calendarContainer">

              <!-- Display selected range -->
              <div
                @click="toggleCalendar"
                class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 min-w-[260px]"
              >
                <span v-if="startDate && endDate">
                  {{ formatDateDisplay(startDate) }} – {{ formatDateDisplay(endDate) }}
                </span>
                <span v-else class="text-gray-500">Choose date range</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 ml-auto" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>

              <!-- Calendar Popup -->
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
                  <button @click="selectTodayRange" class="text-sm font-medium text-gray-600 hover:text-gray-800">
                    Today
                  </button>
                  <button @click="resetDate" class="text-sm font-medium text-violet-600 hover:text-violet-800 underline">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Back Button -->
        <button
          @click="$router.push('/admin/dashboard')"
          class="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-4 border-b mb-6">
      <button
        @click="activeTab = 'appointment'; fetchRatings(); fetchComments();"
        :class="activeTab === 'appointment' ? activeTabClass : inactiveTabClass"
      >
        Appointment
      </button>

      <button
        @click="activeTab = 'document'; fetchRatings(); fetchComments();"
        :class="activeTab === 'document' ? activeTabClass : inactiveTabClass"
      >
        Document Tracking
      </button>
    </div>

    <!-- Main -->
    <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg">
      <div v-if="loading" class="text-center py-10 text-gray-200">Loading data...</div>

      <div v-else>
        <!-- Average Score -->
        <div class="flex items-center gap-4 mb-8">
          <span class="text-5xl font-bold">{{ averageScore }}</span>
          <div class="flex text-2xl">
            <span v-for="i in 5" :key="i"
              :class="{ 'text-yellow-400': i <= starLevel, 'text-gray-400': i > starLevel }">★</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-6">
          <!-- Rating Chart -->
          <div class="flex-1 min-w-[350px] bg-white rounded-xl p-6 shadow text-gray-800">
            <WeeklyUsersChart
              v-if="ratingChart"
              :chartData="ratingChart"
              :title="activeTab === 'appointment' ? 'Appointment Rating' : 'Document Rating'"
            />
          </div>

          <!-- Comments -->
          <div class="flex-1 min-w-[350px] bg-gray-100 rounded-xl p-6 shadow">
            <h3 class="text-lg font-semibold text-black mb-3">Comments</h3>

            <div v-if="comments.length === 0" class="text-gray-500 text-sm text-center">
              ไม่มีคอมเมนต์ในระบบนี้
            </div>

            <div v-else class="max-h-72 overflow-y-auto pr-2 space-y-3">
              <div
                v-for="(comment, i) in comments"
                :key="i"
                class="flex gap-3 p-4 bg-white rounded-lg shadow-sm"
              >
                <div class="text-2xl text-gray-500">👤</div>
                <div class="flex-1">
                  <div class="flex text-yellow-400 mb-1 text-base">
                    <span v-for="j in 5" :key="j"
                      :class="{ 'text-yellow-400': j <= comment.stars, 'text-gray-300': j > comment.stars }">★</span>
                  </div>
                  <p class="text-sm text-gray-700 leading-snug">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import WeeklyUsersChart from '@/components/admin/dashboard/WeeklyUsersChart.vue'

/* -------------------------
   Staff Info
--------------------------*/
const route = useRoute()
const staffId = route.params.id
const staffName = route.query.name || 'ไม่ระบุชื่อ'
const resolvedAvatar = route.query.avatar || new URL('/src/assets/default.png', import.meta.url).href

/* -------------------------
   Calendar State
--------------------------*/
const showCalendar = ref(false)
const startDate = ref(null)
const endDate = ref(null)

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const calendarContainer = ref(null)

/* -------------------------
   Tab State
--------------------------*/
const activeTab = ref('appointment')
const activeTabClass = 'pb-2 px-4 font-semibold text-blue-600 border-b-2 border-blue-600'
const inactiveTabClass = 'pb-2 px-4 text-gray-500 hover:text-blue-500'

/* -------------------------
   Rating & Comments
--------------------------*/
const ratings = ref({ service_provider: 0, service_process: 0, facilities: 0 })
const comments = ref([])
const loading = ref(true)
const ratingChart = ref(null)

/* -------------------------
   Average Score
--------------------------*/
const averageScore = computed(() => {
  const avg = ((+ratings.value.service_provider + +ratings.value.service_process + +ratings.value.facilities) / 3).toFixed(1)
  return isNaN(avg) ? 0 : avg
})

const starLevel = computed(() => Math.round(averageScore.value))

/* -------------------------
   Fetch Rating
--------------------------*/
const fetchRatings = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/admin/staff/${staffId}/rating`, {
      params: {
          start_date: startDate.value
          ? startDate.value.toISOString().split("T")[0]
          : null,
          end_date: endDate.value
          ? endDate.value.toISOString().split("T")[0]
          : null,
        type: activeTab.value
      }
    })

    if (res.data.success) {
      const r = res.data.data

      ratings.value = {
        service_provider: +r.service_provider || 0,
        service_process: +r.service_process || 0,
        facilities: +r.facilities || 0
      }

      ratingChart.value = {
        labels: ['Service Provider', 'Service Process', 'Facilities'],
        datasets: [
          {
            label: 'Average Rating',
            data: [
              ratings.value.service_provider,
              ratings.value.service_process,
              ratings.value.facilities
            ],
            backgroundColor: ['#3b82f6', '#facc15', '#ec4899']
          }
        ]
      }
    }
  } catch (err) {
    console.error('❌ Error fetching staff rating:', err)
  } finally {
    loading.value = false
  }
}

/* -------------------------
   Fetch Comments
--------------------------*/
const fetchComments = async () => {
  try {
    const res = await axios.get(`/api/admin/staff/${staffId}/comments`, {
      params: {
        type: activeTab.value,
        start_date: startDate.value
          ? startDate.value.toISOString().split("T")[0]
          : null,
          end_date: endDate.value
          ? endDate.value.toISOString().split("T")[0]
          : null
      }
    })

    if (res.data.success) {
      comments.value = res.data.data.map(c => ({
        stars: c.avg_score,
        text: c.comment
      }))
    }
  } catch (err) {
    console.error('❌ Error fetching staff comments:', err)
  }
}

/* -------------------------
   Auto-fetch on changes
--------------------------*/
watch([startDate, endDate, activeTab], async () => {
  loading.value = true
  await fetchRatings()
  await fetchComments()
  loading.value = false
})

onMounted(async () => {
  await fetchRatings()
  await fetchComments()
})

/* -------------------------
   Calendar Display & Logic
--------------------------*/
const formatDateDisplay = (d) =>
  d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

const formatDateDB = (d) => d.toISOString().split("T")[0]

const currentMonthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long' })
})

const isDateSelected = (date) => {
  return (
    (startDate.value && date.getTime() === startDate.value.getTime()) ||
    (endDate.value && date.getTime() === endDate.value.getTime())
  )
}

const isDateInRange = (date) => {
  if (!startDate.value || !endDate.value) return false
  return date >= startDate.value && date <= endDate.value
}

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0)

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month filler
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevLastDay.getDate() - i)
    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isSelected: isDateSelected(date),
      isInRange: isDateInRange(date),
      isToday: date.getTime() === today.getTime()
    })
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      isSelected: isDateSelected(date),
      isInRange: isDateInRange(date),
      isToday: date.getTime() === today.getTime()
    })
  }

  // Next month filler → total should be 42 (6 weeks × 7 days)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      date,
      day: i,
      isCurrentMonth: false,
      isSelected: isDateSelected(date),
      isInRange: isDateInRange(date),
      isToday: date.getTime() === today.getTime()
    })
  }

  return days
})

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

const resetDate = () => {
  startDate.value = null
  endDate.value = null
}

const selectTodayRange = () => {
  const today = new Date()
  startDate.value = today
  endDate.value = today
  showCalendar.value = false
}
const today = new Date()
startDate.value = today
endDate.value = today

</script>
