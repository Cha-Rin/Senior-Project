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
            :class="[
              'px-3 py-1 rounded mt-1 transition-colors',
              staffIdToView === staff.user_id
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            ]"
            @click="selectStaff(staff)"
          >
            {{ staffIdToView === staff.user_id ? '✓ Selected' : 'See the schedule' }}
          </button>
        </div>
      </div>

      <!-- 🔹 แสดงข้อมูล Staff ที่เลือก -->
      <div v-if="selectedStaffInfo" class="bg-blue-50 p-3 rounded-lg mb-4 max-w-md">
        <p class="text-sm text-gray-600">You are viewing the table of...:</p>
        <p class="text-lg font-semibold text-blue-700">{{ selectedStaffInfo.staff_name }}</p>
        <p class="text-xs text-gray-500">Category: {{ selectedStaffInfo.type }}</p>
      </div>

      <!-- 🔹 ตารางเวลา -->
      <StudentScheduleView 
        v-if="staffIdToView"
        :staffId="staffIdToView"
        @update:unavailableData="onUnavailableDataUpdate"
        @update:weekRange="onWeekRangeUpdate"
      />

      <!-- 🔹 ฟอร์มทั้งหมด -->
      <div class="bg-blue-900 text-white w-full max-w-xs p-4 rounded-xl space-y-4 mb-10">

        <!-- Date -->
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

        <!-- Time -->
        <label class="block text-left">
          <span class="text-sm font-medium">Time:</span>
          <select v-model="selectedSlot" class="border rounded p-1 w-full text-black">
            <option disabled value="">-- Please select a time period. --</option>
            <option v-for="slot in availableTimeSlots" :key="slot" :value="slot">
              {{ slot }}
            </option>
            <option
              v-if="selectedDate && availableTimeSlots.length === 0"
              disabled
            >
              -- Unavailable / Holiday --
            </option>
          </select>
        </label>

        <!-- Comment -->
        <label class="block text-left">
          <span class="text-sm font-medium">Comment:</span>
          <textarea
            v-model="note"
            rows="3"
            class="border rounded p-1 w-full text-black resize-none"
            placeholder="More information…"
          ></textarea>
        </label>

      </div>

      <!-- ปุ่ม Submit -->
      <button
        @click="submitAppointment"
        :disabled="!staffIdToView || !selectedDate || !selectedSlot"
        :class="[
          'px-4 py-2 rounded transition-colors',
          !staffIdToView || !selectedDate || !selectedSlot
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        ]"
      >
        Submit
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

// --------------------------------------------
// State
// --------------------------------------------
const staffList = ref([])
const staffIdToView = ref(null)
const selectedStaffInfo = ref(null)
const selectedDate = ref('')
const selectedSlot = ref('')
const note = ref('')
const categoryId = ref(null)

// --------------------------------------------
// ตารางเวลา
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

const onUnavailableDataUpdate = (data) => {
  unavailableMasterSet.value = data
}

const onWeekRangeUpdate = (range) => {
  weekStartDate.value = range.start
  weekEndDate.value = range.end
}

// --------------------------------------------
// 🎯 เลือก Staff
// --------------------------------------------
function selectStaff(staff) {
  staffIdToView.value = staff.user_id
  selectedStaffInfo.value = {
    staff_name: staff.staff_name,
    type: staff.type,
    profile_image: staff.profile_image
  }
  
  // รีเซ็ตการเลือกวันและเวลาเมื่อเปลี่ยน staff
  selectedDate.value = ''
  selectedSlot.value = ''
  unavailableMasterSet.value = new Set()
}

// --------------------------------------------
// Filter Available Time
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
    const unavailable = unavailableMasterSet.value.has(key)
    if (unavailable) return false

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
// โหลด staff ของ category
// --------------------------------------------
onMounted(async () => {
  try {
    categoryId.value = route.query.category_id
    const res = await axios.get('/api/student/categories-with-staff')

    if (!res.data || !Array.isArray(res.data)) {
      console.error('API ไม่ส่ง array ของ staff')
      return
    }

    staffList.value = res.data.filter(
      (c) => String(c.category_id) === String(categoryId.value)
    )

    if (staffList.value.length === 0) {
      console.warn('ไม่พบ staff ใน category:', categoryId.value)
      return
    }

    // ตั้งค่า default staff คนแรก
    selectStaff(staffList.value[0])

  } catch (err) {
    console.error('❌ Error fetching staff:', err)
  }
})

// --------------------------------------------
// 🚀 Submit Appointment (ส่งไปหา staff_id ที่เลือก)
// --------------------------------------------
async function submitAppointment() {
  if (!staffIdToView.value) {
    alert('Please select a staff member.')
    return
  }

  if (!selectedDate.value || !selectedSlot.value) {
    alert('Please select a date and time range.')
    return
  }

  const studentEmail = localStorage.getItem('email')

  // ✅ ส่ง user_id = staff_id (เพราะนักศึกษาไม่มี user_id)
  const payload = {
    user_id: staffIdToView.value, // ✅ user_id = staff_id ของ staff ที่เลือก
    category_id: categoryId.value,
    student_email: studentEmail, // ✅ ใช้ email ระบุนักศึกษา
    appointment_date: `${selectedDate.value} ${selectedSlot.value}`,
    student_note: note.value || '',
    status: '0' // pending
  }

  try {
  const token = localStorage.getItem('authToken') // ✅ ดึง token
  
  const res = await axios.post('/api/student/appointments', payload, {
    headers: {
      'Authorization': `Bearer ${token}` // ✅ ส่ง token ไปด้วย
    }
  })
  
  if (res.data.success) {
    alert(`✅ Appointment with ${selectedStaffInfo.value.staff_name} Complete!`)
    router.push({ name: 'Historytest' })
  } else {
    alert('❌ Failed to save appointment')
  }
} catch (err) {
  console.error('❌ Error saving appointment:', err)
  
  // ✅ เช็คว่าเป็น 401 (Unauthorized) หรือไม่
  if (err.response?.status === 401) {
    alert('⚠️ Please log in again.')
    localStorage.removeItem('authToken')
    router.push({ name: 'Login' })
  } else {
    alert('⚠️ Error saving appointment.')
  }
}
}
</script>