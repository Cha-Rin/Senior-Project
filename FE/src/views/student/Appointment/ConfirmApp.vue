<template>
  <div class="min-h-screen flex flex-col items-center pt-10 px-4 py-8 bg-white text-center">
    <h1 class="text-xl font-semibold mb-4">Confirm an appointment</h1>

    <!-- แสดงรูปและชื่อ staff -->
    <img :src="imageSrc" alt="Profile" class="w-24 h-24 mb-2 rounded-full object-cover" />
    <p class="text-lg font-medium mb-4">{{ displayName }}</p>

    <!-- วันที่และเวลา -->
    <div class="bg-gray-300 rounded-full px-4 py-2 text-sm mb-4">
      Date: {{ date }}, Time: {{ time }}
    </div>

    <!-- ช่องคอมเม้น -->
    <div class="bg-white w-full p-4 shadow-md rounded-xl text-left mt-8 space-y-2">
      <p class="text-sm"><strong>Topic:</strong> {{ selectedTopic }}</p>
      <textarea
        v-model="note"
        placeholder="Comment..."
        class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
        rows="3"
      ></textarea>
    </div>
    
    <!-- ปุ่ม Confirm -->
    <button
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition mt-6"
      @click="submitAppointment"
    >
      Confirm
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const selectedTopic = ref('')
const displayName = ref('')
const imageSrc = ref('')
const date = ref('')
const time = ref('')
const note = ref('')
const category_id = ref(null)
const staffId = ref(null)

onMounted(() => {
  const q = route.query

  displayName.value = q.name || 'Default Name'
  imageSrc.value = q.avatar || '/uploads/default.png'
  selectedTopic.value = q.topic || 'N/A'
  date.value = q.date || ''
  time.value = q.time || ''
  note.value = q.note || ''
  category_id.value = q.category_id || null
  staffId.value = q.staffId || null
})

async function submitAppointment() {
  const userId = localStorage.getItem('userId')
  const studentEmail = localStorage.getItem('email')

  // ส่งเฉพาะข้อมูลที่นักเรียนสามารถแก้ไขได้
  const payload = {
    user_id: userId,
    staff_id: staffId.value,
    category_id: category_id.value,
    student_email: studentEmail,
    appointment_date: `${date.value} ${time.value}`,
    student_note: note.value || '',
    status: '0' // รออนุมัติ
  }

  try {
    const res = await axios.post('/api/student/appointments', payload)
    if (res.data.success) {
      router.push({ name: 'Historytest' })
    } else {
      alert('❌ Failed to save appointment')
    }
  } catch (err) {
    console.error('❌ Error during appointment submission:', err)
    alert('⚠️ Error saving appointment.')
  }
}
</script>
