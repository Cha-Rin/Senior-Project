<!-- 📁 src/views/secretary/AppointmentRequest.vue -->
<template>
  <!-- ใช้ SecreLayout เพื่อแสดง Navbar + Sidebar -->
  <SecreLayout>
    <div class="page-content">
      <h1 class="text-4xl md:text-5xl font-semibold text-center mb-6">
        Appointment Request
      </h1>

      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="grid grid-cols-5 gap-4 bg-gray-300 text-gray-800 font-semibold rounded-2xl px-6 py-4">
          <div>No</div>
          <div>ID</div>
          <div>Date &amp; Time</div>
          <div>Topic</div>
          <div class="text-right">Status</div>
        </div>

        <!-- Rows -->
        <div class="mt-4 space-y-4">
          <div
            v-for="(item, i) in requests"
            :key="item.no"
            class="grid grid-cols-5 gap-4 items-center bg-gray-100 rounded-2xl px-6 py-5 shadow-sm ring-1 ring-gray-100"
          >
            <!-- No -->
            <div class="text-lg md:text-xl font-extrabold tracking-wide">
              {{ item.no }}
            </div>

            <!-- ID -->
            <div class="text-gray-700">{{ item.studentId }}</div>

            <!-- Date & Time -->
            <div class="text-gray-700">
              <div>Date: {{ item.date }}</div>
              <div>Time: {{ item.time }}</div>
            </div>

            <!-- Topic -->
            <div class="text-gray-700">{{ item.topic }}</div>

            <!-- Status / Actions -->
            <div class="flex justify-end items-center gap-2">
              <!-- ถ้ายังรอ -->
              <template v-if="item.status === 'Pending'">
                <button
                  class="px-3 py-1 rounded-full text-sm bg-emerald-200 text-emerald-800 hover:bg-emerald-300"
                  @click="setStatus(item, 'Approved')"
                >
                  Approve
                </button>
                <button
                  class="px-3 py-1 rounded-full text-sm bg-rose-300 text-white hover:bg-rose-400"
                  @click="setStatus(item, 'Rejected')"
                >
                  Reject
                </button>
              </template>

              <!-- ถ้าอนุมัติแล้ว -->
              <template v-else-if="item.status === 'Approved'">
                <span class="px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700 font-medium">
                  Approved
                </span>
                <button class="text-xs text-gray-500 underline" @click="setStatus(item, 'Pending')">Undo</button>
              </template>

              <!-- ถ้าถูกปฏิเสธ -->
              <template v-else>
                <span class="px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-600 font-medium">
                  Rejected
                </span>
                <button class="text-xs text-gray-500 underline" @click="setStatus(item, 'Pending')">Undo</button>
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
import SecreLayout from '@/layouts/secretary/SecreLayout.vue' // 👈 เพิ่มการ import

const requests = ref([
  { no: 'A001', studentId: '65xxxxxxxx', date: '21/03/25', time: '8:00 - 9:00AM',  topic: 'Course registration;', status: 'Pending' },
  { no: 'A002', studentId: '65xxxxxxxx', date: '21/03/25', time: '9:00 - 10:00AM', topic: 'Course registration;', status: 'Pending' },
  { no: 'A003', studentId: '65xxxxxxxx', date: '21/03/25', time: '10:00 - 11:00AM', topic: 'Course registration;', status: 'Pending' }
])

const setStatus = (item, status) => {
  item.status = status
}
</script>

<style scoped>
/* ปรับพื้นที่ภายใน SecreLayout */
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>