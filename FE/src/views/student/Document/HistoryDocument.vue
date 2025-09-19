<template>
  <div>
<Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
  
  <div class="min-h-screen bg-white px-4 py-6">
     <!-- หัวเรื่อง -->
    <h1 class="text-xl font-semibold text-center mt-8">History</h1>
    <!-- 🟪 Header: Month + Toggle Button -->
    <div class="max-w-md mx-auto flex justify-between items-center text-sm mb-3">
      <h2 class="font-semibold truncate">{{ currentMonthYear }}</h2>
      <button
        @click="isExpanded = !isExpanded"
        class="text-indigo-600 text-xs underline"
      >
        {{ isExpanded ? 'Weekly View' : 'Full Calendar' }}
      </button>
    </div>

    <!-- 📅 Horizontal Calendar Bar -->
    <div v-if="!isExpanded" class="max-w-md mx-auto">
      <!-- ✅ วันในสัปดาห์ -->
      <div class="grid grid-cols-7 gap-1 text-[12px] text-gray-400 mb-1 text-center">
        <div v-for="day in weekDays" :key="day.full" class="truncate">
          {{ day.short }}
        </div>
      </div>

      <!-- ✅ ตัวเลขวัน + วงกลม + จุด -->
      <div class="grid grid-cols-7 gap-1 text-center text-sm">
        <div
          v-for="day in weekDays"
          :key="day.full"
          @click="selectDate(day)"
          class="cursor-pointer"
        >
          <div
          :class="[
            'w-8 h-8 mx-auto flex items-center justify-center rounded-full',
            selectedDate.full === day.full
              ? 'bg-indigo-500 text-white'
              : isToday(day)
              ? 'bg-purple-500 text-white'
              : 'text-gray-800'
          ]">
          {{ day.date }}
        </div>

          <div
            v-if="hasEvent(day)"
            class="w-1 h-1 bg-indigo-500 rounded-full mx-auto mt-1"
          ></div>
        </div>
      </div>
    </div>

    <!-- 🗓️ Full Calendar View -->
    <div v-else class="max-w-md mx-auto mt-2 bg-white rounded shadow text-xs">
      <v-calendar
        is-expanded
        first-day-of-week="0"
        :attributes="calendarAttrs"
        @dayclick="selectDateFromCalendar"
        @update:page="updateMonthYear"
      />
    </div>

    <!-- 📜 History Info -->
    <div class="max-w-md mx-auto mt-6 bg-white shadow rounded p-4 text-xs">
      <p class="text-gray-500 mb-1">Selected: {{ selectedDate.full }}</p>
      <p class="font-semibold text-sm">History Example</p>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from "@/components/student/NavbarDoc.vue";

// 📌 Toggle full vs week
const isExpanded = ref(false)
const today = new Date()
const currentPageDate = ref(today)
const route = useRoute()
const historyDocs = ref([])
const userId = localStorage.getItem('userId')


// ✅ ตรวจสอบแหล่งที่มาให้ครบทุกแหล่ง
const paramId = route.params.studentId
const localId = localStorage.getItem('student_id')
const localEmail = localStorage.getItem('student_email')

// ✅ ใช้ค่าที่หาได้จริง
const studentId = paramId || localEmail || localId

console.log('🧪 route.params.studentId:', paramId)
console.log('🧪 localStorage student_id:', localId)
console.log('🧪 localStorage student_email:', localEmail)
console.log('📦 FINAL studentId used in fetch:', studentId)

const fetchDocumentHistory = async () => {
  if (!userId || userId === 'undefined') {
    console.error('❌ ไม่มี userId ที่จะใช้ดึงข้อมูล')
    return
  }

  try {
    const res = await fetch(`http://localhost:3000/api/document/history/${userId}`)
    const data = await res.json()

    if (data.success) {
      historyDocs.value = data.documents
    } else {
      console.warn('⚠️ No documents found:', data.message)
    }
  } catch (err) {
    console.error('❌ Failed to fetch document history:', err)
  }
}

onMounted(() => {
  fetchDocumentHistory()
})

// const fetchDocumentHistory = async () => {
//   try {
//     console.log('📦 studentId used in fetch:', studentId)
//     const res = await fetch(`http://localhost:3000/api/document/history/${studentId}`)
//     const data = await res.json()
//     if (data.success) {
//       historyDocs.value = data.documents
//     } else {
//       console.warn('⚠️ No documents found:', data.message)
//     }
//   } catch (err) {
//     console.error('❌ Failed to fetch document history:', err)
//   }
// }
onMounted(() => {
  if (userId) {
    fetchDocumentHistory()
  } else {
    console.error('❌ No student ID provided')
  }
})
// 🗓️ Month & Year
const currentMonthYear = computed(() =>
  currentPageDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
)

function updateMonthYear({ year, month }) {
  currentPageDate.value = new Date(year, month - 1, 1)
}

// 📆 สร้างสัปดาห์นี้ (Sunday เริ่ม)
const sunday = new Date(today)
sunday.setDate(today.getDate() - sunday.getDay())

const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(sunday)
  d.setDate(sunday.getDate() + i)
  return {
    short: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
    date: d.getDate(),
    month: d.getMonth(),
    full: d.toISOString().split('T')[0], // "YYYY-MM-DD"
    raw: d
  }
})

// 🔘 Selected Date
const selectedDate = ref(
  weekDays.find(day => isToday(day)) || weekDays[0]
)


function selectDate(day) {
  selectedDate.value = day
}

function selectDateFromCalendar(day) {
  const d = day.date
  selectedDate.value = {
    short: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.getDate(),
    month: d.getMonth(),
    full: d.toISOString().split('T')[0],
    raw: d
  }
}

// 🔵 Event dots
const events = ref([
  // { date: weekDays[1].full },
  // { date: weekDays[3].full }
])

function hasEvent(day) {
  return events.value.some(e => e.date === day.full)
}

// 🎯 Highlight Today on Calendar
const calendarAttrs = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date()
  }
])
function isToday(day) {
  const todayDate = new Date()
  const todayStr = todayDate.toISOString().split('T')[0]
  return day.full === todayStr
}
// const studentId = localStorage.getItem('student_id') // ยังต้องใช้เพื่อบอก backend ว่าข้อมูลของใคร

const fetchDocuments = async () => {
  const res = await fetch(`http://localhost:3000/api/student/documents/${userId}`)
  const data = await res.json()
  console.log('📄 Document list:', data)
}


</script>
