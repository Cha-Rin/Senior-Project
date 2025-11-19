<script setup>
import { ref, computed, onMounted } from 'vue'
import Feedback from "@/components/student/Feedback.vue"
import axios from 'axios'

console.log('🧩 AppointmentsFeedback component loaded')

// -------------------- State --------------------
const appointments = ref([])
const topics = ref([])
const selectedTopic = ref('')
const token = localStorage.getItem('authToken')

// -------------------- onMounted --------------------
onMounted(async () => {
  console.log('🧩 AppointmentsFeedback.vue mounted running')

  if (!token) {
    console.error('❌ No authToken found in localStorage')
    return
  }

  try {
    console.log("🔑 Fetching approved topics (using token)")
    const res = await fetch('/api/student/appointment-topics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json()
    console.log('📥 Topics response:', data)

    if (data.success) {
      topics.value = Array.isArray(data.topics) ? data.topics : []
      console.log("✅ topics.value =", topics.value)
    } else {
      console.warn("⚠️ API returned error or no success flag:", data)
    }
  } catch (err) {
    console.error('❌ Error fetching topics:', err)
  }

  await loadAppointments()
})

// -------------------- Load Appointments --------------------
async function loadAppointments() {
  try {
    console.log("🔑 Fetching appointments (using token)")

    const res = await fetch('/api/student/appointments/for-feedback?approved_set=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json()
    console.log("📥 Appointments response:", data)

    appointments.value = Array.isArray(data?.items) ? data.items : []

  } catch (e) {
    console.error("❌ loadAppointments error:", e)
    appointments.value = []
  }
}

// -------------------- Computed --------------------
const filteredTopics = computed(() => topics.value)

const filteredItems = computed(() => {
  if (!selectedTopic.value) return appointments.value
  return appointments.value.filter(a => a.topic === selectedTopic.value)
})

// -------------------- Submit Feedback (COMMENT OPTIONAL) --------------------
async function handleSubmit(payload) {
  try {
    console.log("🧩 handleSubmit payload:", payload)

    const res = await fetch('/api/student/feedback/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        appointment_id: payload.itemId,   // Required
        ratings: payload.ratings,         // Array
        comment: payload.note || ''       // ⭐ COMMENT OPTIONAL
      })
    })

    const result = await res.json()
    console.log("📥 Feedback submit response:", result)

    if (result.success) {
      alert('ส่งความคิดเห็นเรียบร้อย ✅')

      // 🔥 Remove completed appointment from list
      appointments.value = appointments.value.filter(
        a => a.appointment_id !== payload.itemId
      )

      // 🔥 Recalculate topics
      const remainingTopics = [...new Set(appointments.value.map(a => a.topic))]
      topics.value = topics.value.filter(t => remainingTopics.includes(t))

      if (!remainingTopics.includes(selectedTopic.value)) {
        selectedTopic.value = ''
      }

    } else {
      alert(result.message || 'เกิดข้อผิดพลาด')
    }

  } catch (e) {
    console.error('❌ handleSubmit error:', e)
    alert('เกิดข้อผิดพลาดในการส่ง feedback')
  }
}
</script>

<template>
  <Feedback
    :items="appointments"
    :topics="topics"
    default-category="Appointment"
    @submit="handleSubmit"
  />
</template>
