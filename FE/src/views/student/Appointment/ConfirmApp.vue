<template>
  <div>

  <div class="min-h-screen flex flex-col items-center pt-10 px-4 py-2 bg-white text-center">
    <h1 class="text-xl font-semibold mb-4">Confirm an appointment</h1>

    <!-- ✅ แสดงรูปและชื่อจาก query -->
    <img :src="imageSrc" alt="Profile" class="w-24 h-24 mb-2 rounded-full object-cover" />
    <p class="text-lg font-medium mb-4">{{ name }}</p>

    <div class="bg-gray-300 rounded-full px-4 py-2 text-sm mb-4">
      Date: {{ date }}, Time: {{ time }}
    </div>
      <!-- ช่องคอมเม้น  -->
    <div class="bg-white w-full p-4 shadow-md rounded-xl text-left mt-8 space-y-2">
      <p class="text-sm"><strong>Topic:</strong> {{ selectedTopic }}</p>
      <textarea
        v-model="note"
        placeholder="Comment..."
        class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
        rows="3"></textarea>
    </div>
    
    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition mt-6"
      @click="goToConfirm">Confirm</button>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import girl from '@/assets/girl.png'
import boy from '@/assets/boy.png'
import unicorn from '@/assets/unicorn.png'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const selectedTopic = ref('')
const staffName = ref('')
const staffAvatar = ref('')
const displayName = ref('')
const imageSrc = ref('')
const category_id = ref('')

const topic = ref('')
const name = ref('')
const avatar = ref('')
const date = ref('')
const time = ref('')
const note = ref('')
const userId = localStorage.getItem('userId') 

onMounted(() => {
  const q = route.query
  console.log('Query params in ConfirmAppointment:', q)

  name.value = q.name || 'No Name'
  avatar.value = q.avatar || ''
  date.value = q.date || 'N/A'
  time.value = q.time || 'N/A'
  note.value = q.note || ''
  staffName.value = q.name
  staffAvatar.value = q.avatar

  // ✅ อัปเดตตรงนี้
  topic.value = q.topic || 'N/A'
  selectedTopic.value = topic.value
  category_id.value = q.category_id || mapTopicToCategory(topic.value)
  console.log('✅ Final category_id:', category_id.value)

  if (staffName.value && staffAvatar.value) {
    displayName.value = staffName.value
    imageSrc.value = staffAvatar.value
  } else {
    switch (selectedTopic.value) {
      case 'Appointment':
        displayName.value = 'Porntip Panya'
        imageSrc.value = girl
        break
      case 'Document Request':
        displayName.value = 'Tanawat Suriya'
        imageSrc.value = boy
        break
      case 'Unicorn':
        displayName.value = 'Unicorn Support'
        imageSrc.value = unicorn
        break
      default:
        displayName.value = 'Default Name'
        imageSrc.value = girl
    }
  }
})


function mapTopicToCategory(topic) {
  switch (topic) {
    case 'Student_Activities': return 1
    case 'Cooperative_Education': return 2
    case 'Installment_Payment': return 3
    case 'Registration_work': return 4
    case 'Graduate_studies': return 5
    default: return null
  }
}

console.log('Query topic:', topic.value)
console.log('Mapped category_id:', mapTopicToCategory(topic.value))

async function goToConfirm() {
  const fullDateTime = `${date.value} ${time.value}`
  const userId = localStorage.getItem('userId')
  const studentEmail = localStorage.getItem('email')

  const payload = {
    user_id: userId,
    category_id: mapTopicToCategory(topic.value),
    student_email: studentEmail,
    appointment_date: fullDateTime,
    staff_offtime: fullDateTime,
    status: '0',
    student_note: note.value || ''
  }

  console.log('🧩 userId:', userId)
  console.log('📦 Sending payload:', payload)

  try {
    const res = await fetch('http://localhost:3000/student/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (data.success) {
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

