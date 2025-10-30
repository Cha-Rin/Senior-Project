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
    <option 
      v-for="semester in semesterOptions" 
      :key="semester.value" 
      :value="semester.value">
      {{ semester.text }}
    </option>
  </select>
  
  <select v-model="selectedYear" class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
    <option 
      v-for="year in yearOptions" 
      :key="year" 
      :value="year">
      {{ year }}
    </option>
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
          <!-- <div class="flex text-2xl">
            <span v-for="i in 5" :key="i" :class="i <= 4 ? 'text-yellow-400' : 'text-gray-300'">★</span>
          </div> -->
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
            
 <div v-for="(comment, i) in comments" :key="i" class="flex gap-3 p-3 bg-white rounded-lg shadow">
 <div class="text-xl text-gray-400 flex items-center justify-center">👤</div>
 <div class="flex-1">
 <!-- <div class="flex text-sm mb-1">
 <span v-for="j in 5" :key="j" :class="j <= comment.stars ? 'text-yellow-400' : 'text-gray-300'">★</span>
 </div> -->
 <p class="text-sm text-gray-700 leading-relaxed">{{ comment.text }}</p>
 </div>
 </div>

 <div v-if="comments.length === 0" class="text-center text-gray-400 pt-16">
 ไม่มีคอมเมนต์ในเทอมนี้
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

const selectedSemester = ref(null) 
const selectedYear = ref(null)

const semesterOptions = ref([])
const yearOptions = ref([])
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
    await fetchDropdownOptions()
    await fetchRatings()
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', err)
  }
})

// ⭐️ 4. เพิ่มฟังก์ชันสำหรับดึงข้อมูล Dropdown ⭐️
const fetchDropdownOptions = async () => {
  try {
    // 4.1 ดึง "รายการตัวเลือก"
    const optionsRes = await axios.get('http://localhost:3000/academic/academic-options')
    if (optionsRes.data.success) {
      semesterOptions.value = optionsRes.data.data.semesters
      yearOptions.value = optionsRes.data.data.years
    }

    // 4.2 ดึง "ค่าปัจจุบัน"
    const currentRes = await axios.get('http://localhost:3000/academic/current')
    if (currentRes.data.success) {
      // 4.3 ตั้งค่า v-model (Default)
      selectedSemester.value = currentRes.data.data.semester
      selectedYear.value = currentRes.data.data.academic_year
    }
  } catch (err) {
    console.error('❌ ไม่สามารถโหลดข้อมูล Dropdown:', err)
    // ถ้าพลาด, ก็ยังตั้งค่าสำรองไว้
    selectedSemester.value = '1'
    selectedYear.value = '2568' 
  }
}

// Fetch ratings function
const fetchRatings = async () => {
 try {
    // ⭐️ เพิ่มการอ่าน user_id (staffId) จาก token ⭐️
    const token = localStorage.getItem('authToken');
    if (!token) return; // ถ้าไม่มี token ก็ไม่ต้องทำ
    const decoded = jwt_decode(token);
    const staffId = Number(decoded.user_id); // นี่คือ ID ของเลขาที่ login อยู่

    if (!staffId) return; // กันพลาด
    if (!selectedYear.value || !selectedSemester.value) {
      console.warn('...รอข้อมูล Dropdown ก่อน...')
      return; 
    }

 const res = await axios.get('http://localhost:3000/secretary/rating-Appointment', {
 params: { 
 year: selectedYear.value, 
 semester: selectedSemester.value,
 staffId: staffId // ⭐️ ส่ง staffId ไปให้ Backend ⭐️
 }
});
 console.log('📊 Raw rating data from backend:', res.data.data);

if (res.data.success && res.data.data) {
ratings.value = res.data.data.averages;
 comments.value = res.data.data.comments;
 } else {
      // เผื่อกรณีข้อมูลไม่มา (เช่น ไม่มี feedback) ให้ clear ค่าเก่า
      ratings.value = { friendliness: 0, efficiency: 0, communication: 0 };
      comments.value = [];
    }
 } catch (err) {
 console.error('Failed to fetch ratings:', err);
    // ถ้า error ก็ clear ค่า
    ratings.value = { friendliness: 0, efficiency: 0, communication: 0 };
    comments.value = [];
 }
};

// Load ratings on mount and watch changes
watch([selectedSemester, selectedYear], fetchRatings)

</script>
