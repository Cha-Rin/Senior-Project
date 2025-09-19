<template>
  <div class="page">
    <h1 class="title">Appointment</h1>

    <!-- Controls -->
    <div class="controls">
      <span class="label">Mode:</span>

      <button
        class="btn"
        :class="{ active: mode==='add' }"
        @click="setMode('add')"
      >Add</button>

      <button
        class="btn"
        :class="{ active: mode==='select' }"
        @click="setMode('select')"
      >Select to delete</button>

      <button
        class="btn"
        :disabled="selectedToDelete.size===0"
        @click="deleteSelected"
      >Delete</button>
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
              :style="cellStyle(r,c)"
              @click="onCellClick(r,c)"
              :aria-label="`${slot} ${d}`"
            >
              <div v-if="isSelectedToDelete(r,c)" class="dot"></div>
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
</template>

<script setup>
import { ref } from 'vue'

/* ตารางเวลา + วัน */
const timeSlots = [
  '08:00 - 09:00','09:00 - 10:00','10:00 - 11:00',
  '11:00 - 12:00','12:00 - 13:00','13:00 - 14:00',
  '14:00 - 15:00','15:00 - 16:00'
]
const days = ['mon','tue','wed','thu','fri']
const LUNCH_ROW = 4 // 12:00 - 13:00

/* โหมด */
const mode = ref('add') // 'add' | 'select'
const setMode = (m) => { mode.value = m }

/* การจอง: เก็บคีย์ "row,col" ใน Set */
const key = (r,c) => `${r},${c}`
const reserved = ref(new Set())
// seed ให้เห็นสีทันที (ตัวอย่าง)
;[[1,1],[2,1],[5,3],[7,4]].forEach(([r,c]) => reserved.value.add(key(r,c)))

/* เลือกเพื่อลบ */
const selectedToDelete = ref(new Set())
const isSelectedToDelete = (r,c) => selectedToDelete.value.has(key(r,c))

/* คลิกช่อง */
const onCellClick = (r,c) => {
  if (r === LUNCH_ROW) return // แถวพักเที่ยงคลิกไม่ได้
  const k = key(r,c)

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
  selectedToDelete.value.forEach(k => reserved.value.delete(k))
  selectedToDelete.value.clear()
}

/* สีของ cell (ใช้ CSS ปกติ ไม่พึ่ง Tailwind) */
const cellStyle = (r,c) => {
  if (r === LUNCH_ROW) {
    return { backgroundColor: '#6b7280', cursor: 'not-allowed' } // เทา
  }
  const k = key(r,c)
  if (reserved.value.has(k)) {
    return {
      backgroundColor: isSelectedToDelete(r,c) ? '#fecaca' : '#ef4444', // ชมพูอ่อน/แดง
      color: '#fff'
    }
  }
  return { backgroundColor: '#fff' }
}

/* รายการคำขอ (เดโม) */
const requests = ref([
  { topic: 'Internship',   date: '21 / 04 / 25', time: '08:00 - 09:00 A.M.' },
  { topic: 'Faculty Club', date: '21 / 04 / 25', time: '08:00 - 09:00 A.M.' },
  { topic: 'Faculty Club', date: '21 / 04 / 25', time: '08:00 - 09:00 A.M.' },
])

const openRequest = (req) => {
  alert(`Open request:\n${req.topic}\n${req.date} ${req.time}`)
}
</script>

<style scoped>
/* -------- layout -------- */
.page { min-height: 100vh; background: #fff; padding: 24px; }
.title { font-size: 40px; font-weight: 800; color: #1f2937; margin: 0 0 24px; text-align: left; }
.sub-title { font-size: 24px; font-weight: 700; color: #1f2937; margin: 24px 0 12px; }

/* -------- controls -------- */
.controls { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.label { font-size: 18px; color: #111827; }
.btn {
  padding: 10px 16px; border-radius: 12px; border: 1px solid #d1d5db;
  background:#fff; cursor: pointer;
}
.btn:hover { background:#f3f4f6; }
.btn:disabled { opacity:.4; cursor:not-allowed; }
.btn.active { background:#111827; color:#fff; }

/* -------- table -------- */
.table-wrap { overflow-x: auto; }
.table { min-width: 720px; border-collapse: collapse; width: max-content; }
.table th, .table td { border: 1px solid #d1d5db; }
.time-head, .day-head { padding: 8px 16px; background:#f3f4f6; color:#374151; text-transform: capitalize; }
.time-cell { white-space: nowrap; padding: 12px 16px; color:#1f2937; }
.cell {
  width: 7rem; height: 3rem; text-align: center; user-select: none; cursor: pointer;
}

/* จุดบอกว่าเลือกไว้เพื่อลบ */
.dot { width: 8px; height: 8px; border-radius: 9999px; margin: 10px auto; background:#e11d48; }

/* -------- requests -------- */
.request-list { max-width: 720px; display: grid; gap: 12px; }
.request-row {
  display: flex; align-items: center; justify-content: space-between;
  background: #f8fafc; border-radius: 12px; padding: 10px 16px;
}
.req-btn { font-size: 20px; line-height: 1; padding: 6px 10px; border-radius: 8px; background:#e5e7eb; }
.req-btn:hover { background:#d1d5db; }
</style>
