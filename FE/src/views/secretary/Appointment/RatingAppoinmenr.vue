<template>
  <div class="min-h-screen bg-white p-6">
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex items-center gap-4">
        <img :src="currentStaff.img" class="w-16 h-16 rounded-full object-cover" alt="Staff Avatar" />
        <h2 class="text-xl font-bold">Name&nbsp;&nbsp;{{ currentStaff.name }}</h2>
      </div>

      <div class="flex items-center gap-3">
        <!-- เลือกพนักงาน -->
        <select v-model="selectedStaffId" class="border rounded px-2 py-1">
          <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>

        <select class="border rounded px-2 py-1">
          <option>Semester 1</option>
          <option>Semester 2</option>
        </select>
        <select class="border rounded px-2 py-1">
          <option>2568</option>
          <option>2567</option>
        </select>
      </div>
    </div>

    <!-- Rating & Comment Section -->
    <div class="bg-[#908DFF] rounded-xl p-6 flex flex-wrap gap-6 text-white">
      <!-- Rating Chart -->
      <div class="flex-1 min-w-[300px]">
        <h3 class="text-3xl font-bold mb-2">3.9 ★★★★☆</h3>
        <BarChart :chart-data="chartData" :chart-options="chartOptions" />
        <button class="mt-4 px-4 py-1 bg-purple-800 text-white rounded">Export</button>
      </div>

      <!-- Comments Section -->
      <div class="flex-1 min-w-[300px] bg-gray-100 text-black rounded-lg p-4 overflow-y-auto max-h-80">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold text-lg">comment</h3>
          <select class="border rounded px-2 py-1 text-sm">
            <option>Course registration</option>
            <option>Other</option>
          </select>
        </div>

        <div v-for="(cmt, i) in comments" :key="i" class="mb-4 border-b pb-2">
          <div class="flex items-center gap-2 mb-1">
            <i class="fas fa-user-circle text-xl"></i>
            <span class="text-yellow-500 text-sm">
              {{ "★".repeat(cmt.rating) }}{{ "☆".repeat(5 - cmt.rating) }}
            </span>
          </div>
          <p class="text-sm">{{ cmt.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  { id: 'aoi',    name: 'Porntip Panya',   img: imgAoi },
  { id: 'pong',   name: 'Pongkajorn S.',   img: imgPong },
  { id: 'nim',    name: 'Nim Napa',        img: imgNim },
  { id: 'lek',    name: 'Thanasak Lek',    img: imgLek },
  { id: 'angoon', name: 'Angoon L.',       img: imgAngoon }
]

// เลือกพนักงานปัจจุบัน
const selectedStaffId = ref(staffList[0].id)
const currentStaff = computed(() => staffList.find(s => s.id === selectedStaffId.value) || staffList[0])

// Chart
const chartData = {
  labels: ['Service Provider', 'Service Delivery process', 'Facilities'],
  datasets: [
    { label: 'Rating', backgroundColor: ['#3B82F6', '#FACC15', '#F87171'], data: [5, 2, 3] }
  ]
}
const chartOptions = {
  responsive: true,
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
}

// Comments
const comments = ref([
  { rating: 4, text: 'She is kind and works very quickly.' },
  { rating: 4, text: 'The service was decent and followed the standard process. However, there’s still room for improvement...' },
  { rating: 2, text: 'Could improve speed and explanation quality.' }
])
</script>
