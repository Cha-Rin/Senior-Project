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
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">NAME</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Date</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Topic</th>
              <th class="px-6 py-4 text-medium text-sm font-bold text-indigo-800">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in requests" :key="item.no" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.no }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.studentId }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.name }}</td>
              <td class="px-6 py-6 text-sm text-gray-700">{{ item.date }}</td>
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
import { ref, onMounted } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

const requests = ref([])

const showRejectModal = ref(false)
const selectedReason = ref('')
const currentRejectItem = ref(null)

const formatDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`
}

// ✅ โหลดข้อมูลเอกสารที่ Pending
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return

  try {
    const res = await fetch('/secretary/documentRequests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()

    requests.value = (data.requests || []).map((item, index) => ({
      no: item.document_id,
      studentId: item.studentId,
      name: item.full_name,
      date: formatDate(item.submit_date),
      topic: item.topic,
      status:
        item.status === 1
          ? 'Approved'
          : item.status === 2
          ? 'Rejected'
          : 'Pending'
    }))
  } catch (err) {
    console.error('❌ Fetch error (documentRequests):', err)
  }
})

// ✅ Approve
const approve = async (item) => {
  const token = localStorage.getItem('authToken')
  try {
    await fetch('/secretary/updateDocumentStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ document_id: item.no, status: 1 })
    })

    const index = requests.value.findIndex(r => r.no === item.no)
    if (index !== -1)
      requests.value.splice(index, 1, { ...item, status: 'Approved' })
  } catch (err) {
    console.error('❌ Approve failed:', err)
  }
}

// ✅ เปิด modal เมื่อ Reject
const reject = (item) => {
  currentRejectItem.value = item
  showRejectModal.value = true
}

// ✅ Confirm Reject (ส่งเหตุผล)
const confirmReject = async () => {
  if (!selectedReason.value) return alert('กรุณาเลือกเหตุผล')

  const token = localStorage.getItem('authToken')
  try {
    await fetch('/secretary/updateDocumentStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        document_id: currentRejectItem.value.no,
        status: 2,
        reason: selectedReason.value
      })
    })

    const index = requests.value.findIndex(
      r => r.no === currentRejectItem.value.no
    )
    if (index !== -1)
      requests.value.splice(index, 1, {
        ...currentRejectItem.value,
        status: 'Rejected',
        rejectionReason: selectedReason.value
      })

    showRejectModal.value = false
    selectedReason.value = ''
  } catch (err) {
    console.error('❌ Reject failed:', err)
  }
}

// ✅ Cancel modal
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