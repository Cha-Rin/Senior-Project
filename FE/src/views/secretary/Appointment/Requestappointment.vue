<template>
  <SecreLayout>
    <div class="page-content">
      <h1
        class="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      >
        Request Appointment
      </h1>

      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div
          class="grid grid-cols-6 gap-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl px-6 py-4 shadow-lg"
        >
          <div>Date &amp; Time</div>
          <div>ID</div>
          <div>NAME</div>
          <div>Topic</div>
          <div>Note</div>
          <div class="text-right">Status</div>
        </div>

        <!-- Rows -->
        <div class="mt-4 space-y-4">
          <div
            v-for="item in paginatedRequests"
            :key="item.no"
            class="grid grid-cols-6 gap-4 items-center bg-white rounded-2xl px-6 py-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
          >
            <!-- Date & Time -->
            <div class="text-gray-700 space-y-1">
              <div class="font-medium">Date: {{ item.date }}</div>
              <div class="text-sm text-gray-500">Time: {{ item.time }}</div>
            </div>

            <!-- ID -->
            <div class="text-gray-700 font-medium">{{ item.studentId }}</div>

            <!-- NAME -->
            <div>{{ item.name }}</div>

            <!-- Topic -->
            <div class="text-gray-800 font-medium">{{ item.topic }}</div>

            <!-- Note -->
            <div class="text-gray-500 text-sm italic">{{ item.note }}</div>

            <!-- Status / Actions -->
            <div class="flex justify-end items-center gap-2">
              <!-- Pending -->
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

              <!-- Approved -->
              <template v-else-if="item.status === 'Approved'">
                <span
                  class="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1"
                >
                  <span>✅</span> Approved
                </span>
              </template>

              <!-- Rejected -->
              <template v-else>
                <span
                  class="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-100 text-rose-700 flex items-center gap-1"
                >
                  <span>❌</span> Rejected
                </span>
              </template>
            </div>
          </div>

          <!-- ✅ No Data -->
          <div
            v-if="requests.length === 0"
            class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-12 h-12 mx-auto text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p class="text-lg font-medium">ไม่มีการนัดหมาย</p>
            <p class="text-sm text-gray-400 mt-1">
              ยังไม่มีคำขอรอนัดหมายในขณะนี้
            </p>
          </div>
        </div>

        <!-- ✅ Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex justify-center items-center mt-8 space-x-1"
        >
          <!-- ปุ่มเลขหน้า -->
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded',
              page === currentPage
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
            ]"
          >
            {{ page }}
          </button>

          <!-- ปุ่มหน้าถัดไป -->
          <button
            v-if="currentPage < totalPages"
            @click="goToPage(currentPage + 1)"
            class="ml-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            หน้าถัดไป
          </button>
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const requests = ref([])

// Pagination states
const currentPage = ref(1)
const itemsPerPage = 7

// ✅ ฟังก์ชันแบ่งหน้า
const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return requests.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(requests.value.length / itemsPerPage)
)

// ✅ เปลี่ยนหน้า
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ✅ ฟังก์ชันจัดการเวลา
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

// ✅ โหลดข้อมูลนัดหมาย
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return

  try {
    const res = await fetch('/secretary/appointmentRequests', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()

    requests.value = (data.requests || []).map((item) => ({
      no: item.appointment_id,
      studentId: item.studentId,
      name: item.full_name || '—',
      date: formatDateTime(item.appointment_date).date,
      time: formatDateTime(item.appointment_date).time,
      topic: item.topic,
      note: item.student_note || '',
      status:
        item.status === 1
          ? 'Approved'
          : item.status === 2
          ? 'Rejected'
          : 'Pending',
    }))
  } catch (err) {
    console.error('❌ Fetch error:', err)
  }
})

// ✅ เปลี่ยนสถานะนัดหมาย
const setStatus = async (item, newStatus) => {
  const statusMap = { Pending: 0, Approved: 1, Rejected: 2 }
  const numericStatus = statusMap[newStatus]

  try {
    const token = localStorage.getItem('authToken')
    const res = await fetch('/secretary/updateAppointmentStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        appointment_id: item.no,
        status: numericStatus,
      }),
    })

    if (!res.ok) throw new Error('Failed to update status')

    const index = requests.value.findIndex((r) => r.no === item.no)
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
