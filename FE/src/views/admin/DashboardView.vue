<!-- Dashboard page -->
<template>
  <div class="flex min-h-screen p-10 gap-6 bg-gray-50">
    <div class="flex-1 space-y-5">
      
      <div class="flex justify-between items-center">
        <h1
        class="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      >
        Dashboard</h1>
                <WeekPicker @weekSelected="onWeekChange" />
      </div>

      <WeeklyUsersChart :chartData="chartData1" title="จำนวนผู้ใช้บริการในแต่ละวัน (สถานะเสร็จสิ้น)" />

      <WeeklyUsersChart :chartData="chartData2" title="คะแนนเฉลี่ยความพึงพอใจ (Service Provider / Process / Facilities)" />
    </div>

    <div class="w-80 space-y-4">
      <StaffCard
 v-for="staff in staffList"
 :key="staff.id"
 :id="staff.id"
 :name="`${staff.firstName || ''} ${staff.lastName || ''}`"
 :avatar="staff.avatar" :rating="staff.rating || 0" />
    </div>
  </div>
</template>

<script setup>
// ✅ 1. แก้ไข import ให้ถูกต้อง
import { ref, reactive, onMounted } from 'vue' 
import axios from 'axios'
import { format } from 'date-fns' // ⬅️ เอา startOfWeek, addDays, nextTick ออก
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
    const res = await axios.get('/api/admin/weekly-summary', {
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
const fetchAverageRating = async (start, end) => {
  try {
    const res = await axios.get('/api/admin/average-rating' , {params: { start, end } })
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
    const res = await axios.get('/api/admin/staffs')
    if (res.data.success) staffList.value = res.data.data
  } catch (err) {
    console.error('❌ Error fetching staff list:', err)
  }
}

// ✅ 2. onWeekChange (ถูกต้อง)
// ฟังก์ชันนี้จะถูกเรียก *อัตโนมัติ* ตอนหน้าเว็บโหลด (เพราะ WeekPicker emit มา)
const onWeekChange = ([start, end]) => {
  if (!start || !end) return // ป้องกัน error

  const formatDate = d => format(d, 'yyyy-MM-dd')
  const formattedStart = formatDate(start)
  const formattedEnd = formatDate(end)

  fetchWeeklySummary(formattedStart, formattedEnd)
  fetchAverageRating(formattedStart, formattedEnd)
}

// ✅ 3. แก้ไข onMounted (ถูกต้อง)
onMounted(() => {
  // ⭐️ ลบทุกอย่างออก ให้เหลือแค่ fetchStaffs()
  // เพราะ onWeekChange() จะดึงข้อมูลกราฟให้เอง
  fetchStaffs()
})
</script>