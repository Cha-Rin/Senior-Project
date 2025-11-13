<template>
  <div>
    <div class="min-h-screen bg-white pt-20 px-4 py-2 flex flex-col items-center text-center">
      <h1 class="text-xl font-semibold mb-4">Create an appointment</h1>

      <!-- 🔹 ข้อมูลพี่เลขา (หลายคน) -->
      <div class="flex flex-wrap justify-center mb-4">
        <div
          v-for="staff in staffList"
          :key="staff.user_id"
          class="flex flex-col items-center mx-2 mb-2"
        >
          <img
            :src="staff.profile_image ? `/uploads/${staff.profile_image}` : '/uploads/default.png'"
            alt="Profile"
            class="w-24 h-24 rounded-full mb-2"
          />
          <p class="text-lg font-medium">{{ staff.staff_name }}</p>
          <button
            class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mt-1"
            @click="staffIdToView = staff.user_id"
          >
            ดูตารางเวลา
          </button>
        </div>
      </div>

      <!-- 🔹 ตารางตารางเวลา -->
      <StudentScheduleView 
        v-if="staffIdToView"
        :staffId="staffIdToView"
        @update:unavailableData="onUnavailableDataUpdate"
        @update:weekRange="onWeekRangeUpdate"
      />

      <!-- 🔹 ฟอร์มเลือกวันและเวลา -->
      <div class="bg-blue-900 text-white w-full max-w-xs p-4 rounded-xl space-y-3 mb-10">
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
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const userId = localStorage.getItem('userId')

// --------------------------------------------
// 🔹 State
// --------------------------------------------
const staffList = ref([])
const staffIdToView = ref(null)
const selectedTopic = ref('')
const selectedDate = ref('')
const selectedSlot = ref('')
const displayName = ref('')
const imageSrc = ref('')
const note = ref('')
const categoryId = ref(null)

// --------------------------------------------
// 🔹 ตารางเวลา
// --------------------------------------------
const unavailableMasterSet = ref(new Set())
const weekStartDate = ref('')
const weekEndDate = ref('')
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

const onUnavailableDataUpdate = (dataFromChild) => {
  unavailableMasterSet.value = dataFromChild
}
const onWeekRangeUpdate = (range) => {
  weekStartDate.value = range.start
  weekEndDate.value = range.end
}

// --------------------------------------------
// 🔹 Filter เวลาที่ว่าง
// --------------------------------------------
const getDayIndexFromDateString = (dateStr) => {
  if (!dateStr) return -1
  const d = new Date(`${dateStr}T12:00:00`)
  const js = d.getDay()
  if (js === 0 || js === 6) return -1
  return js - 1
}

const availableTimeSlots = computed(() => {
  const dayIndex = getDayIndexFromDateString(selectedDate.value)
  if (dayIndex === -1) return []

  const now = new Date()
  const selected = new Date(`${selectedDate.value}T00:00:00`)
  const isToday = selected.toDateString() === now.toDateString()

  return timeSlots.filter((slot, timeIndex) => {
    if (timeIndex === LUNCH_ROW_INDEX) return false
    const key = `${timeIndex},${dayIndex}`
    const isUnavailable = unavailableMasterSet.value.has(key)
    if (isUnavailable) return false
    if (isToday) {
      const startHour = parseInt(slot.split(':')[0])
      const startMinute = parseInt(slot.split(':')[1].split(' ')[0])
      const slotTime = new Date(selected)
      slotTime.setHours(startHour, startMinute, 0, 0)
      if (slotTime <= now) return false
    }
    return true
  })
})

// --------------------------------------------
// 🔹 โหลด staff ของ category
// --------------------------------------------
onMounted(async () => {
  try {
    categoryId.value = route.query.category_id
    const res = await axios.get('/api/student/categories-with-staff')

    if (!res.data || !Array.isArray(res.data)) {
      console.error('API ไม่ส่ง array ของ staff')
      return
    }

    const selectedCategory = res.data.find(
      (c) => String(c.user_id) === String(userId) && String(c.category_id) === String(categoryId.value)
    )

    if (selectedCategory) {
      selectedTopic.value = selectedCategory.type
      displayName.value = selectedCategory.staff_name
      staffIdToView.value = selectedCategory.user_id

      imageSrc.value = selectedCategory.profile_image
        ? `/uploads/${selectedCategory.profile_image}`
        : '/uploads/default.png'
    }

    staffList.value = res.data.filter(
      (c) => String(c.category_id) === String(categoryId.value)
    )

    if (staffList.value.length === 0) {
      console.warn('ไม่พบ staff ใน category:', categoryId.value)
    }
  } catch (err) {
    console.error('❌ Error fetching categories-with-staff:', err)
  }
})

// --------------------------------------------
// 🔹 Next
// --------------------------------------------
function goToConfirm() {
  if (!selectedDate.value || !selectedSlot.value) {
    alert('กรุณาเลือกวันและช่วงเวลา')
    return
  }

  // หา staff object ตาม staffIdToView
  const staffObj = staffList.value.find(s => s.user_id === staffIdToView.value)
  const nameToSend = staffObj?.staff_name || 'Default Name'
  const topicToSend = staffObj?.type || 'N/A'
  const avatarToSend = staffObj?.profile_image ? `/uploads/${staffObj.profile_image}` : '/uploads/default.png'

  router.push({
    name: 'ConfirmAppointment',
    query: {
      topic: topicToSend,
      name: nameToSend,
      avatar: avatarToSend,
      staffId: staffIdToView.value,
      category_id: categoryId.value,
      date: selectedDate.value,
      time: selectedSlot.value,
      note: note.value
    }
  })
}


</script>
