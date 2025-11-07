<template>
  <SecreLayout>
    <div class="p-8 min-h-screen bg-gray-50">
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

      <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg flex flex-col gap-8">
        <div class="flex items-center gap-6">
          <span class="text-5xl font-bold">
            {{ ratingsEmpty ? '0.0' : ratingsAverage }}
          </span>
          </div>

        <div class="flex flex-wrap gap-6">
          <div class="flex-1 min-w-[300px] bg-white text-gray-800 rounded-xl p-6 shadow">
            <div class="text-lg font-bold text-center mb-4">Rating</div>

            <template v-if="ratingsEmpty">
              <div class="text-center text-gray-500 py-16">
                ยังไม่มี feedback สำหรับเทอมนี้ 😔
              </div>
            </template>

            <template v-else>
              <Barchart
                :labels="['Staff Friendliness', 'Service Efficiency', 'Communication']"
                :data="[ratings.friendliness, ratings.efficiency, ratings.communication]"
                :colors="['#10b981', '#3b82f6', '#f59e0b']"
              />
            </template>

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

          <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow flex flex-col text-black">
            <div class="flex-1 overflow-y-auto pr-2 space-y-3 max-h-72">
              
              <div v-for="(comment, i) in comments" :key="i" class="flex gap-3 p-3 bg-white rounded-lg shadow">
                <div class="text-xl text-gray-400 flex items-center justify-center">👤</div>
                <div class="flex-1">
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
// ⭐️ [แก้ไข] เพิ่ม watch
import { ref, computed, onMounted, watch } from 'vue' 
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import Barchart from '@/components/secretary/Barchart.vue'

// (Imports รูป... เหมือนเดิม)
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'
import userimg from '@/assets/user.png' // ⭐️ เพิ่ม userimg

// ⭐️ [แก้ไข] State ของ Dropdown
const selectedSemester = ref(null) 
const selectedYear = ref(null)
// const selectedTopic = ref('course-registration') // ⭐️ [ลบ]

// ⭐️ [เพิ่ม] State สำหรับเก็บ Options
const semesterOptions = ref([])
const yearOptions = ref([])

// ⭐️ [ลบ] ratings (Static)
// const ratings = { provider: 4.8, ... }

// ⭐️ [เพิ่ม] ratings (Dynamic) (เหมือน Appointment)
const ratings = ref({
  friendliness: 0,
  efficiency: 0,
  communication: 0
})

// (ฟังก์ชัน getUserAvatar ... เหมือนเดิม)
function getUserAvatar(userId) {
  switch(userId) {
    case 2: return Aoi;
    case 4: return Lek;
    case 3: return Ang;
    case 6: return phum;
    default: return userimg; // ⭐️ เปลี่ยนเป็น userimg
  }
}

// ⭐️ [เพิ่ม] ratingsEmpty (เหมือน Appointment)
const ratingsEmpty = computed(() =>
 (Number(ratings.value.friendliness) + 
  Number(ratings.value.efficiency) + 
  Number(ratings.value.communication)) === 0
)

// ⭐️ [แก้ไข] Computed average (เหมือน Appointment)
const ratingsAverage = computed(() => {
  if (ratingsEmpty.value) return '0.0'
  const r = ratings.value
  const f = Number(r.friendliness) || 0
  const e = Number(r.efficiency) || 0
  const c = Number(r.communication) || 0
  return ((f + e + c) / 3).toFixed(1)
})

// ⭐️ [ลบ] comments (Static)
// const comments = [ ... ]

// ⭐️ [เพิ่ม] comments (Dynamic)
const comments = ref([])

const user = ref({ name: '', avatar: '' })

// ⭐️ [แก้ไข] onMounted (เหมือน Appointment)
onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const decoded = jwt_decode(token);
    const userId = Number(decoded.user_id);
    const res = await axios.get(`/profile/${userId}`);
    
    user.value = res.data;
    user.value.avatar = getUserAvatar(userId);

    // ⭐️ [เพิ่ม] เรียกฟังก์ชันดึงข้อมูล
    await fetchDropdownOptions()
    await fetchRatings()

  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', err);
  }
});

// ⭐️ [ลบ] filteredComments
// const filteredComments = computed(() => ...)

// ⭐️ [เพิ่ม] ฟังก์ชัน fetchDropdownOptions (เหมือน Appointment)
const fetchDropdownOptions = async () => {
  try {
    // 4.1 ดึง "รายการตัวเลือก"
    const optionsRes = await axios.get('/academic/academic-options')
    if (optionsRes.data.success) {
      semesterOptions.value = optionsRes.data.data.semesters
      yearOptions.value = optionsRes.data.data.years
    }

    // 4.2 ดึง "ค่าปัจจุบัน"
    const currentRes = await axios.get('/academic/current')
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

// ⭐️ [เพิ่ม] ฟังก์ชัน fetchRatings
const fetchRatings = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const decoded = jwt_decode(token);
    const staffId = Number(decoded.user_id); 

    if (!staffId) return; 
    if (!selectedYear.value || !selectedSemester.value) {
      console.warn('...รอข้อมูล Dropdown ก่อน...')
      return; 
    }

    // ⭐️⭐️⭐️ [แก้ไข] เปลี่ยน URL เป็น /rating-Document ⭐️⭐️⭐️
    const res = await axios.get('/secretary/rating-Document', { 
      params: { 
        year: selectedYear.value, 
        semester: selectedSemester.value,
        staffId: staffId 
      }
    });
    console.log('📊 Raw rating data (Document):', res.data.data);

    if (res.data.success && res.data.data) {
      ratings.value = res.data.data.averages;
      comments.value = res.data.data.comments;
    } else {
      ratings.value = { friendliness: 0, efficiency: 0, communication: 0 };
      comments.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch ratings (Document):', err);
    ratings.value = { friendliness: 0, efficiency: 0, communication: 0 };
    comments.value = [];
  }
};

// ⭐️ [เพิ่ม] watch (เหมือน Appointment)
watch([selectedSemester, selectedYear], fetchRatings)

</script>
