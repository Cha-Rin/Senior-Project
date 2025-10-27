<!-- 📁 src/views/secretary/Appointment.vue -->
<template>
  <SecreLayout>
    <div class="page">
      <div class="content-wrapper">
        <h1 class="title">Appointment</h1>

        <!-- Controls -->
        <div class="controls">
          <span class="label">Mode:</span>

          <button
            class="btn"
            :class="{ active: mode === 'add' }"
            @click="setMode('add')"
          >
            Add
          </button>

          <button
            class="btn"
            :class="{ active: mode === 'select' }"
            @click="setMode('select')"
          >
            Select to delete
          </button>

          <button
            class="btn"
            :disabled="selectedToDelete.size === 0"
            @click="deleteSelected"
          >
            Delete
          </button>

          <!-- 🔸 Month & Week Selector -->
          <div class="flex gap-4 items-center">
            <!-- Month Picker -->
            <select v-model="selectedMonthYear" class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
              <option v-for="month in monthOptions" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>

            <!-- Week Picker -->
            <div class="flex gap-2">
              <span class="text-gray-700 text-sm">Week:</span>
              <div class="flex flex-wrap gap-1 max-w-[300px]">
                <button
                  v-for="(week, index) in weeksInMonth"
                  :key="index"
                  @click="selectWeek(week)"
                  class="px-2 py-1 text-xs rounded border"
                  :class="{
                    'bg-indigo-100 border-indigo-500 text-indigo-800 font-medium': selectedWeek?.start === week.start,
                    'bg-white border-gray-300 text-gray-700 hover:bg-gray-50': selectedWeek?.start !== week.start
                  }"
                >
                  {{ formatDateShort(week.start) }} – {{ formatDateShort(week.end) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid -->
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th class="time-head">Time</th>
                <th v-for="d in days" :key="d" class="day-head">{{ d }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(slot, r) in timeSlots" :key="slot">
                <td class="time-cell">{{ slot }}</td>

                <td
                  v-for="(d, c) in days"
                  :key="d"
                  class="cell"
                  :style="cellStyle(r, c)"
                  @click="onCellClick(r, c)"
                  :aria-label="`${slot} ${d}`"
                >
                  <div v-if="isSelectedToDelete(r, c)" class="dot"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Requests (demo) -->
        <h2 class="sub-title">Request Appointment</h2>
        <div class="request-list">
          <div v-for="(req, i) in requests" :key="i" class="request-row">
            <span>{{ req.topic }} - {{ req.date }} {{ req.time }}</span>
            <button class="req-btn" @click="openRequest(req)">▶</button>
          </div>
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const router = useRouter()

/* ตารางเวลา + วัน */
const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00'
]
const days = ['mon', 'tue', 'wed', 'thu', 'fri']
const LUNCH_ROW = 4

/* โหมด */
const mode = ref('add')
const setMode = (m) => {
  mode.value = m
}

/* การจอง */
const key = (r, c) => `${r},${c}`
const reserved = ref(new Set())
;[[1, 1], [2, 1], [5, 3], [7, 4]].forEach(([r, c]) => reserved.value.add(key(r, c)))

/* เลือกเพื่อลบ */
const selectedToDelete = ref(new Set())
const isSelectedToDelete = (r, c) => selectedToDelete.value.has(key(r, c))

/* คลิกช่อง */
const onCellClick = (r, c) => {
  if (r === LUNCH_ROW) return
  const k = key(r, c)

  if (mode.value === 'add') {
    if (!reserved.value.has(k)) reserved.value.add(k)
    return
  }

  if (mode.value === 'select') {
    if (!reserved.value.has(k)) return
    if (selectedToDelete.value.has(k)) selectedToDelete.value.delete(k)
    else selectedToDelete.value.add(k)
  }
}

/* ลบที่เลือก */
const deleteSelected = () => {
  selectedToDelete.value.forEach((k) => reserved.value.delete(k))
  selectedToDelete.value.clear()
}

/* สีของ cell */
const cellStyle = (r, c) => {
  if (r === LUNCH_ROW) {
    return { backgroundColor: '#6b7280', cursor: 'not-allowed' }
  }
  const k = key(r, c)
  if (reserved.value.has(k)) {
    return {
      backgroundColor: isSelectedToDelete(r, c) ? '#fecaca' : '#ef4444',
      color: '#fff'
    }
  }
  return { backgroundColor: '#fff' }
}

/* รายการคำขอ */
const requests = ref([
  { topic: 'Internship', date: '21 / 04 / 25', time: '08:00 - 09:00 A.M.' },
  { topic: 'Faculty Club', date: '21 / 04 / 25', time: '08:00 - 09:00 A.M.' },
  { topic: 'Faculty Club', date: '21 / 04 / 25', time: '08:00 - 09:00 A.M.' }
])

const openRequest = (req) => {
  router.push({
    name: 'RequestAppointment',
    query: {
      topic: req.topic,
      date: req.date,
      time: req.time
    }
  })
}

// ========== Month & Week Logic ==========
const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

// สร้างตัวเลือกเดือน (ย้อนหลัง 6 เดือน → ไปข้างหน้า 6 เดือน)
const monthOptions = computed(() => {
  const options = []
  for (let i = -6; i <= 6; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    options.push({ label, value })
  }
  return options
})

const selectedMonthYear = ref(
  `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
)

// คำนวณสัปดาห์ทั้งหมดในเดือนที่เลือก
const weeksInMonth = computed(() => {
  const [year, month] = selectedMonthYear.value.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  const weeks = []
  let current = new Date(firstDay)

  // หาวันจันทร์ของสัปดาห์แรกที่ทับเดือนนี้
  while (current.getDay() !== 1) { // 1 = Monday
    current.setDate(current.getDate() - 1)
  }

  while (current <= lastDay) {
    const monday = new Date(current)
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)

    // ตรวจสอบว่าสัปดาห์นี้ทับกับเดือนที่เลือกหรือไม่
    if (friday >= firstDay && monday <= lastDay) {
      weeks.push({
        start: monday.toISOString().slice(0, 10),
        end: friday.toISOString().slice(0, 10)
      })
    }

    current.setDate(current.getDate() + 7)
  }

  return weeks
})

// เลือกสัปดาห์
const selectedWeek = ref(null)

const selectWeek = (week) => {
  selectedWeek.value = week
  // ✅ ตอนนี้คุณสามารถใช้ selectedWeek.value.start / .end ในการบันทึกนัดหมาย
}

// ฟอร์แมตวันที่สั้น (เช่น 21 Apr)
const formatDateShort = (isoDate) => {
  const d = new Date(isoDate)
  const day = d.getDate()
  const month = d.toLocaleString('default', { month: 'short' })
  return `${day} ${month}`
}

// เมื่อโหลดหน้า → เลือกสัปดาห์ปัจจุบันโดยอัตโนมัติ
onMounted(() => {
  const now = new Date()
  const currentWeekStart = new Date(now)
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  currentWeekStart.setDate(diff)
  const startStr = currentWeekStart.toISOString().slice(0, 10)

  const currentWeek = weeksInMonth.value.find(w => w.start === startStr)
  if (currentWeek) {
    selectedWeek.value = currentWeek
  } else if (weeksInMonth.value.length > 0) {
    selectedWeek.value = weeksInMonth.value[0]
  }
})
</script>

<style scoped>
/* -------- layout -------- */
.page {
  min-height: 100vh;
  background: #fff;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.content-wrapper {
  max-width: 1000px;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 40px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 24px;
  text-align: left;
}

.sub-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 24px 0 12px;
  text-align: left;
}

/* -------- controls -------- */
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.label {
  font-size: 18px;
  color: #111827;
}

.btn {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
}

.btn:hover {
  background: #f3f4f6;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn.active {
  background: #111827;
  color: #fff;
}

/* -------- table -------- */
.table-wrap {
  overflow-x: auto;
  margin-bottom: 24px;
}

.table {
  min-width: 720px;
  border-collapse: collapse;
  width: max-content;
  margin: 0 auto;
}

.table th,
.table td {
  border: 1px solid #d1d5db;
}

.time-head,
.day-head {
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  text-transform: capitalize;
}

.time-cell {
  white-space: nowrap;
  padding: 12px 16px;
  color: #1f2937;
}

.cell {
  width: 7rem;
  height: 3rem;
  text-align: center;
  user-select: none;
  cursor: pointer;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  margin: 10px auto;
  background: #e11d48;
}

/* -------- requests -------- */
.request-list {
  max-width: 720px;
  display: grid;
  gap: 12px;
  margin: 0 auto;
}

.request-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 16px;
}

.req-btn {
  font-size: 20px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 8px;
  background: #e5e7eb;
}

.req-btn:hover {
  background: #d1d5db;
}
</style>