<!-- src/view/Document/RatingDocument.vue -->
<template>
  <div class="flex min-h-screen bg-white">
    <!-- 🔹 Sidebar -->
    <aside class="w-64 bg-[#0B3C6A] text-white p-4 space-y-6">
      <!-- <img src="/logo.png" class="h-16 mx-auto mb-4" alt="Logo" /> -->
      <nav class="space-y-4 text-sm">
        <p>Homepage</p>
        <p>Request Document</p>
        <p>Document Status</p>
        <p>History</p>
        <p class="bg-blue-900 rounded px-2 py-1">Feedback</p>
      </nav>
      <button class="mt-auto text-left text-red-200 hover:text-red-400">Log out</button>
    </aside>

    <!-- 🔸 Main Content -->
    <div class="flex-1 p-6">
      <!-- 🔹 Topbar -->
      <div class="flex justify-end mb-4">
        <span class="text-sm text-blue-900 font-bold">EN</span>
        <span class="mx-1 text-gray-400">/</span>
        <span class="text-sm text-purple-500 font-bold">TH</span>
      </div>

      <!-- 🔹 Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-4">
          <img :src="currentStaff.img" class="w-16 h-16 rounded-full object-cover" alt="Staff Avatar" />
          <h2 class="text-xl font-bold">Name&nbsp;&nbsp;{{ currentStaff.name }}</h2>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- ตัวเลือกพนักงาน -->
          <select v-model="selectedStaffId" class="border rounded px-3 py-1 text-sm">
            <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>

          <select v-model="semester" class="border rounded px-3 py-1 text-sm">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>

          <select v-model="year" class="border rounded px-3 py-1 text-sm">
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>
      </div>

      <!-- 🔹 Feedback Box -->
      <div class="bg-[#908DFF] rounded-xl p-6 flex flex-wrap gap-6 text-white">
        <!-- Rating Section -->
        <div class="flex-1 min-w-[300px]">
          <h3 class="text-4xl font-bold mb-2">3.9 ★★★★☆</h3>
          <BarChart :chart-data="chartData" :chart-options="chartOptions" />
          <button class="mt-4 px-4 py-1 bg-purple-800 text-white rounded">Export</button>
        </div>

        <!-- Comment Section -->
        <div class="flex-1 min-w-[300px] bg-gray-100 text-black rounded-lg p-4 overflow-y-auto max-h-80">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold text-lg">comment</h3>
            <select class="border rounded px-2 py-1 text-sm">
              <option>Course registration</option>
              <option>Internship</option>
            </select>
          </div>

          <div v-for="(comment, i) in comments" :key="i" class="mb-4 border-b pb-2">
            <div class="flex items-center gap-2 mb-1">
              <i class="fas fa-user-circle text-xl"></i>
              <span class="text-yellow-500 text-sm">
                {{ '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating) }}
              </span>
            </div>
            <p class="text-sm">{{ comment.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* 
  ✅ รูปทั้งหมดต้องอยู่ที่: secretary-ui/src/assets/
  - P_Aoi.png
  - P_Pong.png
  - P_Nim.png
  - P_Lek.png
  - P_Angoon.png
*/

import { ref, computed } from 'vue'
import BarChart from '../../components/BarChart.vue'

// ✅ นำเข้ารูปจาก src/assets ด้วย alias @
import imgAoi from '@/assets/P_Aoi.png'
import imgPong from '@/assets/P_Pong.png'
import imgNim from '@/assets/P_Nim.png'
import imgLek from '@/assets/P_Lek.png'
import imgAngoon from '@/assets/P_Angoon.png'

// ✅ รายชื่อพนักงาน 5 คน
const staffList = [
  { id: 'aoi',    name: 'Porntip Panya', img: imgAoi },
  { id: 'pong',   name: 'Pongkajorn S.', img: imgPong },
  { id: 'nim',    name: 'Nim Napa',      img: imgNim },
  { id: 'lek',    name: 'Thanasak Lek',  img: imgLek },
  { id: 'angoon', name: 'Angoon L.',     img: imgAngoon }
]

// ✅ state
const selectedStaffId = ref(staffList[0].id)
const semester = ref('1')
const year = ref('2025')

// ✅ staff ปัจจุบันตามที่เลือก
const currentStaff = computed(() => {
  return staffList.find(s => s.id === selectedStaffId.value) || staffList[0]
})

// ✅ Chart data (ตัวอย่าง)
const chartData = {
  labels: ['Service Provider', 'Service Delivery process', 'Facilities'],
  datasets: [
    {
      label: 'Rating',
      backgroundColor: ['#3B82F6', '#FACC15', '#F87171'],
      data: [5, 2, 3]
    }
  ]
}

const chartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}

const comments = ref([
  { rating: 4, text: 'She is kind and works very quickly.' },
  { rating: 4, text: 'The service was decent and followed the standard process. However, there’s still room for improvement...' },
  { rating: 2, text: 'Could improve speed and explanation quality.' }
])
</script>
