<template>
  <div class="p-4 pt-20 max-w-xl mx-auto">

    <h1 class="text-2xl font-bold text-indigo-700 mb-6 text-center">
      History Feedback
    </h1>

    <!-- Tabs -->
    <div class="flex mb-4 border-b">
      <button
        @click="activeTab = 'apt'"
        :class="activeTab === 'apt'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-500'"
        class="flex-1 py-2 text-center font-semibold"
      >
        Appointment
      </button>

      <button
        @click="activeTab = 'doc'"
        :class="activeTab === 'doc'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-500'"
        class="flex-1 py-2 text-center font-semibold"
      >
        Document
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500 py-5">
      Loading...
    </div>

    <!-- No data -->
    <div v-if="!loading && currentList.length === 0"
         class="text-center py-10 text-gray-500">
      You have no feedback history yet.
    </div>

    <!-- History list -->
    <div v-for="item in currentList" :key="item.feedback_id"
         class="p-4 bg-white rounded-xl shadow mb-4 border">

      <div class="flex justify-between mb-2">
        <span class="font-bold text-indigo-600">#{{ item.ref_id }}</span>

        <span class="text-xs px-2 py-1 rounded-lg"
          :class="item.type === 'appointment'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-yellow-100 text-yellow-800'">
          {{ item.type }}
        </span>
      </div>

      <p><strong>Date :</strong> {{ format(item.date) }}</p>
      <p><strong>Topic :</strong> {{ item.topic }}</p>
      <p><strong>Comment :</strong> {{ item.comment || '-' }}</p>

      <p class="text-xs text-gray-500 mt-2">
        Average : <strong>{{ item.avg }}</strong> / 5
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from "vue-router"

const route = useRoute()

const loading = ref(true)
const aptList = ref([])
const docList = ref([])

// เปิดแท็บถูกต้องตาม query
const activeTab = ref(route.query.type === "doc" ? "doc" : "apt")

onMounted(async () => {
  const email = localStorage.getItem("email")
  const token = localStorage.getItem("authToken")

  if (!email) {
    loading.value = false
    return
  }

  try {
    // ---- Appointment ----
    const r1 = await fetch(`/api/student/feedback/history/appointments/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const d1 = await r1.json()

    aptList.value = d1.history?.map(x => ({
      feedback_id: x.feedback_id,
      ref_id: x.appointment_id,
      type: "appointment",
      date: x.appointment_date,
      topic: x.topic,
      comment: x.comment,
      avg: avg(x.score_count1, x.score_count2, x.score_count3)
    })) || []

    // ---- Document ----
    const r2 = await fetch(`/api/student/feedback/history/documents/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const d2 = await r2.json()

    docList.value = d2.history?.map(x => ({
      feedback_id: x.feedback_id,
      ref_id: x.document_id,
      type: "document",
      date: x.submit_date,
      topic: x.topic,
      comment: x.comment,
      avg: avg(x.score_count1, x.score_count2, x.score_count3)
    })) || []

  } catch (err) {
    console.error("❌ History error:", err)
  } finally {
    loading.value = false
  }
})

// tab list
const currentList = computed(() =>
  activeTab.value === "apt" ? aptList.value : docList.value
)

// avg score
function avg(a, b, c) {
  return ((Number(a) + Number(b) + Number(c)) / 3).toFixed(2)
}

// date format
function format(iso) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`
}
</script>
