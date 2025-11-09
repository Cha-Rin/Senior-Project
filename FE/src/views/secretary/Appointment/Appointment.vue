<template>
  <SecreLayout>
    <div class="min-h-screen bg-white p-6 flex justify-center items-start">
      <div class="w-full max-w-[1000px]">

        <!-- Title -->
        <h1 class="text-4xl font-extrabold text-gray-800 mb-6 text-left">
          Appointment
        </h1>

        <!-- Controls -->
        <div class="flex flex-wrap justify-center items-center gap-3 mb-4">
          <span class="text-lg text-gray-900">Mode:</span>

          <!-- Add -->
          <button
            @click="setMode('add')"
            class="px-4 py-2 rounded-xl border border-gray-300 transition"
            :class="mode === 'add'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'"
          >
            Add
          </button>

          <!-- Select to delete -->
          <button
            @click="setMode('select')"
            class="px-4 py-2 rounded-xl border border-gray-300 transition"
            :class="mode === 'select'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'"
          >
            Select to delete
          </button>

          <!-- Delete -->
          <button
            class="px-4 py-2 rounded-xl border border-gray-300 bg-white text-black hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="selectedToDelete.size === 0"
            @click="deleteSelected"
          >
            Delete
          </button>

          <!-- Month + Week Picker -->
          <div class="flex items-center gap-4">

            <!-- Month select -->
            <select
              v-model="selectedMonthYear"
              class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer"
            >
              <option v-for="m in monthOptions" :key="m.value" :value="m.value">
                {{ m.label }}
              </option>
            </select>

            <!-- Week picker -->
            <div class="flex gap-2 items-center">
              <span class="text-sm text-gray-700">Week:</span>

              <div class="flex flex-wrap gap-1 max-w-[300px]">
                <button
                  v-for="(week, i) in weeksInMonth"
                  :key="i"
                  @click="selectWeek(week)"
                  class="px-2 py-1 text-xs rounded border transition"
                  :class="selectedWeek?.start === week.start
                    ? 'bg-indigo-100 border-indigo-500 text-indigo-800 font-medium'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  {{ formatDateShort(week.start) }} – {{ formatDateShort(week.end) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto mb-6">
          <table class="min-w-[720px] border-collapse mx-auto">
            <thead>
              <tr>
                <th class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300">
                  Time
                </th>
                <th
                  v-for="(d, i) in days"
                  :key="d"
                  class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 capitalize text-center"
                >
                  {{ d }}
                  <div v-if="weekDates[i]" class="text-xs text-gray-500 font-normal">
                    {{ weekDates[i] }}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(slot, r) in timeSlots" :key="slot">
                <td class="px-4 py-3 text-gray-800 border border-gray-300 whitespace-nowrap">
                  {{ slot }}
                </td>

                <td
                  v-for="(d, c) in days"
                  :key="d"
                  @click="onCellClick(r,c)"
                  class="w-28 h-12 border border-gray-300 cursor-pointer relative"
                  :style="cellStyle(r,c)"
                >
                  <div
                    v-if="isSelectedToDelete(r,c)"
                    class="w-2 h-2 rounded-full bg-rose-600 absolute inset-0 m-auto"
                  ></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

/* 🧩 ตัวแปรหลัก */
const authToken = localStorage.getItem('authToken')
const staffId = localStorage.getItem('userId')
const categoryId = localStorage.getItem('categoryId') // ✅ แยกตารางตาม category_id
console.log('🧩 Loaded staff:', staffId, '| category_id:', categoryId)

/* ตารางเวลา + วัน */
const timeSlots = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
  '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
  '14:00 - 15:00', '15:00 - 16:00'
]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const LUNCH_ROW = 4

/* โหมด */
const mode = ref('add')
const reserved = ref(new Set())
const selectedToDelete = ref(new Set())
const offItems = ref([])

const key = (r, c) => `${r},${c}`
const isSelectedToDelete = (r, c) => selectedToDelete.value.has(key(r, c))
const setMode = (m) => (mode.value = m)

/* Helper Functions */
const getLocalDateString = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const getMonday = (d) => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(12, 0, 0, 0)
  return date
}
const getDateFromDayIndex = (col) => {
  const [y, m, d] = selectedWeek.value.start.split('-').map(Number)
  const start = new Date(y, m - 1, d, 12, 0, 0)
  start.setDate(start.getDate() + col)
  return getLocalDateString(start)
}
const getDayIndexFromDate = (dateStr) => {
  if (!dateStr) return -1
  const itemDate = new Date(dateStr)
  const jsDayLocal = itemDate.getDay()
  if (jsDayLocal === 0 || jsDayLocal === 6) return -1
  return jsDayLocal - 1
}

