<template>
  <div class="page-content">
    <!-- หัวข้อหน้า -->
    <div class="flex items-center justify-between mb-6">
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent py-8"
      >
        History
      </h1>

      <!-- Dropdown Filter -->
      <select
        v-model="statusFilter"
        class="px-4 py-2 bg-white border rounded-lg shadow-sm min-w-[150px]"
      >
        <option value="all">All Status</option>
        <option
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.text }}
        </option>
      </select>
    </div>

    <!-- ฟิลเตอร์วันที่ -->
    <div class="bg-violet-50 rounded-xl px-5 py-3 mb-6 border border-violet-200 shadow-sm">
      <div class="flex items-center gap-3">
        <span class="text-violet-600 text-xl">📅</span>
        <div class="relative" ref="calendarContainer">
          <div
            @click="toggleCalendar"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 min-w-[260px]"
          >
            <span v-if="startDate && endDate">
              {{ formatDateDisplay(startDate) }} – {{ formatDateDisplay(endDate) }}
            </span>
            <span v-else class="text-gray-500">Choose date range</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-500 ml-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7l4-4m0 0l4 4m-4-4v18"
              />
            </svg>
          </div>

          <!-- ปฏิทิน -->
          <div
            v-if="showCalendar"
            class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-80"
          >
            <div class="flex justify-between items-center mb-3">
              <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded">‹</button>
              <span class="font-medium">{{ currentMonthName }} {{ currentYear }}</span>
              <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 rounded">›</button>
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

            <div class="mt-3 flex justify-between">
              <button
                @click="selectTodayRange()"
                class="text-sm font-medium text-gray-600 hover:text-gray-800"
                title="เลือกเฉพาะวันนี้"
              >
                Today
              </button>
              <button
                @click="resetDate"
                class="text-sm font-medium text-violet-600 hover:text-violet-800 underline"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ตาราง -->
    <div class="max-w-6xl mx-auto mb-6 overflow-hidden rounded-xl shadow-lg border border-gray-200">
      <table class="w-full bg-white rounded-xl shadow-lg border border-gray-200">
        <thead class="bg-gradient-to-r from-indigo-50 to-violet-50">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Date</th>
            <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Topic</th>
            <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Name</th>
            <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Note</th>
            <th v-if="props.type === 'document'"
            class="px-6 py-4 text-center text-sm font-bold text-indigo-800">File</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-indigo-800">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-700">
              {{ formatDateTime(item.event_date).date }}<br />
              <span class="text-gray-500 text-xs">{{ formatDateTime(item.event_date).time }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ item.title }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ item.full_name || '—' }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ item.student_note || '—' }}</td>
            <td v-if="props.type === 'document'" class="px-6 py-4 text-center">
        <template v-if="item.image_path">
          <img
            v-if="isImage(item.image_path)"
            :src="getImageUrl(item.image_path)"
            alt="Document"
            class="h-16 w-16 rounded-lg object-cover border mx-auto shadow-sm hover:scale-105 transition-transform"
          />
          <a
            v-else
            :href="getImageUrl(item.image_path)"
            target="_blank"
            class="text-blue-600 underline"
          >
            View File
          </a>
        </template>
        <span v-else class="text-gray-400 italic">No file</span>
      </td>
            <td class="px-6 py-4 text-right">
              <span :class="getBadgeClass(item)" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium">
                <span>{{ getBadgeIcon(item) }}</span>
                {{ getBadgeText(item) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

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
          หน้าถัดไป
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHistory } from '@/components/together/useHistory'

const router = useRouter()
const calendarContainer = ref(null)
const statusFilter = ref('all')

// Props: แยกประเภท (appointment/document)
const props = defineProps({
  type: { type: String, default: 'all' }
})

// ใช้ composable ดึงข้อมูล/ปฏิทิน
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

// ✅ ปุ่ม Today: เลือกช่วงเป็นวันนี้เท่านั้น
function selectTodayRange () {
  const d = new Date()
  const s = new Date(d); s.setHours(0,0,0,0)
  const e = new Date(d); e.setHours(23,59,59,999)
  startDate.value = s
  endDate.value = e
  showCalendar.value = false
}

// ✅ กรองตามช่วงวันที่ (หากยังไม่เลือกช่วง แสดงทั้งหมด)
const filteredByDate = computed(() => {
  if (!startDate.value || !endDate.value) return history.value
  const start = new Date(startDate.value).setHours(0, 0, 0, 0)
  const end = new Date(endDate.value).setHours(23, 59, 59, 999)
  return history.value.filter(item => {
    const t = new Date(item.event_date).getTime()
    return t >= start && t <= end
  })
})

// 🔹 ตัวเลือกสถานะ
const statusOptions = computed(() => {
  return (props.type === 'document')
    ? [
        { value: '0', text: 'Pending' },
        { value: '1', text: 'In Progress' },
        { value: '2', text: 'Complete' },
        { value: '3', text: 'Reject' }
      ]
    : [
        { value: '0', text: 'Pending' },
        { value: '1', text: 'Approve' },
        { value: '2', text: 'Reject' },
        { value: '3', text: 'Completed' }
      ]
})

// 🔹 กรองตามประเภท + สถานะ + เรียงลำดับ
const filteredItemsByType = computed(() => {
  // ❗❗ ใช้ผลที่กรองตามช่วงวันที่เป็น “จุดเริ่มต้น”
  let items = filteredByDate.value

  // กรองตาม type (จาก props)
  if (props.type === 'appointment') {
    items = items.filter(i => i.type === 'appointment')
  } else if (props.type === 'document') {
    items = items.filter(i => i.type === 'document')
  }

  // กรองตามสถานะ
  if (statusFilter.value !== 'all') {
    items = items.filter(i => String(i.status) === statusFilter.value)
  }

  // เรียง: ใกล้วันนี้ที่สุดก่อน, Reject ไปท้าย
  const now = Date.now()
  return items.slice().sort((a, b) => {
    const isAReject = (a.type === 'document' && a.status === 3) || (a.type === 'appointment' && a.status === 2)
    const isBReject = (b.type === 'document' && b.status === 3) || (b.type === 'appointment' && b.status === 2)
    if (isAReject && !isBReject) return 1
    if (!isAReject && isBReject) return -1

    const tA = new Date(a.event_date).getTime()
    const tB = new Date(b.event_date).getTime()
    const dA = tA - now
    const dB = tB - now

    if (dA <= 0 && dB <= 0) return dB - dA   // ผ่านมาแล้ว: ใหม่กว่าอยู่บน
    if (dA >= 0 && dB >= 0) return dA - dB   // ยังไม่ถึง: ใกล้กว่าก่อน
    return dA >= 0 ? -1 : 1
  })
})

// 🔹 Pagination
const currentPage = ref(1)
const itemsPerPage = 7
const totalPages = computed(() => Math.ceil(filteredItemsByType.value.length / itemsPerPage))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItemsByType.value.slice(start, end)
})
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ✅ เปลี่ยนช่วงวันที่/สถานะ/ประเภท → กลับไปหน้า 1 เสมอ
watch([startDate, endDate, statusFilter, () => props.type], () => {
  currentPage.value = 1
})

