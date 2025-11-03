<template>
  <div class="page-content">
    <h1 class="text-4xl font-bold py-8 mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
      History
      <WeekPicker @weekSelected="onWeekChange" />
    </h1>
<div class="flex justify-end mb-4">
  <select 
    v-model="statusFilter"
    class="px-4 py-2 bg-white border rounded-lg shadow-sm min-w-[150px]"
  >
    <option value="all">All Status</option>
    <option value="0">Pending</option>
    <option value="1">Approve</option>
    <option value="2">Reject</option>
    <option value="3">Completed</option>
  </select>
</div>
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
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7l4-4m0 0l4 4m-4-4v18" />
            </svg>
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

    <div class="max-w-6xl mx-auto space-y-4">
      
      <div v-if="filteredItemsByType.length === 0" class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        No items found in selected date range.
      </div>

      <div v-else v-for="item in filteredItemsByType" :key="item.type + '-' + item.id">

        <div class="history-item flex items-center justify-between p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-6">
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
              'bg-rose-100 text-rose-800': item.status === 2,
              'bg-emerald-100 text-emerald-800': item.status === 1,
              'bg-orange-100 text-orange-800': item.status === 0,
              'bg-blue-100 text-blue-800': item.status.code === 3
            }"
          >
            <span v-if="item.status === 1">✅</span>
            <span v-else-if="item.status === 2">❌</span>
            <span v-else-if="item.status === 0">⏳</span>
            <span v-else-if="item.status.code === 3">✔️</span>
            {{ item.status === 1 ? 'Approve' : item.status === 2 ? 'Reject' : 'Pending' }}
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useHistory } from '@/components/together/useHistory'
import WeekPicker from '@/components/secretary/weekpicker.vue'

const router = useRouter()

const calendarContainer = ref(null)
const statusFilter = ref("all")
const onWeekChange = ([start,end]) => {
  startDate.value = start
  endDate.value = end
}
const props = defineProps({
  type: {
    type: String,
    default: 'all'   // all | appointment | document
  }
})
const filteredItemsByType = computed(() => {
  let items = history.value

  // ✅ กรองตาม type (จาก props)
  if (props.type === "appointment") {
    items = items.filter(i => i.type === "appointment")
  } else if (props.type === "document") {
    items = items.filter(i => i.type === "document")
  }

  // ✅ กรองตามสถานะ
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

// โหลดข้อมูลจาก API ตาม role
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  const userId = localStorage.getItem('userId')
  const role = localStorage.getItem('role')
  if(!userId) return

  try {
    const res = await fetch(`http://localhost:3000/history/historyall`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    // history (ตัวแม่) ยังคงรับข้อมูลทั้งหมด
    history.value = data.historyItems || [] 
    
    // resetDate จะคำนวณจากข้อมูลทั้งหมด
    if(history.value.length) resetDate() 
  } catch(err){
    console.error(err)
  }
})

function goToHistory(staffId) {
  router.push({ name: 'History', params: { id: staffId } })
}

// ปิดปฏิทินเมื่อคลิกข้างนอก
const handleClickOutside = (e) => {
  if(calendarContainer.value && !calendarContainer.value.contains(e.target)) showCalendar.value=false
}
onMounted(()=>document.addEventListener('click',handleClickOutside))
onUnmounted(()=>document.removeEventListener('click',handleClickOutside))
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>