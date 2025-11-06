<!-- 📁 src/views/secretary/Document/Status.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <h1 class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Document Status
      </h1>

      <!-- ✅ Pop-up สำหรับอัปโหลดไฟล์ก่อน Mark Complete -->
      <div v-if="showCompleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">อัปโหลดเอกสารยืนยัน</h3>
          <p class="text-sm text-gray-600 mb-4">กรุณาอัปโหลดไฟล์ภาพหรือ PDF เพื่อยืนยันว่าเอกสารเสร็จสมบูรณ์</p>

          <!-- ช่องอัปโหลดไฟล์ -->
          <div class="mb-4">
            <input
              type="file"
              ref="fileInput"
              @change="onFileChange"
              accept=".jpg,.jpeg,.png,.pdf"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
            />
            <div v-if="selectedFile" class="mt-2 text-sm text-green-600">
              ✅ ไฟล์ที่เลือก: {{ selectedFile.name }}
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="confirmComplete"
              :disabled="!selectedFile"
              class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              :class="{ 'opacity-50 cursor-not-allowed': !selectedFile }"
            >
              ยืนยัน
            </button>
            <button
              @click="cancelComplete"
              class="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>

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
                    class="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                  >
                    In progress
                  </span>
                  <span
                    v-if="item.status.includes('complete')"
                    class="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full"
                  >
                    Complete
                  </span>
                  <span v-if="item.status.length === 0" class="text-gray-400 text-sm">—</span>
                </div>

                <!-- ปุ่มควบคุมแบบใหม่ -->
                <div class="flex gap-2">
                  <!-- ✅ ปุ่ม "Complete" สีเขียว → แสดงเฉพาะเมื่อไม่ใช่ Complete -->
                  <button
                    v-if="!item.status.includes('complete')"
                    @click="openCompleteModal(item)"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                
                    <span class="ml-1.5">Complete</span>
                  </button>

                  <!-- ✅ ไม่แสดงปุ่มไหนเลยเมื่อเป็น Complete -->
                  <!-- ถ้าเป็น Complete → เหลือแค่ badge "Complete" อย่างเดียว -->
                </div>
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

// ✅ state สำหรับ Pop-up
const showCompleteModal = ref(false)
const selectedFile = ref(null)
const currentCompleteItem = ref(null)
const fileInput = ref(null)

// ✅ เปิด Pop-up เมื่อกดปุ่ม "Complete"
const openCompleteModal = (item) => {
  // ถ้าสถานะเป็น "Complete" แล้ว → ไม่ทำอะไร
  if (item.status.includes('complete')) return

  currentCompleteItem.value = item
  showCompleteModal.value = true
}

// ✅ จัดการไฟล์ที่อัปโหลด
const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  } else {
    selectedFile.value = null
  }
}

// ✅ ยืนยันการ Mark Complete
const confirmComplete = () => {
  if (!selectedFile.value) {
    alert('กรุณาเลือกไฟล์ก่อนยืนยัน')
    return
  }

  // อัปเดตสถานะเป็น complete
  toggleStatus(currentCompleteItem.value, 'complete')

  // ปิด Pop-up และรีเซ็ต
  showCompleteModal.value = false
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ✅ ยกเลิก
const cancelComplete = () => {
  showCompleteModal.value = false
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ✅ Toggle สถานะ (แก้ไขแล้ว!)
const toggleStatus = (item, status) => {
  // ถ้า status คือ 'complete'
  if (status === 'complete') {
    // ลบ 'in-progress' ออกก่อน → แล้วเพิ่ม 'complete'
    item.status = item.status.filter(s => s !== 'in-progress')
    item.status.push('complete')
  } else {
    // ถ้า status คือ 'in-progress'
    const index = item.status.indexOf(status)
    if (index === -1) {
      item.status.push(status)
    } else {
      item.status.splice(index, 1)
    }
  }

  const indexInArray = documents.value.findIndex(d => d.no === item.no)
  if (indexInArray !== -1) {
    documents.value.splice(indexInArray, 1, { ...item })
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