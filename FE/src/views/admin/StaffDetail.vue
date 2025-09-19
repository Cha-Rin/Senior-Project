<!-- ✅ StaffDetail.vue -->
<template>
  <div class="p-8 space-y-6">
    <!-- 🔙 Back Button -->
    <button @click="router.back()" class="text-sm text-blue-600 hover:underline">← Back to Dashboard</button>

    <div class="flex items-center gap-6">
      <img :src="avatar" class="w-20 h-20 rounded-full" />
      <div>
        <h2 class="text-2xl font-bold">{{ staffName }}</h2>
        <p class="text-yellow-500">⭐ {{ rating }}</p>
      </div>
    </div>

    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-2">Weekly Details</h3>
      <ul class="list-disc pl-6 text-gray-700">
        <li>Total Appointments: {{ mockDetails.appointments }}</li>
        <li>Total Document Trackings: {{ mockDetails.documents }}</li>
        <li>Average Rating: {{ rating }}</li>
      </ul>
    </div>

    <!-- 📊 Staff Chart (Mock) -->
    <div class="mt-10">
      <WeeklyUsersChart :chartData="chartData" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WeeklyUsersChart from '../components/dashboard/WeeklyUsersChart.vue'

const route = useRoute()
const router = useRouter()
const staffName = route.params.name
const avatar = `/avatars/${staffName}.png`
const rating = ref(4.5)

const mockDetails = {
  appointments: 12,
  documents: 5
}

const chartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: 'Appointment',
      backgroundColor: '#2563eb',
      data: [2, 4, 1, 3, 2]
    },
    {
      label: 'Document Tracking',
      backgroundColor: '#facc15',
      data: [1, 2, 1, 0, 2]
    }
  ]
}
</script>
