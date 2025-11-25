<template> 
  <div class="page-content">
    <h1 class="text-4xl font-bold py-8 mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
      History
      <WeekPicker @weekSelected="onWeekChange" />
    </h1>

    <!-- ✅ TAB BUTTONS -->
    <!-- ✅ TAB + STATUS FILTER บรรทัดเดียว -->
<div class="flex items-center justify-between mb-6">

  <!-- LEFT: TAB BUTTONS -->
  <div class="flex gap-4">
    <button 
      @click="activeTab = 'appointment'"
      :class="[
        'px-4 py-2 rounded-lg font-semibold transition',
        activeTab === 'appointment' 
          ? 'bg-indigo-600 text-white shadow' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      ]"
    >
      Appointment
    </button>

    <button 
      @click="activeTab = 'document'"
      :class="[
        'px-4 py-2 rounded-lg font-semibold transition',
        activeTab === 'document' 
          ? 'bg-indigo-600 text-white shadow' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      ]"
    >
      Document
    </button>
  </div>

  <!-- RIGHT: STATUS FILTER -->
  <select
  v-model="statusFilter"
  class="px-4 py-2 bg-white border rounded-lg shadow-sm min-w-[150px]"
>
  <option value="all">All Status</option>
  <option value="0">Pending</option>
  <template v-if="activeTab === 'appointment'">
    <option value="1">Approve</option>
    <option value="2">Reject</option>
    <option value="3">Completed</option>
  </template>
  <template v-else>
    <option value="1">In Progress</option>
    <option value="2">Complete</option>
    <option value="3">Reject</option>
  </template>
</select>

</div>


    <!-- ✅ DATE PICKER -->
    <div class="bg-violet-50 rounded-xl px-5 py-3 mb-6 border border-violet-200 shadow-sm">
      <div class="flex items-center gap-3">
        <span class="text-violet-600 text-xl">📅</span>
        <div class="relative" ref="calendarContainer">
          <div 
            @click="toggleCalendar"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 min-w-[240px]"
          >
            <span v-if="startDate && endDate">
              {{ formatDateDisplay(startDate) }} – {{ formatDateDisplay(endDate) }}
            </span>
            <span v-else class="text-gray-500">Choose date range</span>
          </div>

          <div v-if="showCalendar" class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-80">
            <div class="flex justify-between items-center mb-3">
               <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded"></button>
               <span class="font-medium">{{ currentMonthName }} {{ currentYear }}</span>
               <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 rounded">></button>
            </div>

            <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
               <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>

            <div class="grid grid-cols-7 gap-1">
               <div 
                 v-for="day in calendarDays" 
                 :key="day.date" 
                 :class="[
                   'h-8 flex items-center justify-center rounded-md text-sm cursor-pointer',
                   day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                   day.isSelected ? 'bg-indigo-600 text-white' : '',
                   day.isInRange ? 'bg-indigo-100' : '',
                   day.isToday ? 'border border-indigo-500' : ''
                 ]"
                 @click="selectDate(day.date)"
               >
                 {{ day.day }}
               </div>
            </div>

            <div class="mt-3 flex justify-end">
               <button @click="resetDate" class="text-sm font-medium text-violet-600 hover:text-violet-800 underline">Reset</button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ✅ LIST -->
    <div class="max-w-6xl mx-auto space-y-4">
      
      <div v-if="filteredByTab.length === 0" class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        No items found in selected date range.
      </div>

      <!-- ✅ เปลี่ยนเป็น paginatedItems -->
      <div v-else v-for="item in paginatedItems" :key="item.type + '-' + item.id">

        <div class="history-item flex items-center justify-between p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-6">

            <!-- ✅ เปลี่ยน prefix ตามประเภท -->
            <div class="font-bold text-lg text-indigo-700">
              {{ item.type === 'appointment' ? 'APP-' : 'DOC-' }}{{ item.id }}
            </div>

            <div class="text-gray-700 font-medium">{{ item.studentId }}</div>

            <div class="text-gray-600 text-sm space-y-1">
              <div class="font-medium">Date: {{ formatDateTime(item.event_date).date }}</div>
              <div class="text-gray-500">Time: {{ formatDateTime(item.event_date).time }}</div>
            </div>

            <div class="text-gray-800 font-medium">{{ item.title }}</div>

          </div>

          <div>{{ item.student_note }}</div>

          <div
            class="px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-1.5"
            :class="{
              'bg-rose-100 text-rose-800': (item.type === 'appointment' && item.status === 2) || (item.type === 'document' && item.status === 3),
              'bg-emerald-100 text-emerald-800': item.status === 1,
              'bg-orange-100 text-orange-800': item.status === 0,
              'bg-blue-100 text-blue-800': (item.type === 'appointment' && item.status === 3) || (item.type === 'document' && item.status === 2)
            }"
          >
            <span v-if="item.status === 0">⏳</span>
            <span v-else-if="item.status === 1">✅</span>
            <span v-else-if="item.type === 'appointment' && item.status === 2">❌</span>
            <span v-else-if="item.type === 'appointment' && item.status === 3">✔️</span>
            <span v-else-if="item.type === 'document' && item.status === 2">✔️</span>
            <span v-else-if="item.type === 'document' && item.status === 3">❌</span>

            <template v-if="item.type === 'document'">
              {{ item.status === 0 ? 'Pending' : item.status === 1 ? 'In Progress' : item.status === 2 ? 'Complete' : 'Reject' }}
            </template>
            <template v-else>
              {{ item.status === 0 ? 'Pending' : item.status === 1 ? 'Approve' : item.status === 2 ? 'Reject' : 'Completed' }}
            </template>
            
          </div>

        </div>

      </div>
      <!-- ✅ Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center mt-8 space-x-1">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded text-sm',
            page === currentPage
              ? 'bg-indigo-600 text-white font-bold'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          ]"
        >
          {{ page }}
        </button>

        <button
          v-if="currentPage < totalPages"
          @click="goToPage(currentPage + 1)"
          class="ml-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          Next
        </button>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHistory } from '@/components/together/useHistory'
