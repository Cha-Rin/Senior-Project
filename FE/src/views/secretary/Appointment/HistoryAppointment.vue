<template>
  <div class="min-h-screen bg-white p-6 space-y-4">
    <!-- Title -->
    <h1 class="text-5xl font-semibold">History</h1>

    <!-- Date range (mock) -->
    <label class="inline-flex items-center gap-2 text-sm font-medium">
      <!-- calendar icon -->
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600"
           fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z"/>
      </svg>
      <select class="border rounded px-3 py-2 shadow text-gray-700">
        <option>21 APR 2025  -  25 APR 2025 ▼</option>
      </select>
    </label>

    <!-- Header -->
    <div class="max-w-5xl">
      <div
        class="grid grid-cols-5 gap-4 bg-gray-300 text-gray-800 font-semibold rounded-2xl px-6 py-4"
      >
        <div>No.</div>
        <div>Student ID</div>
        <div>Date &amp; Time</div>
        <div>Topic</div>
        <div class="text-right">status</div>
      </div>

      <!-- Rows -->
      <div class="mt-4 space-y-4">
        <div
          v-for="(item, i) in history"
          :key="i"
          class="grid grid-cols-5 gap-4 items-center bg-white rounded-2xl px-6 py-5 shadow-sm ring-1 ring-gray-100"
        >
          <!-- No. -->
          <div class="text-xl font-extrabold tracking-wide">{{ item.no }}</div>

          <!-- Student ID -->
          <div class="text-gray-700">65xxxxxxxx</div>

          <!-- Date & Time -->
          <div class="text-gray-700">
            <div>Date: {{ item.date }}</div>
            <div>Time: {{ item.time }}</div>
          </div>

          <!-- Topic -->
          <div class="text-gray-700">Course registration;</div>

          <!-- Status -->
          <div class="text-right font-semibold" :class="statusClass(item.status)">
            {{ item.status }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const history = ref([
  { no: 'A001', date: '21/03/25', time: '8:00 - 9:00AM',  status: 'Reject'  },
  { no: 'A002', date: '21/03/25', time: '9:00 - 10:00AM', status: 'Approve' },
  { no: 'A003', date: '21/03/25', time: '10:00 - 11:00AM', status: 'Reject' }
])

const statusClass = (s) => {
  if (s?.toLowerCase() === 'approve') return 'text-emerald-400'
  if (s?.toLowerCase() === 'reject')  return 'text-rose-400'
  return 'text-gray-500'
}
</script>