/* 🟢 เพิ่มเวลาว่าง */
const onCellClick = async (r, c) => {
  if (r === LUNCH_ROW) return
  const k = key(r, c)

  if (mode.value === 'add') {
    if (reserved.value.has(k)) return

    const date = getDateFromDayIndex(c)
    const start_time = timeSlots[r].split(' - ')[0] + ':00'
    const end_time = timeSlots[r].split(' - ')[1] + ':00'

    try {
      await axios.post(
        '/api/secretary/add',
        { staff_id: staffId, category_id: categoryId, date, start_time, end_time },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      reserved.value.add(k)
      loadOffTime()
    } catch (err) {
      console.error('Error adding off-time:', err)
    }
  }

  if (mode.value === 'select') {
    if (!reserved.value.has(k)) return
    if (selectedToDelete.value.has(k))
      selectedToDelete.value.delete(k)
    else
      selectedToDelete.value.add(k)
  }
}

/* สี cell */
const cellStyle = (r, c) => {
  if (r === LUNCH_ROW)
    return { backgroundColor: '#6b7280', cursor: 'not-allowed' }
  const k = key(r, c)
  if (reserved.value.has(k)) {
    return {
      backgroundColor: selectedToDelete.value.has(k) ? '#fecaca' : '#ef4444',
      color: '#fff'
    }
  }
  return { backgroundColor: '#fff' }
}

/* 🗓 Week / Month Picker */
const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

const monthOptions = computed(() => {
  const opts = []
  for (let i = -6; i <= 6; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    opts.push({ label, value })
  }
  return opts
})

const selectedMonthYear = ref(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)

const weeksInMonth = computed(() => {
  const [year, month] = selectedMonthYear.value.split('-').map(Number)
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const result = []
  let cur = getMonday(first)
  while (cur <= last) {
    const mon = new Date(cur)
    const fri = new Date(mon)
    fri.setDate(mon.getDate() + 4)
    if (fri >= first && mon <= last) {
      result.push({
        start: getLocalDateString(mon),
        end: getLocalDateString(fri)
      })
    }
    cur.setDate(cur.getDate() + 7)
  }
  return result
})

const selectedWeek = ref(null)
const selectWeek = (w) => (selectedWeek.value = w)
const formatDateShort = (iso) => {
  const [y, m, d] = iso.split('-')
  const date = new Date(y, m - 1, d)
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`
}

/* วันที่ใต้หัวตาราง */
const weekDates = computed(() => {
  if (!selectedWeek.value) return []
  const [y, m, d] = selectedWeek.value.start.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const dates = []
  for (let i = 0; i < 5; i++) {
    const dt = new Date(base)
    dt.setDate(base.getDate() + i)
    dates.push(dt.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }))
  }
  return dates
})

/* 🧩 โหลดข้อมูลเฉพาะของหมวดนั้น */
const loadOffTime = async () => {
  if (!selectedWeek.value) return
  try {
    const res = await axios.get('/api/secretary/list', {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        weekStart: selectedWeek.value.start,
        weekEnd: selectedWeek.value.end,
        categoryId: categoryId // ✅ แยกตารางตาม category
      }
    })

    offItems.value = res.data.items || []
    const newSet = new Set()

    offItems.value.forEach((item) => {
      const dayIndex = getDayIndexFromDate(item.date)
      if (dayIndex === -1) return
      const itemTime = new Date(`1970-01-01T${item.start_time}`)
      const itemHour = itemTime.getHours()
      const timeIndex = timeSlots.findIndex((slot) => {
        const slotHour = parseInt(slot.slice(0, 2), 10)
        return slotHour === itemHour
      })
      if (timeIndex !== -1) newSet.add(`${timeIndex},${dayIndex}`)
    })

    reserved.value = newSet
    console.log(`✅ Loaded ${newSet.size} items for category_id = ${categoryId}`)
  } catch (err) {
    console.error('🔥 Error loading off-time:', err)
  }
}

/* 🧹 ลบเวลา */
const deleteSelected = async () => {
  const ids = []
  offItems.value.forEach((item) => {
    const dayIndex = getDayIndexFromDate(item.date)
    const itemTime = new Date(`1970-01-01T${item.start_time}`)
    const itemHour = itemTime.getHours()
    const timeIndex = timeSlots.findIndex((slot) => {
      const slotHour = parseInt(slot.slice(0, 2), 10)
      return slotHour === itemHour
    })
    if (selectedToDelete.value.has(`${timeIndex},${dayIndex}`))
      ids.push(item.off_time_id)
  })
  if (ids.length === 0) return
  try {
    await axios.post(
      '/api/secretary/delete',
      { ids, category_id: categoryId }, // ✅ ส่ง category_id ให้ backend ด้วย
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
    selectedToDelete.value.clear()
    loadOffTime()
  } catch (err) {
    console.error('Error deleting off-time:', err)
  }
}

/* Lifecycle */
onMounted(() => {
  const now = new Date()
  const start = getMonday(now)
  const startStr = getLocalDateString(start)
  selectedWeek.value =
    weeksInMonth.value.find((w) => w.start === startStr) || weeksInMonth.value[0]
})

watch(selectedWeek, () => loadOffTime(), { immediate: true })
watch(selectedMonthYear, () => {
  selectedWeek.value = weeksInMonth.value[0] || null
})
</script>
