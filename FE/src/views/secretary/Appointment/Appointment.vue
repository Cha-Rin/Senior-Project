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
    : 'bg-white text-black hover:bg-gray-100'
  "
>
  Add
</button>

<!-- Select to delete -->
<button
  @click="setMode('select')"
  class="px-4 py-2 rounded-xl border border-gray-300 transition"
  :class="mode === 'select'
    ? 'bg-black text-white'
    : 'bg-white text-black hover:bg-gray-100'
  "
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

                <!-- Time Label -->
                <td class="px-4 py-3 text-gray-800 border border-gray-300 whitespace-nowrap">
                  {{ slot }}
                </td>

                <!-- Cells -->
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
import { useRouter } from 'vue-router'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import axios from 'axios'

const router = useRouter()
const authToken = localStorage.getItem("authToken")
const staffId = localStorage.getItem("userId")

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
const setMode = (m) => (mode.value = m)

const reserved = ref(new Set())
const selectedToDelete = ref(new Set())
const isSelectedToDelete = (r, c) => selectedToDelete.value.has(`${r},${c}`)
const key = (r, c) => `${r},${c}`


// --- 💡 Helper Functions (กัน Timezone) ---

// 1. [WRITE] แปลง Date object เป็น "YYYY-MM-DD" (Local)
const getLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 2. [WRITE] หาวันจันทร์ (Monday) จากวันที่ใดๆ (Local)
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay(); // Local day (Sun=0, Mon=1...)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  date.setDate(diff);
  date.setHours(12, 0, 0, 0); // ตั้งเวลาเที่ยงวัน หนีปัญหาเที่ยงคืน
  return date;
}

// 3. [WRITE] แปลง "Column Index" (0-4) เป็น "YYYY-MM-DD" (สำหรับส่งไป API)
const getDateFromDayIndex = (col) => {
  const [year, month, day] = selectedWeek.value.start.split('-').map(Number);
  const start = new Date(year, month - 1, day, 12, 0, 0); // ใช้ month - 1
  start.setDate(start.getDate() + col) 
  return getLocalDateString(start)
}

// 4. [READ] แปลง "Timestamp" (จาก DB) เป็น "Day Index" (0-4)
//
// ‼️‼️‼️ นี่คือจุดที่แก้ครับ ‼️‼️‼️
//
const getDayIndexFromDate = (dateStr) => {
  if (!dateStr) return -1;
  
  // ✅ FIX: สร้าง Date object จาก string เต็ม (T...Z)
  // new Date() จะแปลง UTC (Z) เป็น Local Timezone ให้อัตโนมัติ
  const itemDate = new Date(dateStr); 
  
  // (เช่น "2025-11-03T17:00Z" -> จะกลายเป็น "อังคาร 4 พ.ย. 00:00" ในเครื่องเรา)
  
  const jsDayLocal = itemDate.getDay(); // Sun=0, Mon=1, Tue=2...
  
  if (jsDayLocal === 0 || jsDayLocal === 6) { 
    return -1; // กรอง เสาร์-อาทิตย์
  }
  return jsDayLocal - 1; // Mon=0, Tue=1...
}
// --- (จบส่วน Helper) ---


/* คลิก cell */
const onCellClick = async (r, c) => {
  if (r === LUNCH_ROW) return
  const k = key(r, c)

  if (mode.value === 'add') {
    if (!reserved.value.has(k)) {
      reserved.value.add(k) 

      // [WRITE] ใช้ Helper (ส่วนนี้ถูกต้องแล้ว)
      const date = getDateFromDayIndex(c) 
      const start_time = timeSlots[r].split(' - ')[0] + ":00"
      const end_time = timeSlots[r].split(' - ')[1] + ":00"

      console.log(`[WRITE] Sending to API: ${date} @ ${start_time}`);

      try {
        await axios.post(
          "/secretary/add",
          { staff_id: staffId, date, start_time, end_time },
          { headers: { Authorization: `Bearer ${authToken}` } }
        )
        loadOffTime()
      } catch (err) {
        console.error("Error adding off-time:", err)
        reserved.value.delete(k) 
      }
    }
    return
  }

  /* SELECT MODE */
  if (mode.value === 'select') {
    if (!reserved.value.has(k)) return
    if (selectedToDelete.value.has(k))
      selectedToDelete.value.delete(k)
    else
      selectedToDelete.value.add(k)
  }
}

