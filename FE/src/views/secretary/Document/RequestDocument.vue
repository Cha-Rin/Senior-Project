<!-- 📁 src/views/secretary/Document/RequestDocument.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="title">Request Document</h1>

      <!-- ตารางรายการคำขอ -->
      <div class="request-table">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Date</th>
              <th>Topic</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in requests" :key="i">
              <td>{{ item.no }}</td>
              <td>{{ item.studentId }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.topic }}</td>
              <td>
                <button @click="approve(item)" class="status-btn approve">Approve</button>
                <button @click="reject(item)" class="status-btn reject">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const requests = ref([
  { no: 'A001', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration;', status: 'Pending' },
  { no: 'A002', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration;', status: 'Pending' },
  { no: 'A003', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration;', status: 'Pending' }
])

const approve = (item) => {
  item.status = 'Approved'
}

const reject = (item) => {
  item.status = 'Rejected'
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

.request-table {
  max-width: 1000px;
  margin: 0 auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f3f4f6;
  font-weight: bold;
  color: #374151;
}

.status-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.approve {
  background: #d1fae5;
  color: #059669;
}

.reject {
  background: #fee2e2;
  color: #dc2626;
}

.approve:hover {
  background: #a7f3d0;
}

.reject:hover {
  background: #fecaca;
}
</style>