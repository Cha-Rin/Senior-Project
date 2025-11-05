<!-- 📁 src/views/secretary/Document/RequestDocument.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <!-- ✅ หัวข้อใช้ gradient สีม่วง-น้ำเงิน -->
      <h1 class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Request Document
      </h1>

      <!-- ✅ ป๊อบอัพสำหรับเลือกเหตุผล -->
      <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">เลือกเหตุผลที่ปฏิเสธเอกสาร</h3>

          <div class="space-y-3 mb-6">
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" v-model="selectedReason" value="ข้อมูลในเอกสารผิด" class="mr-3">
              ข้อมูลในเอกสารผิด
            </label>
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" v-model="selectedReason" value="ข้อมูลในเอกสารไม่ครบถ้วน" class="mr-3">
              ข้อมูลในเอกสารไม่ครบถ้วน
            </label>
          </div>

          <div class="flex gap-3">
            <button @click="confirmReject" class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 mr-2">
              ยืนยัน
            </button>
            <button @click="cancelReject" class="flex-1 px-4 py-2 bg-rose-500 border border-gray-300 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 mr-2">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>

      <!-- ตารางรายการคำขอ -->
      <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <!-- ✅ Header ตารางใช้พื้นหลัง gradient อ่อน -->
        <table class="w-full">
          <thead class="bg-gradient-to-r from-indigo-50 to-violet-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">No</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">ID</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Date</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Topic</th>
              <th class="px-6 py-4 text-right text-sm font-bold text-indigo-800">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in requests" :key="item.no" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.no }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.studentId }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.topic }}</td>
              <td class="px-6 py-4 text-right">
                <!-- ถ้ายัง Pending -->
                <template v-if="item.status === 'Pending'">
                  <!-- ✅ ปุ่ม Approve → สีเขียว (emerald) + ไอคอน ✅ -->
                  <button
                    @click="approve(item)"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mr-2"
                  >
                    <span>✅</span>
                    <span class="ml-1.5">Approve</span>
                  </button>
                  <!-- ✅ ปุ่ม Reject → สีแดง (rose) + ไอคอน ❌ -->
                  <button
                    @click="reject(item)"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    <span>❌</span>
                    <span class="ml-1.5">Reject</span>
                  </button>
                </template>

                <!-- ✅ สถานะ Approved → badge + ไอคอน -->
                <span
                  v-else-if="item.status === 'Approved'"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-emerald-100 text-emerald-800"
                >
                  <span>✅</span>
                  <span class="ml-1.5">Approved</span>
                </span>

                <!-- ✅ สถานะ Rejected → badge + ไอคอน -->
                <span
                  v-else
                  class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-rose-100 text-rose-800"
                >
                  <span>❌</span>
                  <span class="ml-1.5">Rejected</span>
                </span>
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
  { no: 'A001', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration', status: 'Pending' },
  { no: 'A002', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration', status: 'Pending' },
  { no: 'A003', studentId: '65xxxxxxxx', date: '21 Apr 2025', topic: 'Course registration', status: 'Pending' }
])

// ✅ 1. state สำหรับ Pop-up
const showRejectModal = ref(false)
const selectedReason = ref('')
const currentRejectItem = ref(null) // เก็บ item ที่กำลังจะ reject

// ✅ ใช้ splice เพื่อให้ Vue ตรวจจับการเปลี่ยนแปลง
const approve = (item) => {
  const index = requests.value.findIndex(r => r.no === item.no)
  if (index !== -1) {
    requests.value.splice(index, 1, { ...item, status: 'Approved' })
  }
}

// ✅ 2. แก้ฟังก์ชัน reject → เปิด Pop-up
const reject = (item) => {
  currentRejectItem.value = item
  showRejectModal.value = true
}

// ✅ 3. ฟังก์ชันยืนยันการ Reject
const confirmReject = async () => {
  if (!selectedReason.value) return alert('กรุณาเลือกเหตุผล')

  const index = requests.value.findIndex(r => r.no === currentRejectItem.value.no)
  if (index !== -1) {
    // ✅ อัปเดต status และเพิ่ม field rejectionReason
    requests.value.splice(index, 1, { 
      ...currentRejectItem.value, 
      status: 'Rejected',
      rejectionReason: selectedReason.value // ⭐️ เพิ่มเหตุผล
    })
  }

  // ✅ ปิด Pop-up
  showRejectModal.value = false
  selectedReason.value = ''
}

// ✅ 4. ฟังก์ชันยกเลิก
const cancelReject = () => {
  showRejectModal.value = false
  selectedReason.value = ''
}

</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>