/* สี cell (ถูกต้อง) */
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

/* Week / Month Picker (ถูกต้อง) */
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

const selectedMonthYear = ref(
  `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
)

const weeksInMonth = computed(() => {
  const [year, month] = selectedMonthYear.value.split('-').map(Number)
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const result = []
  
  let cur = getMonday(first); 

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


/* off-time ที่โหลดมา */
const offItems = ref([])

/* โหลดจาก backend (ใช้ Helper ที่แก้แล้ว) */
const loadOffTime = async () => {
  if (!selectedWeek.value) return;

  console.log("--- 🔄 Loading Off-Time for week:", selectedWeek.value.start);

  try {
    const res = await axios.get("/secretary/list", {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        weekStart: selectedWeek.value.start,
        weekEnd: selectedWeek.value.end
      }
    });

    offItems.value = res.data.items;
    console.log(`Found ${res.data.items.length} items from API`);

    const newSet = new Set();

    res.data.items.forEach((item, index) => {

      if (!item || !item.date || !item.start_time) {
        console.warn(`Item ${index} skipped: Data is incomplete`);
        return;
      }

      // --- 💡 [READ] ใช้ Helper ที่แก้แล้ว ---
      const dayIndex = getDayIndexFromDate(item.date); // item.date คือ "....T...Z"

      if (dayIndex === -1) {
        console.warn(`Item ${index} skipped: Invalid day (date: ${item.date})`);
        return;
      }
      // --- (จบ) ---

      // --- (ส่วน Time ถูกต้อง) ---
      const itemTime = new Date(`1970-01-01T${item.start_time}`);
      const itemHour = itemTime.getHours(); 
      const timeIndex = timeSlots.findIndex(slot => {
        const slotHour = parseInt(slot.slice(0, 2), 10);
        return slotHour === itemHour;
      });

      if (timeIndex === -1) {
        console.warn(`Item ${index} skipped: Invalid time (time: ${item.start_time})`);
        return;
      }

      const key = `${timeIndex},${dayIndex}`;
      console.log(`✅ [READ] Adding item ${index} to Set: ${key} (Date: ${item.date}, Time: ${item.start_time})`);
      newSet.add(key);
    });

    reserved.value = newSet;
    console.log("--- ✅ Load complete. Final reserved Set:", reserved.value);

  } catch (err) {
    console.error("🔥 Error loading off-time:", err);
  }
};

/* onMounted (ถูกต้อง) */
onMounted(() => {
  const now = new Date()
  const start = getMonday(now)
  const startStr = getLocalDateString(start)

  selectedWeek.value =
    weeksInMonth.value.find(w => w.start === startStr) || weeksInMonth.value[0]
})

/* watch (ถูกต้อง) */
watch(selectedWeek, (newWeek, oldWeek) => {
  if (newWeek?.start !== oldWeek?.start) {
    selectedToDelete.value.clear()
  }
  loadOffTime()
}, { immediate: true }) 

watch(selectedMonthYear, () => {
  selectedWeek.value = weeksInMonth.value[0] || null
})

/* Delete (ใช้ Helper ที่แก้แล้ว) */
const deleteSelected = async () => {
  const idsToDelete = [];

  offItems.value.forEach(item => {
    // ใช้ Logic แบบเดียวกับ loadOffTime
    const dayIndex = getDayIndexFromDate(item.date); // <-- ใช้ Helper ที่แก้แล้ว
    
    const itemTime = new Date(`1970-01-01T${item.start_time}`);
    const itemHour = itemTime.getHours(); 
    const timeIndex = timeSlots.findIndex(slot => {
      const slotHour = parseInt(slot.slice(0, 2), 10);
      return slotHour === itemHour;
    });

    if (timeIndex !== -1 && dayIndex !== -1) {
      if (selectedToDelete.value.has(`${timeIndex},${dayIndex}`)) {
        idsToDelete.push(item.off_time_id);
      }
    }
  });

  if (idsToDelete.length === 0) return;

  try {
    console.log("Deleting IDs:", idsToDelete); 
    
    await axios.post(
      "/secretary/delete",
      { ids: idsToDelete }, 
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    selectedToDelete.value.clear();
    loadOffTime(); 

  } catch (err) {
    console.error("Error deleting off-time:", err);
  }
};

</script>