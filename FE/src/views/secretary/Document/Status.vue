<!-- 📁 src/views/secretary/Document/Status.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="title">Document Status</h1>

      <!-- ตารางสถานะเอกสาร -->
      <div class="status-table">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Date</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Add File</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in documents" :key="i">
              <td>{{ item.no }}</td>
              <td>{{ item.studentId }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.topic }}</td>
              <td>
                <div class="status-group">
                  <label>
                    <input type="checkbox" v-model="item.status" value="in-progress" />
                    In progress
                  </label>
                  <label>
                    <input type="checkbox" v-model="item.status" value="complete" />
                    Complete
                  </label>
                </div>
              </td>
              <td>
                <button class="add-file-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4m6 6l4 4M3 12l4-4"/>
                  </svg>
                </button>
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

const documents = ref([
  { no: 'A001', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration;', status: ['in-progress'] },
  { no: 'A002', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration;', status: ['in-progress'] },
  { no: 'A003', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration;', status: ['in-progress'] }
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

.status-table {
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

.status-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.status-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #003366;
}

.add-file-btn {
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

.add-file-btn:hover {
  background: #e5e7eb;
}

.add-file-btn svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}
</style>