import WeekPicker from '@/components/secretary/weekpicker.vue'
import axios from 'axios'
const router = useRouter()
const route = useRoute()

const calendarContainer = ref(null)
const statusFilter = ref("all")
const activeTab = ref('appointment')   // ✅ tab คุมประเภท

// ✅ computed: แสดงตามแท็บและสถานะ
const filteredByTab = computed(() => {
  let items = history.value

  // ✅ กรองตามแท็บ
  if (activeTab.value === "appointment") {
    items = items.filter(i => i.type === "appointment")
  } else if (activeTab.value === "document") {
    items = items.filter(i => i.type === "document")
  }

  // ✅ กรองสถานะ
  if (statusFilter.value !== "all") {
    items = items.filter(i => String(i.status) === statusFilter.value)
  }

  return items
})

const { 
  history, 
  startDate, 
  endDate, 
  showCalendar, 
  currentMonth, 
  currentYear, 
  toggleCalendar, 
  calendarDays, 
  currentMonthName, 
  resetDate, 
  formatDateDisplay, 
  formatDateTime, 
  changeMonth, 
  selectDate 
} = useHistory()

const onWeekChange = ([start,end]) => {
  startDate.value = start
  endDate.value = end
}

// ✅ โหลดข้อมูล
onMounted(async () => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");
  console.log("ALL ROUTE PARAMS:", route.params)
  const staffId = route.params.id;

  console.log("--- DEBUG HISTORY PAGE ---");
  console.log("Role (from localStorage):", role);
  console.log("Staff ID (from URL params):", staffId);
  console.log("---------------------------");

  try {
    const res = await axios.get("/api/history/historyall", {
      headers: { Authorization: `Bearer ${token}` },
      params: { staffId: staffId }
    });

    history.value = res.data.historyItems;
  } catch (err) {
    console.error(err);
  }
});

// ✅ ปิด calendar ถ้าคลิกข้างนอก
const handleClickOutside = (e) => {
  if(calendarContainer.value && !calendarContainer.value.contains(e.target)) {
    showCalendar.value = false
  }
}
onMounted(()=>document.addEventListener('click',handleClickOutside))
onUnmounted(()=>document.removeEventListener('click',handleClickOutside))

// 🔹 Pagination
const currentPage = ref(1)
const itemsPerPage = 7

const totalPages = computed(() => Math.ceil(filteredByTab.value.length / itemsPerPage))

// ✅ paginatedItems ใช้ filteredByTab
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredByTab.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ✅ รีเซ็ตหน้ากลับไป 1 เมื่อเปลี่ยนแท็บหรือกรอง
watch([activeTab, statusFilter], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>