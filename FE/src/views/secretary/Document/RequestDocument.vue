<template>
  <div class="flex min-h-screen bg-white">
    <!-- 🔹 Sidebar -->
    <aside class="w-64 bg-[#0B3C6A] text-white p-4 space-y-6">
      <nav class="space-y-4 text-sm">
        <p>Homepage</p>
        <p>Request Document</p>
        <p class="bg-blue-900 rounded px-2 py-1">Document Status</p>
        <p>History</p>
        <p>Feedback</p>
      </nav>
      <button class="mt-auto text-left text-red-200 hover:text-red-400">Log out</button>
    </aside>

    <!-- 🔸 Main Content -->
    <div class="flex-1 p-6">
      <h1 class="text-2xl font-bold mb-6">Request Document</h1>

      <!-- 🔸 Table -->
      <div class="bg-gray-100 rounded-xl overflow-hidden max-w-4xl shadow">
        <div class="grid grid-cols-5 bg-gray-300 font-semibold text-sm p-3">
          <div>No</div>
          <div>ID</div>
          <div>Date</div>
          <div>Topic</div>
          <div>Status</div>
        </div>

        <div
          v-for="(item, i) in documents"
          :key="i"
          class="grid grid-cols-5 items-center p-3 border-t bg-white text-sm"
        >
          <div>{{ item.no }}</div>
          <div>{{ item.studentId }}</div>
          <div>{{ item.date }}</div>
          <div>{{ item.topic }}</div>
          <div class="flex gap-2">
            <button
              class="bg-green-200 text-green-800 px-2 py-1 rounded hover:bg-green-300 text-xs"
            >
              Approve
            </button>
            <button
              class="bg-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-300 text-xs"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const documents = ref([
  {
    no: 'A001',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;'
  },
  {
    no: 'A002',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;'
  },
  {
    no: 'A003',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;'
  }
])
</script>
