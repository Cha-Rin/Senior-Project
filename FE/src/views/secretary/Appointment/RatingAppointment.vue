<!-- 📁 src/views/secretary/RatingAppointment.vue -->
<template>
  <SecreLayout>
    <div class="min-h-screen bg-gray-50 p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow">
        <div class="flex items-center gap-4">
          <img :src="user.avatar" alt="User Avatar" class="w-12 h-12 rounded-full" />
          <div class="text-gray-800 text-lg">
            <span class="block text-sm text-gray-500">Name</span>
            <strong>{{ `${user.name} ${user.surname}` }}</strong>
          </div>
        </div>

        <div class="flex gap-4">
          <select v-model="selectedSemester" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <select v-model="selectedYear" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
            <option value="2568">2568</option>
            <option value="2567">2567</option>
            <option value="2566">2566</option>
          </select>
        </div>
      </div>

      <!-- Main Card -->
      <div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-lg">
        <!-- Overall Rating -->
        <div class="flex items-center gap-4 mb-8">
          <span class="text-5xl font-bold">3.9</span>
          <div class="flex text-2xl">
            <span v-for="i in 5" :key="i" :class="{ 'text-yellow-400': i <= 4, 'text-gray-300': i > 4 }">★</span>
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
                  <div class="w-10 rounded-t bg-yellow-500 transition-all" :style="{ height: `${ratings.delivery * 20}px` }"></div>
                  <div class="text-xs text-center w-24">Service Delivery</div>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 rounded-t bg-red-500 transition-all" :style="{ height: `${ratings.facilities * 20}px` }"></div>
                  <div class="text-xs text-center w-20">Facilities</div>
                </div>
              </div>
            </div>

            <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
              Export
            </button>
          </div>

          <!-- Comments -->
          <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-6 shadow">
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-semibold text-black">Comment</span>
              <select v-model="selectedTopic" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
                <option value="course-registration">Course registration</option>
                <option value="advising">Advising session</option>
                <option value="internship">Internship approval</option>
              </select>
            </div>

            <div class="max-h-72 overflow-y-auto pr-2 space-y-3 ">
              <div
                v-for="(comment, i) in filteredComments"
                :key="i"
                class="flex gap-3 p-4 bg-white rounded-lg shadow-sm "
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
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'
const selectedSemester = ref('2')
const selectedYear = ref('2568')
const selectedTopic = ref('course-registration')

function getUserAvatar(userId) {
  switch(userId) {
    case 2: return Aoi;
    case 4: return Lek;
    case 3: return Ang;
    case 6: return phum;
    default: return defaultImg;
  }
}

const ratings = {
  provider: 4.8,
  delivery: 2.0,
  facilities: 2.9
}

const comments = [
  {
    topic: 'course-registration',
    stars: 5,
    text: 'She is kind and works very quickly.'
  },
  {
    topic: 'course-registration',
    stars: 4,
    text: 'The service was decent and followed the standard process. However, there\'s still room for improvement in terms of speed and convenience.'
  },
  {
    topic: 'course-registration',
    stars: 5,
    text: 'Very helpful and professional!'
  },
  {
    topic: 'advising',
    stars: 3,
    text: 'Good advice but took too long.'
  }
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


const filteredComments = computed(() => {
  return comments.filter(c => c.topic === selectedTopic.value)
})
</script>
