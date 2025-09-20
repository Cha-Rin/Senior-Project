// ✅ DashboardView.vue
<template>
  <div class="flex min-h-screen p-10 gap-6 bg-gray-50">
    <div class="flex-1 space-y-5">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Dashboard</h2>
        <WeekPicker @weekSelected="onWeekChange" />
      </div>
      <WeeklyUsersChart :chartData="chartData1" />
      <WeeklyUsersChart :chartData="chartData2" />
    </div>
    <div class="w-80 space-y-4">
      <StaffCard
        v-for="staff in staffList"
        :key="staff.id"
        :id="staff.id"
        :name="staff.name"
        :avatar="staff.avatar"
        :rating="staff.rating"
      />
    </div>
    
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useStaffStore } from './stores/staffStore'
import WeekPicker from '@/components/admin/dashboard/WeekPicker.vue'
import WeeklyUsersChart from '@/components/admin/dashboard/WeeklyUsersChart.vue'
import StaffCard from '@/components/admin/dashboard/StaffCard.vue'

const staffStore = useStaffStore()
const staffList = computed(() => staffStore.staffList.filter(s => s.active))

const chartData1 = reactive({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    { label: 'Appointment', data: [], backgroundColor: '#2563eb' },
    { label: 'Document Tracking', data: [], backgroundColor: '#facc15' }
  ]
})

const chartData2 = reactive({
  labels: ['Appointment', 'Document Tracking'],
  datasets: [
    { label: 'Service Provider', data: [], backgroundColor: '#2563eb' },
    { label: 'Service Process', data: [], backgroundColor: '#facc15' },
    { label: 'Facilities', data: [], backgroundColor: '#f87171' }
  ]
})

function onWeekChange([start, end]) {
  // 🟢 ดึงข้อมูลจำลองจาก Store ตามช่วงวันที่
  const usageData = staffStore.getServiceUsage(start, end) // [{ day: 'Mon', appointment: 5, document: 2 }, ...]

  chartData1.datasets[0].data = usageData.map(d => d.appointment)
  chartData1.datasets[1].data = usageData.map(d => d.document)

  // ใช้ข้อมูลจำลองคะแนนรีวิวรวม
  chartData2.datasets[0].data = [staffStore.avgRating.serviceProvider]
  chartData2.datasets[1].data = [staffStore.avgRating.serviceProcess]
  chartData2.datasets[2].data = [staffStore.avgRating.facilities]
}
</script>
