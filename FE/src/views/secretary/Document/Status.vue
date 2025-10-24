<!-- 📁 src/views/secretary/Document/Status.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="text-4xl font-bold text-gray-800 mb-6">Document Status</h1>

      <!-- ตารางสถานะเอกสาร -->
      <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">No</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">ID</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Date</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Topic</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Status</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Add File</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in documents" :key="item.no" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm font-bold text-indigo-700">{{ item.no }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.studentId }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ item.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.topic }}</td>
              <td class="px-6 py-4">
                <!-- แสดงสถานะปัจจุบันเป็น badge -->
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-if="item.status.includes('in-progress')"
                    class="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                  >
                    In progress
                  </span>
                  <span
                    v-if="item.status.includes('complete')"
                    class="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full"
                  >
                    Complete
                  </span>
                  <span v-if="item.status.length === 0" class="text-gray-400 text-sm">—</span>
                </div>

                <!-- ปุ่มควบคุม -->
                <div class="flex gap-2">
                  <button
                    @click="toggleStatus(item, 'in-progress')"
                    class="text-xs text-amber-700 hover:text-amber-900 font-medium underline"
                  >
                    {{ item.status.includes('in-progress') ? 'Remove In progress' : 'Mark In progress' }}
                  </button>
                  <span class="text-gray-300">|</span>
                  <button
                    @click="toggleStatus(item, 'complete')"
                    class="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline"
                  >
                    {{ item.status.includes('complete') ? 'Remove Complete' : 'Mark Complete' }}
                  </button>
                </div>
              </td>
              <td class="px-6 py-4">
                <button
                  class="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm"
                  title="Add File"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M7 16V4m0 0L3 8m4-4l4 4m6 6l4 4M3 12l4-4" />
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
  { no: 'A001', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration', status: ['in-progress'] },
  { no: 'A002', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration', status: ['in-progress'] },
  { no: 'A003', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration', status: ['in-progress'] }
])

// ✅ Toggle สถานะ: เพิ่มถ้ายังไม่มี, ลบถ้ามีอยู่แล้ว
const toggleStatus = (item, status) => {
  const index = item.status.indexOf(status)
  if (index === -1) {
    // เพิ่มสถานะ
    item.status.push(status)
  } else {
    // ลบสถานะ
    item.status.splice(index, 1)
  }
}
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>