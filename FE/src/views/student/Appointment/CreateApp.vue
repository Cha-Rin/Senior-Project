<template>
  <div>
    <div class="min-h-screen bg-white pt-20 px-4 py-2 flex flex-col items-center text-center">
      <h1 class="text-xl font-semibold mb-4">Create an appointment</h1>

      <!-- 🔹 ข้อมูลพี่เลขา -->
      <img :src="imageSrc" alt="Profile" class="w-24 h-24 mb-2 rounded-full" />
      <p class="text-lg font-medium mb-4">{{ displayName }}</p>

      <!-- 🔹 ตารางตารางเวลา -->
      <StudentScheduleView 
        v-if="staffIdToView"
        :staffId="staffIdToView"
        @update:unavailableData="onUnavailableDataUpdate"
        @update:weekRange="onWeekRangeUpdate"
      />

      <!-- 🔹 ฟอร์มเลือกวันและเวลา -->
      <div class="bg-blue-900 text-white w-full max-w-xs p-4 rounded-xl space-y-3 mb-10">
        <!-- เลือกวัน -->
        <label class="block text-left">
          <span class="text-sm font-medium">Date:</span>
          <input
            type="date"
            v-model="selectedDate"
            :min="weekStartDate"
            :max="weekEndDate"
            class="border rounded p-1 w-full text-black"
          />
        </label>

        <!-- เลือกเวลา -->
        <label class="block text-left">
          <span class="text-sm font-medium">Time:</span>
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

      <!-- ปุ่ม Next -->
      <button @click="goToConfirm" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import StudentScheduleView from '@/components/student/StudentScheduleView.vue'

// 🔹 รูปพี่ๆ
import boy from '@/assets/boy.png'
import phum from '@/assets/P_Pong.png'
import Aoi from '@/assets/P_Aoi.png'
import Lek from '@/assets/P_Lek.png'
import Ang from '@/assets/P_Angoon.png'

const router = useRouter()
const route = useRoute()
const userId = localStorage.getItem('userId')

// --------------------------------------------
// 🔹 State
// --------------------------------------------
const selectedTopic = ref('')
const displayName = ref('')
const imageSrc = ref('')
const note = ref('')
const staffIdToView = ref(null)
const selectedDate = ref('')
const selectedSlot = ref('')

// --------------------------------------------
// 🔹 Data จากตารางเวลา
// --------------------------------------------
const unavailableMasterSet = ref(new Set()) // ช่องที่ไม่ว่าง
const weekStartDate = ref('')               // วันที่เริ่มต้นของสัปดาห์
const weekEndDate = ref('')                 // วันที่สิ้นสุดของสัปดาห์

// ✅ รับ emit จาก child
const onUnavailableDataUpdate = (dataFromChild) => {
  unavailableMasterSet.value = dataFromChild
}
const onWeekRangeUpdate = (range) => {
  weekStartDate.value = range.start
  weekEndDate.value = range.end
}

// --------------------------------------------
// 🔹 ตารางเวลา
// --------------------------------------------
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

// --------------------------------------------
// 🔹 Helper: แปลงวันที่เป็น index วันจันทร์-ศุกร์
// --------------------------------------------
const getDayIndexFromDateString = (dateStr) => {
  if (!dateStr) return -1
  const d = new Date(`${dateStr}T12:00:00`)
  const js = d.getDay()
  if (js === 0 || js === 6) return -1 // ห้ามเลือกเสาร์-อาทิตย์
  return js - 1
}

// --------------------------------------------
// 🔹 Filter: เวลาที่ว่างในวันนั้น
// --------------------------------------------
const availableTimeSlots = computed(() => {
  const dayIndex = getDayIndexFromDateString(selectedDate.value)
  if (dayIndex === -1) return []

  const now = new Date()
  const selected = new Date(`${selectedDate.value}T00:00:00`)
  const isToday = selected.toDateString() === now.toDateString()

  return timeSlots.filter((slot, timeIndex) => {
    // ❌ ห้ามเลือกช่วงพักกลางวัน
    if (timeIndex === LUNCH_ROW_INDEX) return false

    // ❌ ห้ามเลือกช่องที่ไม่ว่างจากตารางของพี่เลขา
    const key = `${timeIndex},${dayIndex}`
    const isUnavailable = unavailableMasterSet.value.has(key)
    if (isUnavailable) return false

    // ✅ ถ้าเป็นวันเดียวกับวันนี้ → ตรวจว่าเวลานั้นผ่านไปแล้วไหม
    if (isToday) {
      // แยกเวลาเริ่มต้นออกมา เช่น "08:00 - 09:00" → 8
      const startHour = parseInt(slot.split(':')[0])
      const startMinute = parseInt(slot.split(':')[1].split(' ')[0])
      const slotTime = new Date(selected)
      slotTime.setHours(startHour, startMinute, 0, 0)

      if (slotTime <= now) {
        return false // ❌ ผ่านเวลาแล้ว
      }
    }

    return true // ✅ ใช้ได้
  })
})

// --------------------------------------------
// 🔹 Next: ไปหน้า Confirm
// --------------------------------------------
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

// --------------------------------------------
// 🔹 โหลดข้อมูลพี่เลขา
// --------------------------------------------
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
