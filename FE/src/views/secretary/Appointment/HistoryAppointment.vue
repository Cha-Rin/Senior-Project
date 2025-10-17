<!-- 📁 src/views/secretary/HistoryAppointment.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="title">History</h1>

      <!-- ตัวเลือกช่วงวันที่ -->
      <div class="date-range-selector">
        <span class="icon-calendar">📅</span>
        <span>21 APR 2025 - 25 APR 2025</span>
        <span class="dropdown-arrow">▼</span>
      </div>

      <!-- รายการประวัติ -->
      <div class="history-list">
        <div
          v-for="(item, i) in history"
          :key="item.no"
          class="history-card"
        >
          <div class="col no">{{ item.no }}</div>
          <div class="col student-id">{{ item.studentId }}</div>
          <div class="col date-time">
            <div>Date: {{ item.date }}</div>
            <div>Time: {{ item.time }}</div>
          </div>
          <div class="col topic">{{ item.topic }}</div>
          <div class="col status" :class="item.status.toLowerCase()">
            {{ item.status }}
          </div>
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const history = ref([
  { no: 'A001', studentId: '65xxxxxxxx', date: '21/03/25', time: '8:00 - 9:00AM', topic: 'Course registration;', status: 'Reject' },
  { no: 'A002', studentId: '65xxxxxxxx', date: '21/03/25', time: '9:00 - 10:00AM', topic: 'Course registration;', status: 'Approve' },
  { no: 'A003', studentId: '65xxxxxxxx', date: '21/03/25', time: '10:00 - 11:00AM', topic: 'Course registration;', status: 'Reject' }
])
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
  background: #fdf2f8;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #be185d;
  margin-bottom: 1.5rem;
}

.history-list {
  max-width: 1000px;
  margin: 0 auto;
}

.history-card {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.col {
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: #374151;
}

.col.no { width: 80px; font-weight: bold; font-size: 1rem; }
.col.student-id { width: 120px; }
.col.date-time { width: 200px; font-size: 0.75rem; line-height: 1.2; }
.col.topic { flex: 1; min-width: 200px; }

.col.status {
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-align: center;
  white-space: nowrap;
}

.status.reject { color: #dc2626; background: #fee2e2; }
.status.approve { color: #16a34a; background: #dcfce7; }
</style>