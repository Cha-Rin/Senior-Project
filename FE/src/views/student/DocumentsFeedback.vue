<script setup>
import { ref, onMounted } from 'vue'
import Feedback from "@/components/student/Feedback.vue";

const documents = ref([])
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


onMounted(async () => {
  const [r1, r2] = await Promise.all([
    fetch('http://localhost:3000/student/documents?scope=pending&approved_set=1'),
    fetch('http://localhost:3000/categories/topics')
  ])
  documents.value = await r1.json()
  const data2 = await r2.json()
  topics.value = Array.isArray(data2?.topics) ? data2.topics : []
})

async function handleSubmit(payload) {
  // ส่งไป backend ฝั่ง documents
  await fetch('http://localhost:3000/feedback/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}
</script>

<template>
  <Feedback
    :items="documents"
    :topics="topics"
    default-category="Document"
    @submit="handleSubmit"
  />
</template>
