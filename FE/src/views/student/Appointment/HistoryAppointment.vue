<template>
  <div>
    
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
            selectedDate?.full === day.full
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
        :first-day-of-week="0"
        :attributes="calendarAttrs"
        @dayclick="selectDateFromCalendar"
        @update:page="updateMonthYear"
      />
    </div>

    <!-- 📜 History Info -->
    <div class="max-w-md mx-auto mt-6 bg-white shadow rounded p-4 text-xs">
      <p class="text-gray-500 mb-1">Selected: {{ selectedDate.full }}</p>
      <p class="font-semibold text-sm">{{ selectedTopic }}</p>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// -------------------- State --------------------
const isExpanded = ref(false)
const today = new Date()
const currentPageDate = ref(today)
const historyItems = ref([])
const events = ref([])
const selectedDate = ref({ full: '', date: '' })
const router = useRouter()

// -------------------- Mounted --------------------
onMounted(async () => {
   const token = localStorage.getItem('authToken')
  const userId = localStorage.getItem('userId')
  if (!userId) {
    console.warn('⚠️ userId not found in localStorage')
    return
  }

 try {
    const res = await fetch('http://localhost:3000/student/history', { 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ✅ ส่ง token
      }
    })
    const data = await res.json()
    console.log('📥 API response:', data)

    if (data.success && Array.isArray(data.historyItems)) {
      historyItems.value = data.historyItems.map(item => ({
        date: formatYMDFromSQLString(item.appointment_date),
        topic: item.topic || 'No topic',
        status: item.status || 0 // 0 = รออนุมัติ, 1 = ได้รับนัดแล้ว
      }))

      // ✅ ใช้สำหรับมาร์คบนปฏิทิน
      events.value = historyItems.value.map(item => ({
        date: item.date,
        color: item.status === 1 ? 'green' : 'blue'
      }))
    } else {
      console.warn('No history items found.')
    }
  } catch (err) {
    console.error('❌ Fetch error:', err)
  }

  // ตั้งค่าวันที่วันนี้เป็นค่าเริ่มต้น
  selectedDate.value = {
    full: formatLocalYMD(today),
    date: today.getDate(),
  }
})

// -------------------- Utilities --------------------
function formatYMDFromSQLString(s) {
  if (!s) return ''
  const t = s.includes('T') ? s.split('T')[0] : s.split(' ')[0]
  return t // YYYY-MM-DD
}

function formatLocalYMD(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseLocalYMD(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}
function hasEvent(day) {
  return events.value.some(e => e.date === day.full)
}
// -------------------- Calendar --------------------
const currentMonthYear = computed(() =>
  currentPageDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

function updateMonthYear({ year, month }) {
  currentPageDate.value = new Date(year, month - 1, 1)
}

const sunday = new Date(today)
sunday.setDate(today.getDate() - sunday.getDay())

const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(sunday)
  d.setDate(sunday.getDate() + i)
  return {
    short: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
    date: d.getDate(),
    full: formatLocalYMD(d),
    raw: d
  }
})

function selectDate(day) {
  selectedDate.value = day
}

function selectDateFromCalendar(day) {
  const d = day.date
  selectedDate.value = {
    date: d.getDate(),
    full: formatLocalYMD(d),
    raw: d
  }
}

// -------------------- Match topic --------------------
const selectedTopic = computed(() => {
  if (!selectedDate.value) return 'No date selected'
  const match = historyItems.value.find(item => item.date === selectedDate.value.full)
  return match ? match.topic : 'No topic'
})

// -------------------- Calendar Colors --------------------
const calendarAttrs = ref([])

watch(events, () => {
  calendarAttrs.value = [
    {
      key: 'today',
      highlight: true,
      dates: new Date(),
    },
    {
      key: 'pending',
      dot: true,
      popover: { label: 'Pending appointment' },
      highlight: { color: 'blue' },
      dates: events.value
        .filter(e => e.color === 'blue')
        .map(e => parseLocalYMD(e.date))
    },
    {
      key: 'confirmed',
      dot: true,
      popover: { label: 'Confirmed appointment' },
      highlight: { color: 'green' },
      dates: events.value
        .filter(e => e.color === 'green')
        .map(e => parseLocalYMD(e.date))
    }
  ]
}, { immediate: true })

function isToday(day) {
  return day.full === formatLocalYMD(new Date())
}
</script>
