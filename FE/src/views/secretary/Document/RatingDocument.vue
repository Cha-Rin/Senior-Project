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

            <div class="relative h-64 flex items-end gap-4">
              <!-- Y-axis -->
              <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 p-1">
                <span v-for="i in 5" :key="i">{{ i }}</span>
              </div>

              <!-- Bars -->
              <div class="flex-1 flex items-end gap-4 pl-5">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 rounded-t" :style="{ height: `${ratings.provider * 40}px`, backgroundColor: '#1f6feb' }"></div>
                  <div class="text-xs text-center max-w-[80px] truncate">Service Provider</div>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 rounded-t" :style="{ height: `${ratings.delivery * 40}px`, backgroundColor: '#f59e0b' }"></div>
                  <div class="text-xs text-center max-w-[80px] truncate">Service Delivery</div>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 rounded-t" :style="{ height: `${ratings.facilities * 40}px`, backgroundColor: '#ef4444' }"></div>
                  <div class="text-xs text-center max-w-[80px] truncate">Facilities</div>
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="flex flex-wrap justify-center gap-6 mt-4 text-xs">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm" style="background:#1f6feb"></div>
                <span>Service Provider</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm" style="background:#f59e0b"></div>
                <span>Service Delivery</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-sm" style="background:#ef4444"></div>
                <span>Facilities</span>
              </div>
            </div>

            <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Export</button>
          </div>

          <!-- Comments Container -->
          <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-bold">Comment</span>
              <select v-model="selectedTopic" class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
                <option value="course-registration">Course registration</option>
                <option value="advising">Advising session</option>
                <option value="internship">Internship approval</option>
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
import { ref, computed, onMounted} from 'vue'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const selectedSemester = ref('1')
const selectedYear = ref('2568')
const selectedTopic = ref('course-registration')
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'
const ratings = {
  provider: 4.8,
  delivery: 2.0,
  facilities: 2.9
}
function getUserAvatar(userId) {
  switch(userId) {
    case 2: return Aoi;
    case 4: return Lek;
    case 3: return Ang;
    case 6: return phum;
    default: return defaultImg;
  }
}

// ค่าเฉลี่ย
const ratingsAverage = ((ratings.provider + ratings.delivery + ratings.facilities) / 3).toFixed(1)

const comments = [
  { topic: 'course-registration', stars: 5, text: 'She is kind and works very quickly.' },
  { topic: 'course-registration', stars: 4, text: 'The service was decent and followed the standard process. However, there\'s still room for improvement in terms of speed and convenience to make the experience smoother and more efficient.' },
  { topic: 'course-registration', stars: 5, text: 'Very helpful and professional!' },
  { topic: 'advising', stars: 3, text: 'Good advice but took too long.' }
]
const user = ref({
  name: '',
  avatar: ''
})
onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const decoded = jwt_decode(token);
    const userId = Number(decoded.user_id);

    const res = await axios.get(`http://localhost:3000/profile/${userId}`);
    
    // กำหนดค่า user.value จาก response
    user.value = res.data;

    // เพิ่ม avatar ให้ user.value
    user.value.avatar = getUserAvatar(userId);

    console.log('โหลดข้อมูลผู้ใช้สำเร็จ:', user.value);
  } catch (err) {
    console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', err);
  }
});
const filteredComments = computed(() => comments.filter(c => c.topic === selectedTopic.value))
</script>
