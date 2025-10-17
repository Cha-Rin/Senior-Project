<!-- 📁 src/views/secretary/Document/HistoryDocument.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="title">History</h1>

      <!-- 🔸 Date Range Dropdown -->
      <div class="date-range-selector">
        <label class="flex items-center gap-2 text-sm font-semibold">
          <i class="far fa-calendar-alt"></i>
          <select class="border px-3 py-1 rounded text-sm shadow">
            <option>21 APR 2025 - 25 APR 2025</option>
          </select>
        </label>
      </div>

      <!-- 🔸 Table -->
      <div class="history-table">
        <div class="table-header">
          <div>No</div>
          <div>ID</div>
          <div>Date</div>
          <div>Topic</div>
          <div>Status</div>
          <div>File</div>
        </div>

        <div
          v-for="(item, i) in history"
          :key="i"
          class="table-row"
        >
          <div>{{ item.no }}</div>
          <div>{{ item.studentId }}</div>
          <div>{{ item.date }}</div>
          <div>{{ item.topic }}</div>
          <div>
            <span
              :class="item.status === 'Complete' ? 'text-green-500' : 'text-red-500'"
              class="font-semibold"
            >
              {{ item.status }}
            </span>
          </div>
          <div>
            <button
              class="view-file-btn"
              @click="viewFile(item)"
              title="View File"
            >
              <img :src="viewFileIcon" alt="View File" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

// ไอคอนดูไฟล์ (คุณสามารถแทนที่ด้วย path จริงได้)
const viewFileIcon = '/icon/view-file.png' // หรือใช้ inline SVG

const history = ref([
  {
    no: 'A001',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;',
    status: 'Complete',
    fileUrl: '/files/req-A001.pdf'
  },
  {
    no: 'A002',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;',
    status: 'Reject',
    fileUrl: '/files/receipt-A002.png'
  },
  {
    no: 'A003',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;',
    status: 'Complete',
    fileUrl: '/files/req-A003.pdf'
  }
])

const viewFile = (item) => {
  if (!item?.fileUrl) return
  const w = window.open(item.fileUrl, '_blank', 'noopener,noreferrer')
  if (!w) {
    const a = document.createElement('a')
    a.href = item.fileUrl
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1f2937;
}

.date-range-selector {
  margin-bottom: 1.5rem;
}

.history-table {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: 1rem;
  text-align: left;
}

.table-header {
  background: #f3f4f6;
  font-weight: bold;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
}

.table-row:last-child {
  border-bottom: none;
}

.view-file-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.view-file-btn:hover {
  background: #e5e7eb;
}
</style>