<template>
  <div class="min-h-screen bg-[#e8eafe] p-6 space-y-6">
    <!-- 🔹 Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <img :src="resolvedAvatar" alt="avatar"
             class="w-20 h-20 rounded-full border-2 border-purple-500" />
        <h2 class="text-3xl font-bold text-black">Name {{ staffName }}</h2>
      </div>

      <!-- 🔹 Term/Year Selector -->
      <div class="flex items-center gap-3">
        <select v-model="selectedTerm" class="border px-4 py-2 rounded-md shadow-sm">
          <option disabled value="">Semester</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
        <select v-model="selectedYear" class="border px-4 py-2 rounded-md shadow-sm">
          <option disabled value="">Year</option>
          <option v-for="year in years" :key="year">{{ year }}</option>
        </select>
        <button @click="$router.push('/admin/dashboard')"
                class="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800">
          ← Back to Dashboard
        </button>
      </div>
    </div>

    <!-- 🔹 Tabs -->
    <div class="flex gap-2">
      <button :class="tab === 'appointment' ? activeTab : defaultTab" @click="tab = 'appointment'">Appointment</button>
      <button :class="tab === 'document' ? activeTab : defaultTab" @click="tab = 'document'">Document Tracking</button>
    </div>

    <!-- 🔹 Average Score -->
    <div class="flex items-center gap-4 text-4xl font-bold text-black">
      {{ averageScore }}
      <span class="text-yellow-500 text-3xl">★</span>
      <span class="text-2xl font-medium">({{ stars }})</span>
    </div>

    <!-- 🔹 Chart + Comments -->
    <div class="flex flex-wrap gap-6">
      <!-- 📊 Chart -->
      <div class="bg-white rounded-lg shadow p-4 flex-1 min-w-[300px]">
        <h3 class="text-lg font-semibold mb-2">Rating</h3>
        <BarChart :data="chartData" />
      </div>

      <!-- 💬 Comments -->
      <div class="bg-white rounded-lg shadow p-4 w-full lg:w-1/3 max-h-96 overflow-y-auto">
        <h3 class="text-lg font-semibold mb-3">Comments</h3>
        <div v-for="(comment, index) in comments" :key="index" class="mb-4 border-b pb-2">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl text-yellow-600">★</span>
            <span class="font-semibold">{{ comment.stars }}/5</span>
            <span class="text-sm text-gray-400 ml-auto">{{ comment.date }}</span>
          </div>
          <p class="text-sm text-gray-700">{{ comment.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import BarChart from '@/components/admin/BarChart.vue'

// ✅ ดึงค่าจาก route
const route = useRoute()
const staffId = route.params.id
const staffName = route.query.name
const resolvedAvatar = route.query.avatar || new URL('/src/assets/default.png', import.meta.url).href

// ✅ mock ค่าคะแนน (ชั่วคราว)
const average = ref({
  serviceProvider: 4.2,
  serviceProcess: 4.4,
  facilities: 4.1
})

// ✅ คะแนนเฉลี่ยรวม
const averageScore = computed(() => {
  const a = average.value
  return ((a.serviceProvider + a.serviceProcess + a.facilities) / 3).toFixed(1)
})

// ✅ ดาว
const stars = computed(() => {
  const score = Number(averageScore.value)
  if (score >= 4.5) return '★★★★★'
  if (score >= 3.5) return '★★★★☆'
  if (score >= 2.5) return '★★★☆☆'
  if (score >= 1.5) return '★★☆☆☆'
  return '★☆☆☆☆'
})

// ✅ ข้อมูลกราฟ
const chartData = computed(() => ({
  labels: ['Service Provider', 'Service Process', 'Facilities'],
  datasets: [{
    label: 'Rating',
    backgroundColor: ['#60a5fa', '#f59e0b', '#f472b6'],
    data: [
      average.value.serviceProvider,
      average.value.serviceProcess,
      average.value.facilities
    ]
  }]
}))

// ✅ คอมเมนต์ตัวอย่าง
const comments = ref([
  { text: 'บริการดีมากค่ะ', stars: 5, date: '21/10/2025' },
  { text: 'รวดเร็วและสุภาพ', stars: 4, date: '22/10/2025' }
])

// ✅ semester/year
const selectedTerm = ref('1')
const selectedYear = ref('2025')
const years = Array.from({ length: 5 }, (_, i) => 2025 - i)

// ✅ tab
const tab = ref('appointment')

// ✅ style
const activeTab = "bg-white text-purple-800 font-bold px-4 py-2 rounded-t-lg border border-b-0"
const defaultTab = "bg-purple-300 text-white px-4 py-2 rounded-t-lg hover:bg-purple-400"
</script>
