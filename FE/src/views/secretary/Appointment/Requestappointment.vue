<!-- 📁 src/views/secretary/AppointmentRequest.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Request Appointment
      </h1>

      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="grid grid-cols-6 gap-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl px-6 py-4 shadow-lg">
          <div>No</div>
          <div>ID</div>
          <div>Date &amp; Time</div>
          <div>Topic</div>
          <div>Note</div>
          <div class="text-right">Status</div>
        </div>

        <!-- Rows -->
        <div class="mt-4 space-y-4">
          <div
            v-for="(item, i) in requests"
            :key="item.no"
            class="grid grid-cols-6 gap-4 items-center bg-white rounded-2xl px-6 py-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
          >
            <!-- No -->
            <div class="text-lg md:text-xl font-extrabold tracking-wide text-indigo-700">
              {{ item.no }}
            </div>

            <!-- ID -->
            <div class="text-gray-700 font-medium">{{ item.studentId }}</div>

            <!-- Date & Time -->
            <div class="text-gray-700 space-y-1">
              <div class="font-medium">Date: {{ item.date }}</div>
              <div class="text-sm text-gray-500">Time: {{ item.time }}</div>
            </div>

            <!-- Topic -->
            <div class="text-gray-800 font-medium">{{ item.topic }}</div>

            <!-- Note -->
            <div class="text-gray-500 text-sm italic">{{ item.note }}</div>

            <!-- Status / Actions -->
            <div class="flex justify-end items-center gap-2">
              <!-- ถ้ายังรอ -->
              <template v-if="item.status === 'Pending'">
                <button
                  @click="setStatus(item, 'Approved')"
                  class="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  ✅ Approve
                </button>
                <button
                  @click="setStatus(item, 'Rejected')"
                  class="px-4 py-2 rounded-full text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  ❌ Reject
                </button>
              </template>

              <!-- ถ้าอนุมัติแล้ว -->
              <template v-else-if="item.status === 'Approved'">
                <span class="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span>✅</span> Approved
                </span>
                <button
                  @click="setStatus(item, 'Pending')"
                  class="text-xs text-gray-500 underline hover:text-gray-700 font-medium"
                >
                  Undo
                </button>
              </template>

              <!-- ถ้าถูกปฏิเสธ -->
              <template v-else>
                <span class="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-100 text-rose-700 flex items-center gap-1">
                  <span>❌</span> Rejected
                </span>
                <button
                  @click="setStatus(item, 'Pending')"
                  class="text-xs text-gray-500 underline hover:text-gray-700 font-medium"
                >
                  Undo
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const requests = ref([
  { no: 'A001', studentId: '65xxxxxxxx', date: '21/03/25', time: '8:00 - 9:00AM', topic: 'Course registration', note: '', status: 'Pending' },
  { no: 'A002', studentId: '65xxxxxxxx', date: '21/03/25', time: '9:00 - 10:00AM', topic: 'Course registration', note: '', status: 'Pending' },
  { no: 'A003', studentId: '65xxxxxxxx', date: '21/03/25', time: '10:00 - 11:00AM', topic: 'Course registration', note: '', status: 'Pending' }
])

// ✅ ใช้ splice เพื่อให้ Vue ตรวจจับการเปลี่ยนแปลง
const setStatus = (item, status) => {
  const index = requests.value.findIndex(r => r.no === item.no)
  if (index !== -1) {
    requests.value.splice(index, 1, { ...item, status })
  }
}

</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>