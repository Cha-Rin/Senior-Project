<!-- 📁 src/views/admin/StaffRatingView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow">
      <div class="flex items-center gap-4">
        <img :src="resolvedAvatar" alt="Staff Avatar" class="w-16 h-16 rounded-full object-cover" />
        <div class="text-gray-800 text-lg">
          <span class="block text-sm text-gray-500">Name</span>
          <strong>{{ staffName }}</strong>
        </div>
      </div>

      <div class="flex gap-4">
        <select v-model="selectedSemester" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <select v-model="selectedYear" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
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
      <!-- Overall Rating -->
      <div class="flex items-center gap-4 mb-8">
        <span class="text-5xl font-bold">{{ averageScore }}</span>
        <div class="flex text-2xl">
          <span v-for="i in 5" :key="i" :class="{ 'text-yellow-400': i <= starLevel, 'text-gray-300': i > starLevel }">★</span>
        </div>
      </div>

      <!-- Content Row -->
      <div class="flex flex-wrap gap-6">
        <!-- Chart -->
        <div class="flex-1 min-w-[300px] bg-white text-gray-800 rounded-xl p-6 shadow">
          <div class="text-center text-lg font-semibold mb-4">Rating</div>
          <div class="relative h-52 flex items-end gap-4 px-2">
            <!-- y-axis -->
            <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pl-1">
              <span v-for="i in 5" :key="i">{{ i }}</span>
            </div>

            <div class="flex items-end gap-4 flex-1 justify-center">
              <div class="flex flex-col items-center gap-2">
                <div class="w-10 rounded-t bg-blue-600 transition-all" :style="{ height: `${ratings.provider * 20}px` }"></div>
                <div class="text-xs text-center w-20">Service Provider</div>
              </div>
              <div class="flex flex-col items-center gap-2">
                <div class="w-10 rounded-t bg-yellow-500 transition-all" :style="{ height: `${ratings.process * 20}px` }"></div>
                <div class="text-xs text-center w-24">Service Process</div>
              </div>
              <div class="flex flex-col items-center gap-2">
                <div class="w-10 rounded-t bg-pink-500 transition-all" :style="{ height: `${ratings.facilities * 20}px` }"></div>
                <div class="text-xs text-center w-20">Facilities</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow">
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-semibold text-black">Comments</span>
            <select
              v-model="selectedTopic"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
            >
              <option value="appointment">Appointment</option>
              <option value="document">Document Tracking</option>
            </select>
          </div>

          <div class="max-h-72 overflow-y-auto pr-2 space-y-3">
            <div
              v-for="(comment, i) in filteredComments"
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// 📦 ดึงข้อมูล staff ที่ถูกคลิกมาจาก dashboard
const route = useRoute()
const staffId = route.params.id
const staffName = route.query.name || 'ไม่ระบุชื่อ'
const resolvedAvatar = route.query.avatar || new URL('/src/assets/default.png', import.meta.url).href

// 🔹 Semester / Year
const selectedSemester = ref('1')
const selectedYear = ref('2568')
const years = Array.from({ length: 5 }, (_, i) => 2568 - i)

// 🔹 Mock Rating Data (ชั่วคราว)
const ratings = {
  provider: 4.3,
  process: 4.1,
  facilities: 3.8
}

// 🔹 คำนวณค่าเฉลี่ย
const averageScore = computed(() => {
  const avg = ((ratings.provider + ratings.process + ratings.facilities) / 3).toFixed(1)
  return avg
})

// 🔹 ระดับดาว
const starLevel = computed(() => Math.round(averageScore.value))

// 🔹 Mock Comments
const comments = [
  { topic: 'appointment', stars: 5, text: 'บริการดีมากค่ะ รวดเร็วและสุภาพ' },
  { topic: 'appointment', stars: 4, text: 'ให้คำแนะนำดี แต่บางครั้งตอบช้าเล็กน้อย' },
  { topic: 'document', stars: 5, text: 'ระบบเอกสารสะดวก ใช้งานง่ายค่ะ' },
  { topic: 'document', stars: 4, text: 'บางครั้งโหลดไฟล์ช้า แต่โดยรวมดีมาก' }
]

const selectedTopic = ref('appointment')
const filteredComments = computed(() => comments.filter(c => c.topic === selectedTopic.value))
</script>
