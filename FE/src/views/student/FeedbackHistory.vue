<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-indigo-700 mb-4">
      ประวัติฟีดแบคของฉัน
    </h1>

    <!-- โหลดอยู่ -->
    <div v-if="loading" class="text-center py-5 text-gray-500">กำลังโหลด...</div>

    <!-- ไม่มีประวัติ -->
    <div v-if="!loading && history.length === 0" class="text-center py-10 text-gray-500">
      ยังไม่มีประวัติฟีดแบค
    </div>

    <!-- รายการประวัติ -->
    <div v-for="item in history" :key="item.id"
      class="p-4 bg-white rounded-xl shadow mb-4 border">
      
      <div class="flex justify-between mb-2">
        <span class="font-bold text-indigo-600">#{{ item.ref_id }}</span>
        <span class="text-xs px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700">
          {{ item.type }}
        </span>
      </div>

      <p><strong>Date:</strong> {{ formatDate(item.date) }}</p>
      <p><strong>Topic:</strong> {{ item.topic }}</p>
      <p><strong>Feedback:</strong> {{ item.feedback }}</p>

      <div class="mt-2 text-xs text-gray-400">
        ให้คะแนน: {{ item.rating }}/5
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const history = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken')
    const res = await fetch('/api/feedback/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()

    history.value = data.items || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const formatDate = (iso) => {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`
}
</script>

<style scoped>
</style>
