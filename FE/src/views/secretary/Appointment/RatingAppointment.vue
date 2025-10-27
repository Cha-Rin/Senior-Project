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

        <div class="flex gap-4">
          <select v-model="selectedSemester" class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <select v-model="selectedYear" class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
            <option value="2568">2568</option>
            <option value="2567">2567</option>
            <option value="2566">2566</option>
          </select>
        </div>
      </div>

      <!-- Main Card -->
      <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg flex flex-col gap-8">
        <!-- Overall Rating -->
        <div class="flex items-center gap-6">
          <span class="text-5xl font-bold">{{ ratingsAverage }}</span>
          <div class="flex text-2xl">
            <span v-for="i in 5" :key="i" :class="i <= 4 ? 'text-yellow-400' : 'text-gray-300'">★</span>
          </div>
        </div>

        <!-- Content Row -->
        <div class="flex flex-wrap gap-6">
          <!-- Chart Container -->
          <div class="flex-1 min-w-[300px] bg-white text-gray-800 rounded-xl p-6 shadow">
            <div class="text-lg font-bold text-center mb-4">Rating</div>

            <!-- ✅ ใช้ Barchart.vue -->
            <Barchart
              :labels="['Staff Friendliness', 'Service Efficiency', 'Communication']"
              :data="[ratings.friendliness, ratings.efficiency, ratings.communication]"
              :colors="['#10b981', '#3b82f6', '#f59e0b']"
            />

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

            <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Export</button>
          </div>

          <!-- Comments Container -->
          <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow flex flex-col text-black">
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-bold">Comment</span>
              <select v-model="selectedTopic" class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
                <option value="appointment">Appointment</option>
                <option value="counseling">Counseling</option>
                <option value="support">Support</option>
              </select>
            </div>

            <div class="flex-1 overflow-y-auto pr-2 space-y-3 max-h-72">
              <div v-for="(comment, i) in filteredComments" :key="i" class="flex gap-3 p-3 bg-white rounded-lg shadow">
                <div class="text-xl text-gray-400 flex items-center justify-center">👤</div>
                <div class="flex-1">
                  <div class="flex text-sm mb-1">
                    <span v-for="j in 5" :key="j" :class="j <= comment.stars ? 'text-yellow-400' : 'text-gray-300'">★</span>
                  </div>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import Barchart from '@/components/secretary/Barchart.vue'

const selectedSemester = ref('1')
const selectedYear = ref('2568')
const selectedTopic = ref('appointment')
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'

const ratings = {
  friendliness: 4.5,
  efficiency: 3.2,
  communication: 4.0
}

function getUserAvatar(userId) {
  switch (userId) {
    case 2: return Aoi
    case 4: return Lek
    case 3: return Ang
    case 6: return phum
    default: return phum
  }
}

const ratingsAverage = ((ratings.friendliness + ratings.efficiency + ratings.communication) / 3).toFixed(1)

const comments = [
  { topic: 'appointment', stars: 5, text: 'Very kind and punctual!' },
  { topic: 'appointment', stars: 4, text: 'Good communication and easy to schedule.' },
  { topic: 'counseling', stars: 3, text: 'Helpful but waiting time was a bit long.' },
]

const user = ref({ name: '', avatar: '' })

onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const decoded = jwt_decode(token)
    const userId = Number(decoded.user_id)
    const res = await axios.get(`http://localhost:3000/profile/${userId}`)
    user.value = res.data
    user.value.avatar = getUserAvatar(userId)
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', err)
  }
})

const filteredComments = computed(() => comments.filter(c => c.topic === selectedTopic.value))
</script>
