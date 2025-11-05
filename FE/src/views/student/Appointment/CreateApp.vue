<!-- src/views/CreateAppointment.vue -->
<template>
<div>
    
  
  <div class="min-h-screen bg-white pt-20 px-4 py-2 flex flex-col items-center text-center">
    <h1 class="text-xl font-semibold mb-4">Create an appointment</h1>

    <!-- ⬇️ ใช้ binding src -->
    <img :src="imageSrc" alt="Profile" class="w-24 h-24 mb-2" />
    <p class="text-lg font-medium mb-4">{{ displayName }}</p>


    <!-- ✅ ตารางแยก component -->
    <StudentScheduleView 
    v-if="staffIdToView"
    :staffId="staffIdToView" 
    @update:unavailableData="onUnavailableDataUpdate"
/>

    <div class="bg-blue-900 text-white w-full max-w-xs p-4 rounded-xl space-y-3 mb-10">
      <!-- เลือกวัน -->
        <label class="block">Date:
            <input type="date" v-model="selectedDate" class="border rounded p-1 w-full text-black" />
        </label>
        <!-- เลือกเวลา -->
        <label class="block">
  Time:
  <select v-model="selectedSlot" class="border rounded p-1 w-full text-black">
    <option disabled value="">-- กรุณาเลือกช่วงเวลา --</option>

    <option
      v-for="slot in availableTimeSlots"
      :key="slot"
      :value="slot"
    >
      {{ slot }}
    </option>

    <option
      v-if="selectedDate && availableTimeSlots.length === 0"
      disabled
    >
      -- ไม่ว่าง/เป็นวันหยุด --
    </option>
  </select>
</label>

      </div>
      <button  @click="goToConfirm" class="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import boy from '@/assets/boy.png'
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'
import StudentScheduleView from '@/components/student/StudentScheduleView.vue'

const router = useRouter()
const route = useRoute()
const userId = localStorage.getItem('userId')

const selectedTopic = ref('')
const staffName = ref('')
const staffAvatar = ref('')
const displayName = ref('')
const imageSrc = ref('')
const note = ref('')
const staffIdToView = ref(null)

const selectedDate = ref('')
const selectedSlot = ref('')

// ✅ เก็บ unavailable slot (Set)
const unavailableMasterSet = ref(new Set())

// ✅ รับ emit จาก child
const onUnavailableDataUpdate = (dataFromChild) => {
  console.log("Parent received unavailable data:", dataFromChild.size)
  unavailableMasterSet.value = dataFromChild
}

// ✅ ตารางเวลา (ต้องตรงกับ child)
const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00'
]
const LUNCH_ROW_INDEX = 4

// ✅ Helper: Convert YYYY-MM-DD → dayIndex
const getDayIndexFromDateString = (dateStr) => {
  if (!dateStr) return -1
  const d = new Date(`${dateStr}T12:00:00`)
  const js = d.getDay()
  if (js === 0 || js === 6) return -1
  return js - 1
}

// ✅ Filter Available Time Slots
const availableTimeSlots = computed(() => {
  const dayIndex = getDayIndexFromDateString(selectedDate.value)
  if (dayIndex === -1) return []

  return timeSlots.filter((slot, timeIndex) => {
    if (timeIndex === LUNCH_ROW_INDEX) return false
    const key = `${timeIndex},${dayIndex}`
    const isUnavailable = unavailableMasterSet.value.has(key)
    return !isUnavailable
  })
})

// ✅ Push ไปหน้า Confirm
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

// ✅ โหลดข้อมูลพนักงาน
onMounted(() => {
  const category_id = route.query.category_id

  switch (category_id) {
    case '1':
    case 1:
      selectedTopic.value = 'Student_Activities'
      displayName.value = 'Pakpoom Lamprasert'
      imageSrc.value = phum
      staffIdToView.value = 6
      break

    case '2':
    case 2:
      selectedTopic.value = 'Cooperative_Education'
      displayName.value = 'Unicorn Support'
      imageSrc.value = boy
      staffIdToView.value = 5
      break

    case '3':
    case 3:
      selectedTopic.value = 'Installment_Payment'
      displayName.value = 'Tatchamay Wahnchaisiri'
      imageSrc.value = Ang
      staffIdToView.value = 3
      break

    case '4':
    case 4:
      selectedTopic.value = 'Registration_work'
      displayName.value = 'Porntip Panya'
      imageSrc.value = Aoi
      staffIdToView.value = 2
      break

    case '5':
    case 5:
      selectedTopic.value = 'Graduate_studies'
      displayName.value = 'Rattikarn Nanglae'
      imageSrc.value = Lek
      staffIdToView.value = 4
      break

    default:
      selectedTopic.value = 'N/A'
      displayName.value = 'Default Name'
      imageSrc.value = boy
      staffIdToView.value = null
  }
})
</script>

