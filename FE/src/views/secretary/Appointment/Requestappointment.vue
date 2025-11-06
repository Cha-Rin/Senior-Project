<!-- 📁 src/views/secretary/AppointmentRequest.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Request Appointment
      </h1>

      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="grid grid-cols-7 gap-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl px-6 py-4 shadow-lg">
          <div>No</div>
          <div>ID</div>
          <div>NAME</div>
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
            class="grid grid-cols-7 gap-4 items-center bg-white rounded-2xl px-6 py-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
          >
            <!-- No -->
            <div class="text-lg md:text-xl font-extrabold tracking-wide text-indigo-700">
              {{ item.no }}
            </div>

            <!-- ID -->
            <div class="text-gray-700 font-medium">{{ item.studentId }}</div>

            <!-- NAME -->
             <div>{{ item.name }}</div>

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
          <!-- ✅ แสดงเมื่อไม่มีข้อมูล -->
  <div v-if="requests.length === 0" class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p class="text-lg font-medium">ไม่มีการนัดหมาย</p>
    <p class="text-sm text-gray-400 mt-1">ยังไม่มีคำขอรอนัดหมายในขณะนี้</p>
  </div>
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const requests = ref([])

const formatDateTime = (isoDate) => { 
  if (!isoDate) return '-'
  const d = new Date(isoDate.replace(' ', 'T'))
  if (isNaN(d)) return '-'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` }
}

onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return

  try {
    const res = await fetch('http://localhost:3000/secretary/appointmentRequests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    
    // ✅ map ข้อมูลให้ตรงกับ template
    requests.value = (data.requests || []).map(item => ({
      no: item.appointment_id,
      studentId: item.studentId,
      name: item.full_name || '—',
      date: formatDateTime(item.appointment_date).date,
      time: formatDateTime(item.appointment_date).time,
      topic: item.topic,
      note: item.student_note || '',
      status: item.status === 1 ? 'Approved' : item.status === 2 ? 'Rejected' : 'Pending'
    }))
  } catch (err) {
    console.error('❌ Fetch error:', err)
  }
})

const setStatus = async (item, newStatus) => {
  const statusMap = { Pending: 0, Approved: 1, Rejected: 2 }
  const numericStatus = statusMap[newStatus]

  try {
    const token = localStorage.getItem('authToken')
    const res = await fetch('http://localhost:3000/secretary/updateAppointmentStatus', { // ✅ แก้เป็น localhost
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        appointment_id: item.no, // ✅ ใช้ item.no
        status: numericStatus
      })
    })

    if (!res.ok) throw new Error('Failed to update status')

    const index = requests.value.findIndex(r => r.no === item.no)
    if (index !== -1) {
      requests.value.splice(index, 1, { ...item, status: newStatus })
    }
  } catch (err) {
    console.error('❌ Update error:', err)
    alert('Failed to update appointment status')
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