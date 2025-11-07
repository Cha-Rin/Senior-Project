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

      <!-- Year & Semester -->
      <div class="flex gap-4">
        <select v-model="selectedSemester" class="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <select v-model="selectedYear" class="border rounded-lg px-3 py-2 text-sm bg-white">
          <option v-for="year in years" :key="year">{{ year }}</option>
        </select>
        <button @click="$router.push('/admin/dashboard')" class="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800">
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

    <!-- Main Card -->
    <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg">
      <div v-if="loading" class="text-center py-10 text-gray-200">Loading data...</div>

      <div v-else>
        <!-- Overall Rating -->
        <div class="flex items-center gap-4 mb-8">
          <span class="text-5xl font-bold">{{ averageScore }}</span>
          <div class="flex text-2xl">
            <span v-for="i in 5" :key="i" :class="{ 'text-yellow-400': i <= starLevel, 'text-gray-400': i > starLevel }">★</span>
          </div>
        </div>

        <!-- Chart & Comments -->
        <div class="flex flex-wrap gap-6">
          <!-- 📊 Rating Chart -->
          <div class="flex-1 min-w-[350px] bg-white rounded-xl p-6 shadow text-gray-800">
            <WeeklyUsersChart
              v-if="ratingChart"
              :chartData="ratingChart"
              :title="activeTab === 'appointment' ? 'Appointment Rating' : 'Document Rating'"
            />
          </div>

          <!-- 💬 Comments -->
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
                    <span
                      v-for="j in 5"
                      :key="j"
                      :class="{ 'text-yellow-400': j <= comment.stars, 'text-gray-300': j > comment.stars }"
                    >★</span>
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

// --- Staff info from route ---
const route = useRoute()
const staffId = route.params.id
const staffName = route.query.name || 'ไม่ระบุชื่อ'
const resolvedAvatar = route.query.avatar || new URL('/src/assets/default.png', import.meta.url).href

// --- Year & Semester ---
const selectedSemester = ref('1')
const selectedYear = ref('2568')
const years = Array.from({ length: 5 }, (_, i) => 2568 - i)

// --- Tabs ---
const activeTab = ref('appointment')
const activeTabClass = 'pb-2 px-4 font-semibold text-blue-600 border-b-2 border-blue-600'
const inactiveTabClass = 'pb-2 px-4 text-gray-500 hover:text-blue-500'

// --- Data ---
const ratings = ref({ service_provider: 0, service_process: 0, facilities: 0 })
const comments = ref([])
const loading = ref(true)
const ratingChart = ref(null)

// --- Computed Average ---
const averageScore = computed(() => {
  const avg = ((+ratings.value.service_provider + +ratings.value.service_process + +ratings.value.facilities) / 3).toFixed(1)
  return isNaN(avg) ? 0 : avg
})
const starLevel = computed(() => Math.round(averageScore.value))

// ==============================
// 🔹 Fetch Rating (ตามแท็บ)
// ==============================
// ⭐️ หาฟังก์ชันนี้
const fetchRatings = async () => {
  loading.value = true
  try {
    // ✅ 1. เพิ่ม 'type: activeTab.value' เข้าไปใน params
    const res = await axios.get(`/admin/staff/${staffId}/rating`, {
      params: {
        year: selectedYear.value,
        semester: selectedSemester.value,
        type: activeTab.value // 👈 *** เพิ่มบรรทัดนี้ ***
      }
    })
    if (res.data.success) {
      // ✅ 2. เปลี่ยน Logic การประมวลผล (ไม่ต้องหาค่าเฉลี่ย)
      const r = res.data.data
      
      // (ของเดิมที่พัง)
      // ratings.value.provider = ((r.appointment.service_provider + r.document.service_provider) / 2).toFixed(1)
      // ...
      
      // (ของใหม่) 
      // ใช้ + เพื่อแปลง null/string เป็น number (ถ้าเป็น null จะได้ 0)
      ratings.value = {
        service_provider: +r.service_provider || 0,
        service_process: +r.service_process || 0,
        facilities: +r.facilities || 0
      }

      // ✅ 3. อัปเดตข้อมูล Chart
      // (โค้ดส่วนนี้ในไฟล์ของคุณอาจจะชื่อต่างกันเล็กน้อย ให้ปรับตาม)
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

// ==============================
// 🔹 Fetch Comments (ตามแท็บ)
// ==============================
const fetchComments = async () => {
  try {
    const res = await axios.get(`/admin/staff/${staffId}/comments`, {
      params: {
        type: activeTab.value,
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

// --- Watch & Init ---
// (ของใหม่) 
// เพิ่ม activeTab เข้าไป
watch([selectedSemester, selectedYear, activeTab], async () => {
  loading.value = true
  await fetchRatings()
  await fetchComments()
  loading.value = false
})

onMounted(async () => {
  await fetchRatings()
  await fetchComments()
})
</script>
