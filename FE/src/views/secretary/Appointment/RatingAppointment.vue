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
          <span class="text-5xl font-bold">
            {{ ratingsEmpty ? '0.0' : ratingsAverage }}
          </span>
          <div class="flex text-2xl">
            <span v-for="i in 5" :key="i" :class="i <= 4 ? 'text-yellow-400' : 'text-gray-300'">★</span>
          </div>
        </div>

        <!-- Content Row -->
        <div class="flex flex-wrap gap-6">
          <!-- Chart Container -->
          <div class="flex-1 min-w-[300px] bg-white text-gray-800 rounded-xl p-6 shadow">
            <div class="text-lg font-bold text-center mb-4">Rating</div>

            <!-- Empty state -->
            <template v-if="ratingsEmpty">
              <div class="text-center text-gray-500 py-16">
                ยังไม่มี feedback สำหรับเทอมนี้ 😔
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

            <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Export</button>
          </div>

          <!-- Comments Container -->
          <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow flex flex-col text-black">
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
import { ref, computed, onMounted, watch } from 'vue'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import Barchart from '@/components/secretary/Barchart.vue'

import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'
import userimg from '@/assets/user.png'

const selectedSemester = ref('1')
const selectedYear = ref('2568')
const selectedTopic = ref('appointment')

function getUserAvatar(userId) {
  switch (userId) {
    case 2: return Aoi
    case 4: return Lek
    case 3: return Ang
    case 6: return phum
    default: return userimg
  }
}

const user = ref({ name: '', avatar: '' })
const comments = [
  { topic: 'appointment', stars: 5, text: 'Very kind and punctual!' },
  { topic: 'appointment', stars: 4, text: 'Good communication and easy to schedule.' },
  { topic: 'counseling', stars: 3, text: 'Helpful but waiting time was a bit long.' },
]

const filteredComments = computed(() => comments.filter(c => c.topic === selectedTopic.value))

// Ratings state
const ratings = ref({
  friendliness: 0,
  efficiency: 0,
  communication: 0
})

// Computed empty state
const ratingsEmpty = computed(() =>
  ratings.value.friendliness + ratings.value.efficiency + ratings.value.communication === 0
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

// Fetch user profile
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

// Fetch ratings function
const fetchRatings = async () => {
  try {
    // ⭐️ เพิ่มการอ่าน user_id (staffId) จาก token ⭐️
    const token = localStorage.getItem('authToken');
    if (!token) return; // ถ้าไม่มี token ก็ไม่ต้องทำ
    const decoded = jwt_decode(token);
    const staffId = Number(decoded.user_id); // นี่คือ ID ของเลขาที่ login อยู่

    if (!staffId) return; // กันพลาด

    const res = await axios.get('http://localhost:3000/secretary/rating-Appointment', {
      params: { 
        year: selectedYear.value, 
        semester: selectedSemester.value,
        staffId: staffId // ⭐️ ส่ง staffId ไปให้ Backend ⭐️
      }
    });
    console.log('📊 Raw rating data from backend:', res.data.data);

    if (res.data.success && res.data.data) {
      const f = parseFloat(res.data.data.friendliness) || 0;
      const e = parseFloat(res.data.data.efficiency) || 0;
      const c = parseFloat(res.data.data.communication) || 0;

      ratings.value = { friendliness: f, efficiency: e, communication: c };
    } else {
      // เผื่อกรณีข้อมูลไม่มา (เช่น ไม่มี feedback) ให้ clear ค่าเก่า
      ratings.value = { friendliness: 0, efficiency: 0, communication: 0 };
    }
  } catch (err) {
    console.error('Failed to fetch ratings:', err);
    // ถ้า error ก็ clear ค่า
    ratings.value = { friendliness: 0, efficiency: 0, communication: 0 };
  }
};

// Load ratings on mount and watch changes
onMounted(fetchRatings)
watch([selectedSemester, selectedYear], fetchRatings)


</script>
