<!-- src/views/CreateAppointment.vue -->
<template>
<div>
 <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
  
  <div class="min-h-screen bg-white pt-20 px-4 py-2 flex flex-col items-center text-center">
    <h1 class="text-xl font-semibold mb-4">Create an appointment</h1>

    <!-- ⬇️ ใช้ binding src -->
    <img :src="imageSrc" alt="Profile" class="w-24 h-24 mb-2" />
    <p class="text-lg font-medium mb-4">{{ displayName }}</p>


    <!-- ✅ ตารางแยก component -->
    <ScheduleTable :unavailable-slots="unavailable" :closed-slots="closed" />

    <div class="bg-blue-900 text-white w-full max-w-xs p-4 rounded-xl space-y-3 mb-10">
      <!-- เลือกวัน -->
        <label class="block">Date:
            <input type="date" v-model="selectedDate" class="border rounded p-1 w-full text-black" />
        </label>
        <!-- เลือกเวลา -->
        <label class="block">Time:
            <select v-model="selectedSlot" class="border rounded p-1 w-full text-black">
              <option disabled value="">-- กรุณาเลือกช่วงเวลา --</option>
              <option v-for="slot in timeSlots" :key="slot" :value="slot">
                {{ slot }}
              </option>
      </select>
        </label>
      </div>
      <button  @click="goToConfirm" class="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '@/components/student/Navbar.vue'
import girl from '@/assets/girl.png'
import boy from '@/assets/boy.png'
import unicorn from '@/assets/unicorn.png'
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'

const router = useRouter()
const route = useRoute()
const userId = localStorage.getItem('userId')

const selectedTopic = ref('')
const staffName = ref('')
const staffAvatar = ref('')
const displayName = ref('')
const imageSrc = ref('')
const note = ref('')

const topicQuery = route.query.topic
const category_id = route.query.category_id
// ✅ สร้างตัวแปรแบบ reactive ให้ Vue จัดการได้
const selectedDate = ref('')
const selectedSlot = ref('')

const unavailable = ref([
  [1, 1], [2, 0], [4, 3], [6, 2], [7, 4]
])

const closed = ref([
  [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]
])

// ✅ สร้างช่วงเวลาที่กำหนดไว้ล่วงหน้า
const timeSlots = [
  '08:00 - 09:00 AM',
  '09:00 - 10:00 AM',
  '10:00 - 11:00 AM',
  '11:00 - 12:00 PM',
  '13:00 - 14:00 PM',
  '14:00 - 15:00 PM',
  '15:00 - 16:00 PM'
]

function goToConfirm() {
  if (!selectedDate.value || !selectedSlot.value) {
    alert('กรุณาเลือกวันและช่วงเวลา')
    return
  }

  router.push({
    name: 'ConfirmAppointment',
    query: {
      topic: selectedTopic.value,
      name: displayName.value,
      avatar: imageSrc.value,
      date: selectedDate.value,
      time: selectedSlot.value,
      note: note.value
    }
  })
}


onMounted(() => {
  // 🟡 map category_id เป็น topic ที่ใช้ภายใน
  switch (category_id) {
    case '1':
    case 1:
      selectedTopic.value = 'Student_Activities'
      displayName.value = 'Pakpoom Lamprasert'
      imageSrc.value = phum
      break
    case '2':
    case 2:
      selectedTopic.value = 'Cooperative_Education'
      displayName.value = 'Unicorn Support'
      imageSrc.value = boy
      break
    case '3':
    case 3:
      selectedTopic.value = 'Installment_Payment'
      displayName.value = 'Tatchamay Wahnchaisiri'
      imageSrc.value = Ang
      break
    case '4':
    case 4:
      selectedTopic.value = 'Graduate Studies'
      displayName.value = 'Porntip Panya'
      imageSrc.value = Aoi
      break
      case '5':
     case 5:
       selectedTopic.value = 'Registration_work'
       displayName.value = 'Rattikarn Nanglae'
       imageSrc.value = Lek
       break
     default:
       selectedTopic.value = 'N/A'
       displayName.value = 'Default Name'
       imageSrc.value = user
  }
})

//  case '4':
//     case 4:
//       selectedTopic.value = 'Registration_work'
//       displayName.value = 'Support'
//       imageSrc.value = unicorn
//       break
//     default:
//       selectedTopic.value = 'N/A'
//       displayName.value = 'Default Name'
//       imageSrc.value = user

// function goToConfirm() {
//   router.push({
//     name: 'ConfirmAppointment',
//     query: {
//       name: displayName.value,
//       avatar: imageSrc.value,
//       date: selectedDate.value?.full || 'N/A',
//       time: selectedTime.value || 'N/A',
//       topic: selectedTopic.value || 'N/A',
//       note: note.value
//     }
//   })
// }

// function goNext() {
//   router.push('/student/appointment/confirm')
// }
</script>