// 🔹 Badge Styling
function getBadgeClass(item) {
  const s = item.status
  if (item.type === 'document') {
    switch (s) {
      case 0: return 'bg-orange-100 text-orange-800'
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-emerald-100 text-emerald-800'
      case 3: return 'bg-rose-100 text-rose-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  } else {
    switch (s) {
      case 0: return 'bg-orange-100 text-orange-800'
      case 1: return 'bg-emerald-100 text-emerald-800'
      case 2: return 'bg-rose-100 text-rose-800'
      case 3: return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
}
function getBadgeIcon(item) {
  const s = item.status
  if (item.type === 'document') {
    switch (s) {
      case 0: return '⏳'
      case 1: return '⚙️'
      case 2: return '✅'
      case 3: return '❌'
      default: return '?'
    }
  } else {
    switch (s) {
      case 0: return '⏳'
      case 1: return '✅'
      case 2: return '❌'
      case 3: return '✔️'
      default: return '?'
    }
  }
}
function getBadgeText(item) {
  const s = item.status
  if (item.type === 'document') {
    switch (s) {
      case 0: return 'Pending'
      case 1: return 'In Progress'
      case 2: return 'Complete'
      case 3: return 'Reject'
      default: return 'Unknown'
    }
  } else {
    switch (s) {
      case 0: return 'Pending'
      case 1: return 'Approve'
      case 2: return 'Reject'
      case 3: return 'Completed'
      default: return 'Unknown'
    }
  }
}

// 🔹 โหลดข้อมูลจาก API
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return
  try {
    const res = await fetch(`/api/history/historyall`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    history.value = data.historyItems || []
  } catch (err) {
    console.error('❌ Fetch error:', err)
  }
})

// 🔹 ปิดปฏิทินเมื่อคลิกข้างนอก
const handleClickOutside = (e) => {
  if (calendarContainer.value && !calendarContainer.value.contains(e.target)) {
    showCalendar.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
const getImageUrl = (path) => {
  if (!path) return null
  const baseUrl = 'http://localhost:3000'

  // ✅ แปลง backslash (\) → forward slash (/)
  let cleanPath = path.replace(/\\/g, '/')

  // ✅ ถ้ามี 'uploads/documents/uploads/documents/' ซ้ำ ให้เหลือแค่ครั้งเดียว
  cleanPath = cleanPath.replace(/(uploads\/uprequest\/)+/, 'uploads/uprequest/')

  // ✅ ถ้ามี '/' ซ้ำข้างหน้าก็ตัดออกแค่ครั้งเดียว
  const fullUrl = `${baseUrl}/${cleanPath.replace(/^\/+/, '')}`

  console.log('🖼️ Final image URL:', fullUrl)
  return fullUrl
}
const isImage = (path) => {
  if (!path) return false
  return /\.(png|jpg|jpeg|gif|webp)$/i.test(path)
}

</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
