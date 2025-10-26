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

      <!-- 🔹 Year & Semester Selector -->
      <div class="flex gap-4">
        <select
          v-model="selectedSemester"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
        >
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>

        <select
          v-model="selectedYear"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
        >
          <option v-for="year in years" :key="year">{{ year }}</option>
        </select>

        <button
          @click="$router.push('/admin/dashboard')"
          class="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>

    <!-- Main Card -->
    <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg">
      <div v-if="loading" class="text-center py-10 text-gray-200">Loading data...</div>

      <div v-else>
        <!-- Overall Rating -->
        <div class="flex items-center gap-4 mb-8">
          <span class="text-5xl font-bold">{{ averageScore }}</span>
          <div class="flex text-2xl">
            <span
              v-for="i in 5"
              :key="i"
              :class="{ 'text-yellow-400': i <= starLevel, 'text-gray-400': i > starLevel }"
              >★</span
            >
          </div>
        </div>

        <!-- Chart & Comments -->
        <div class="flex flex-wrap gap-6">
          <!-- 📊 Rating Chart -->
          <div class="flex-1 min-w-[350px] bg-white rounded-xl p-6 shadow text-gray-800">
            <WeeklyUsersChart
              v-if="ratingChart"
              :chartData="ratingChart"
              title="Average Rating per Category"
            />
          </div>

          <!-- 💬 Comments Section -->
          <div class="flex-1 min-w-[350px] bg-gray-100 rounded-xl p-6 shadow">
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-semibold text-black">Comments</span>
              <select
                v-model="selectedTopic"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
                @change="fetchComments"
              >
                <option value="appointment">Appointment</option>
                <option value="document">Document Tracking</option>
              </select>
            </div>

            <div v-if="comments.length === 0" class="text-gray-500 text-sm text-center">
              ไม่มีคอมเมนต์ในหมวดนี้
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
                    <span
                      v-for="j in 5"
                      :key="j"
                      :class="{ 'text-yellow-400': j <= comment.stars, 'text-gray-300': j > comment.stars }"
                      >★</span
                    >
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

// 📦 Staff info from route
const route = useRoute()
const staffId = route.params.id
const staffName = route.query.name || 'ไม่ระบุชื่อ'
const resolvedAvatar = route.query.avatar || new URL('/src/assets/default.png', import.meta.url).href

// 🔹 Year & Semester
const selectedSemester = ref('1')
const selectedYear = ref('2568')
const years = Array.from({ length: 5 }, (_, i) => 2568 - i)

// 🔹 Data
const ratings = ref({ provider: 0, process: 0, facilities: 0 })
const comments = ref([])
const selectedTopic = ref('appointment')
const loading = ref(true)
const ratingChart = ref(null)

// 🔹 Computed average
const averageScore = computed(() => {
  const avg = ((+ratings.value.provider + +ratings.value.process + +ratings.value.facilities) / 3).toFixed(1)
  return isNaN(avg) ? 0 : avg
})
const starLevel = computed(() => Math.round(averageScore.value))

// ==============================
// 🔹 Fetch Rating
// ==============================
const fetchRatings = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/admin/staff/${staffId}/rating`, {
      params: {
        year: selectedYear.value,
        semester: selectedSemester.value
      }
    })
    if (res.data.success) {
      const r = res.data.data
      ratings.value.provider = ((r.appointment.service_provider + r.document.service_provider) / 2).toFixed(1)
      ratings.value.process = ((r.appointment.service_process + r.document.service_process) / 2).toFixed(1)
      ratings.value.facilities = ((r.appointment.facilities + r.document.facilities) / 2).toFixed(1)

      // ✅ Chart data
      ratingChart.value = {
        labels: ['Service Provider', 'Service Process', 'Facilities'],
        datasets: [
          {
            label: 'Average Rating',
            data: [
              ratings.value.provider,
              ratings.value.process,
              ratings.value.facilities
            ],
            backgroundColor: ['#3b82f6', '#facc15', '#ec4899']
          }
        ]
      }
    }
  } catch (err) {
    console.error('❌ Error fetching staff rating:', err)
  }
}

// ==============================
// 🔹 Fetch Comments
// ==============================
const fetchComments = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/admin/staff/${staffId}/comments`, {
      params: {
        type: selectedTopic.value,
        year: selectedYear.value,
        semester: selectedSemester.value
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

// 🔁 Watch year/semester changes
watch([selectedSemester, selectedYear], async () => {
  loading.value = true
  await fetchRatings()
  await fetchComments()
  loading.value = false
})

// 🏁 Initial load
onMounted(async () => {
  loading.value = true
  await fetchRatings()
  await fetchComments()
  loading.value = false
})
</script>
