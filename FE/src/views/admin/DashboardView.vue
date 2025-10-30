<template>
  <div class="flex min-h-screen p-10 gap-6 bg-gray-50">
    <div class="flex-1 space-y-5">
      
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Dashboard</h2>
        <WeekPicker @weekSelected="onWeekChange" />
      </div>

      <WeeklyUsersChart
        :chartData="chartData1"
        title="จำนวนผู้ใช้บริการในแต่ละวัน (สถานะเสร็จสิ้น)"
      />

      <WeeklyUsersChart
        :chartData="chartData2"
        title="คะแนนเฉลี่ยความพึงพอใจ (Service Provider / Process / Facilities)"
      />
    </div>

    <div class="w-80 space-y-4">
      <StaffCard
        v-for="staff in staffList"
        :key="staff.id"
        :id="staff.id"
        :name="`${staff.firstName || ''} ${staff.lastName || ''}`"
        :avatar="staff.avatar"
        :rating="staff.rating || 0"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { startOfWeek, addDays, format } from 'date-fns' // ✅ ใช้ logic เดียวกับ WeekPicker
import WeeklyUsersChart from '@/components/admin/dashboard/WeeklyUsersChart.vue'
import WeekPicker from '@/components/admin/WeekPicker.vue'
import StaffCard from '@/components/admin/dashboard/StaffCard.vue'

const staffList = ref([])

const chartData1 = reactive({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    { label: 'Appointment', data: [], backgroundColor: '#2563eb' },
    { label: 'Document Tracking', data: [], backgroundColor: '#facc15' }
  ]
})

const chartData2 = reactive({
  labels: ['Staff Friendliness', 'Service Efficiency', 'Communication'],
  datasets: [
    { label: 'Appointment', data: [], backgroundColor: '#2563eb' },
    { label: 'Document Tracking', data: [], backgroundColor: '#facc15' }
  ]
})

// ✅ ดึงข้อมูลจำนวนผู้ใช้บริการต่อวัน
const fetchWeeklySummary = async (start, end) => {
  try {
    const res = await axios.get('http://localhost:3000/admin/weekly-summary', {
      params: { start, end }
    })
    if (res.data.success) {
      const data = res.data.data
      chartData1.datasets[0].data = data.map(d => d.appointments)
      chartData1.datasets[1].data = data.map(d => d.documents)
    }
  } catch (err) {
    console.error('❌ Error fetching summary:', err)
  }
}

// ✅ ดึงข้อมูลคะแนนเฉลี่ย
const fetchAverageRating = async () => {
  try {
    const res = await axios.get('http://localhost:3000/admin/average-rating')
    if (res.data.success) {
      const avg = res.data.data
      chartData2.datasets[0].data = [
        avg.appointment.service_provider,
        avg.appointment.service_process,
        avg.appointment.facilities
      ]
      chartData2.datasets[1].data = [
        avg.document.service_provider,
        avg.document.service_process,
        avg.document.facilities
      ]
    }
  } catch (err) {
    console.error('❌ Error fetching ratings:', err)
  }
}

// ✅ ดึงข้อมูล staff
const fetchStaffs = async () => {
  try {
    const res = await axios.get('http://localhost:3000/admin/staffs')
    if (res.data.success) staffList.value = res.data.data
  } catch (err) {
    console.error('❌ Error fetching staff list:', err)
  }
}

// ✅ WeekPicker callback
const onWeekChange = ([start, end]) => {
  const formatDate = d => format(d, 'yyyy-MM-dd')
  fetchWeeklySummary(formatDate(start), formatDate(end))
  fetchAverageRating()
}

// ✅ โหลดเมื่อ mount
onMounted(async () => {
  await nextTick()

  // ✅ ใช้ date-fns เพื่อให้ logic ตรงกับ WeekPicker
  const today = new Date()
  const monday = startOfWeek(today, { weekStartsOn: 1 })
  const friday = addDays(monday, 4)

  const start = format(monday, 'yyyy-MM-dd')
  const end = format(friday, 'yyyy-MM-dd')

  fetchWeeklySummary(start, end)
  fetchAverageRating()
  fetchStaffs()
})
</script>

