<template>
  <div class="w-full max-w-[1000px]">
    <div class="flex flex-wrap justify-center items-center gap-4 mb-4">
      <div class="flex items-center gap-4">
        <!-- 🔹 Month selector -->
        <select
          v-model="selectedMonthYear"
          class="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer"
        >
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>

        <!-- 🔹 Week selector -->
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

    <!-- 🔹 ตารางเวลา -->
    <div class="overflow-x-auto mb-6">
      <table class="min-w-[720px] border-collapse mx-auto">
        <thead>
          <tr>
            <th class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300">
              Time
            </th>
            <th
              v-for="d in days"
              :key="d"
              class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 capitalize"
            >
              {{ d }}
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
              class="w-28 h-12 border border-gray-300 relative"
              :style="cellStyle(r, c)"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

/* -------------------------------------------------------
   Props & Emits
------------------------------------------------------- */
const props = defineProps({
  staffId: {
    type: [String, Number],
    required: true
  }
})
const emit = defineEmits(['update:unavailableData', 'update:weekRange'])

/* -------------------------------------------------------
   ตารางเวลา & วัน
------------------------------------------------------- */
const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '16:00 - 17:00'
]
const days = ['mon', 'tue', 'wed', 'thu', 'fri']
const LUNCH_ROW = 4
const reserved = ref(new Set())

const key = (r, c) => `${r},${c}`

/* -------------------------------------------------------
   สี cell
------------------------------------------------------- */
const cellStyle = (r, c) => {
  if (r === LUNCH_ROW)
    return { backgroundColor: '#e5e7eb', cursor: 'default' }

  const k = key(r, c)
  if (reserved.value.has(k)) {
    return {
      backgroundColor: '#ef4444',
      color: '#fff',
      cursor: 'not-allowed'
    }
  }
  return { backgroundColor: '#fff', cursor: 'default' }
}

/* -------------------------------------------------------
   Helper functions
------------------------------------------------------- */
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

const getDayIndexFromDate = (dateStr) => {
  if (!dateStr) return -1
  const itemDate = new Date(dateStr)
  const jsDayLocal = itemDate.getDay()
  if (jsDayLocal === 0 || jsDayLocal === 6) return -1
  return jsDayLocal - 1
}

/* -------------------------------------------------------
   Month / Week picker
------------------------------------------------------- */
const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

const monthOptions = computed(() => {
  const opts = []
  for (let i = -6; i <= 6; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    const label = date.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    })
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

const formatDateShort = (iso) => {
  const [y, m, d] = iso.split('-')
  const date = new Date(y, m - 1, d)
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`
}

/* -------------------------------------------------------
   เลือกสัปดาห์ + Emit ให้ parent
------------------------------------------------------- */
const selectWeek = (w) => {
  selectedWeek.value = w
  if (w?.start && w?.end) {
    emit('update:weekRange', { start: w.start, end: w.end })
  }
}

/* -------------------------------------------------------
   โหลดข้อมูล off-time จาก backend
------------------------------------------------------- */
const loadOffTime = async () => {
  if (!selectedWeek.value || !props.staffId) {
    reserved.value.clear()
    emit('update:unavailableData', reserved.value)
    emit('update:weekRange', { start: null, end: null })
    return
  }

  console.log(`Loading off-time for staff ${props.staffId}, week ${selectedWeek.value.start}`)

  try {
    const res = await axios.get('/api/secretary/public/list', {
      params: {
        weekStart: selectedWeek.value.start,
        weekEnd: selectedWeek.value.end,
        staffId: props.staffId
      }
    })

    const newSet = new Set()

    res.data.items.forEach((item) => {
      if (!item?.date || !item?.start_time) return

      const dayIndex = getDayIndexFromDate(item.date)
      if (dayIndex === -1) return

      const itemTime = new Date(`1970-01-01T${item.start_time}`)
      const itemHour = itemTime.getHours()

      const timeIndex = timeSlots.findIndex((slot) => {
        const slotHour = parseInt(slot.slice(0, 2), 10)
        return slotHour === itemHour
      })

      if (timeIndex === -1) return
      newSet.add(`${timeIndex},${dayIndex}`)
    })

    reserved.value = newSet
    emit('update:unavailableData', newSet)
    emit('update:weekRange', { start: selectedWeek.value.start, end: selectedWeek.value.end })
    console.log('✅ Reserved count:', reserved.value.size)
  } catch (err) {
    console.error('Error loading public off-time:', err)
  }
}

/* -------------------------------------------------------
   Lifecycle + Watchers
------------------------------------------------------- */
onMounted(() => {
  const now = new Date()
  const start = getMonday(now)
  const startStr = getLocalDateString(start)

  selectedWeek.value =
    weeksInMonth.value.find((w) => w.start === startStr) ||
    weeksInMonth.value[0]

  if (selectedWeek.value) {
    emit('update:weekRange', {
      start: selectedWeek.value.start,
      end: selectedWeek.value.end
    })
  }
})

watch(selectedWeek, () => loadOffTime(), { immediate: true })

watch(selectedMonthYear, () => {
  selectedWeek.value = weeksInMonth.value[0] || null
  if (selectedWeek.value) {
    emit('update:weekRange', {
      start: selectedWeek.value.start,
      end: selectedWeek.value.end
    })
  }
})

watch(
  () => props.staffId,
  (newId) => {
    if (newId) loadOffTime()
  }
)
</script>
