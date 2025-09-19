<template v-if="appointments.length > 0">
  <div>
    <Navbar />

    <div class="min-h-screen bg-white pt-20 px-4 py-2 flex flex-col items-center text-center">
      <h1 class="text-xl font-semibold mb-4">Check Status</h1>

      <!-- ✅ Group IF/ELSE ให้ติดกัน -->
      <template v-if="appointments.length > 0">
        <div
          v-for="(app, index) in appointments"
          :key="index"
          class="bg-white shadow-md w-full max-w-sm p-4 rounded-xl text-left mb-6 space-y-2"
        >
          <div class="flex justify-between items-center text-black">
            <span class="text-sm"><strong>A00{{ index + 1 }}</strong></span>
            <span class="text-sm text-green-600">{{ mapStatus(app.status) }}</span>
          </div>
          <p class="text-sm">📅 วันที่: {{ formatDate(app.appointment_date) }}</p>
          <p class="text-sm">🕘 เวลา: {{ formatTime(app.appointment_date) }}</p>
          <p class="text-sm">📌 หัวข้อ: {{ mapCategoryIdToTopic(app.category_id) }}</p>
          <p class="text-sm">📝 {{ app.student_note }}</p>
        </div>
      </template>

      <p v-else class="text-gray-500">ไม่มีรายการนัดหมายที่พบ</p>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/student/Navbar.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
dayjs.locale('th')

const appointments = ref([])
const errorMessage = ref('')
const router = useRouter()
// const status = ref('')
// const name = ref('')
// const avatar = ref('')
// const date = ref('')
// const time = ref('')
// const topic = ref('')



// onMounted(async () => {
// const userId = localStorage.getItem('userId')
//   console.log('📦 Loaded userId:', userId)

//   try {
//     const res = await fetch(`http://localhost:3000/student/appointments/id/${userId}`)
//     const data = await res.json()
//     const text = await res.text()
//     if (!res.ok) { console.error('HTTP', res.status, text); return }
//     if (Array.isArray(data)) {
//       appointments.value = data
//     } else if (data.success && Array.isArray(data.appointments)) {
//       appointments.value = data.appointments
//     } else {
//       appointments.value = []
//       console.warn('❗ No appointments found for ID:', userId)
//     }
//   } catch (err) {
//     console.error('❌ Failed to load appointments:', err)
//     appointments.value = []
//   }
// })

onMounted(async () => {
  const userId = localStorage.getItem('userId')
  console.log('📦 Loaded userId:', userId)

  try {
    const res = await fetch(`http://localhost:3000/student/appointments/id/${userId}`)
    const text = await res.text()              // ✅ อ่านครั้งเดียว

    if (!res.ok) {
      console.error('HTTP', res.status, text.slice(0, 300))
      appointments.value = []
      return
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error('Not JSON:', text.slice(0, 300))
      appointments.value = []
      return
    }

    if (Array.isArray(data)) {
      appointments.value = data
    } else if (data.success && Array.isArray(data.appointments)) {
      appointments.value = data.appointments   // ✅ เข้ากับ BE ที่เราเพิ่งกำหนด
    } else {
      console.warn('❗ No appointments found for ID:', userId)
      appointments.value = []
    }
  } catch (err) {
    console.error('❌ Failed to load appointments:', err)
    appointments.value = []
  }
})


function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatTime(isoString) {
  const date = new Date(isoString)
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}


function mapCategoryIdToTopic(id) {
  switch (id) {
    case 1: return 'Student_Activities'
    case 2: return 'Cooperative_Education'
    case 3: return 'Relaxation'
    case 4: return 'Registration_work'
    default: return 'Unknown'
  }
}

function mapStatus(code) {
  switch (code) {
    case '0': return 'รอดำเนินการ'
    case '1': return 'อนุมัติ'
    case '2': return 'ปฏิเสธ'
    default: return 'ไม่ทราบสถานะ'
  }
}


</script>
