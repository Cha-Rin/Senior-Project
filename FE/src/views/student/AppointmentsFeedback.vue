<script setup>
import { ref, onMounted } from 'vue'
import Feedback from "@/components/student/Feedback.vue";
const appointments = ref([])
const topics = ref([])
onMounted(async () => {
  console.log("Effective User ID:", effectiveUserId.value)

  if (effectiveUserId.value) {
    await Promise.all([
      loadAppointmentsByUser(effectiveUserId.value),
      loadTopicsByUser(effectiveUserId.value)
    ])
  } else {
    console.warn("No userId found, loading all appointments only")
    await loadAllAppointments()
  }
})
async function loadTopicsByUser(userId) {
  try {
    console.log("Loading topics for user:", userId)
    const res = await fetch(`http://localhost:3000/student/users/${userId}/appointment-topics?scope=all`)
    const data = await res.json()
    console.log("API response:", data)
    topics.value = Array.isArray(data?.topics) ? data.topics : []
  } catch (e) {
    console.error("loadTopicsByUser error:", e)
    topics.value = []
  }
}


onMounted(async () => {
  const [r1, r2] = await Promise.all([
    fetch('http://localhost:3000/student/appointments?scope=pending&approved_set=1'),
    fetch('http://localhost:3000/categories/topics')
  ])
  appointments.value = await r1.json()
  const data2 = await r2.json()
  topics.value = Array.isArray(data2?.topics) ? data2.topics : []
})

async function handleSubmit(payload) {
  // ส่งไป backend ฝั่ง appointments
  await fetch('http://localhost:3000/feedback/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  // TODO: แจ้งเตือน success / รีเฟรชรายการตามต้องการ
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
