<template>
  <SecreLayout>
    <div class="page-content">
      <!-- ✅ หัวข้อ -->
      <h1
        class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      >
        Request Document
      </h1>

      <!-- ✅ ป๊อบอัพสำหรับเลือกเหตุผล -->
      <div
        v-if="showRejectModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            เลือกเหตุผลที่ปฏิเสธเอกสาร
          </h3>

          <!-- 🔹 รายการตัวเลือก -->
          <div class="space-y-3 mb-6">
            <label
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                v-model="selectedReason"
                value="ข้อมูลในเอกสารผิด"
                class="mr-3"
              />
              ข้อมูลในเอกสารผิด
            </label>

            <label
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                v-model="selectedReason"
                value="ข้อมูลในเอกสารไม่ครบถ้วน"
                class="mr-3"
              />
              ข้อมูลในเอกสารไม่ครบถ้วน
            </label>

            <!-- ✅ ตัวเลือก 'อื่นๆ' -->
            <label
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                v-model="selectedReason"
                value="อื่นๆ"
                class="mr-3"
              />
              อื่นๆ (โปรดระบุ)
            </label>

            <!-- ✅ กล่องข้อความ เมื่อเลือก 'อื่นๆ' -->
            <textarea
              v-if="selectedReason === 'อื่นๆ'"
              v-model="customReason"
              rows="3"
              placeholder="กรุณาพิมพ์เหตุผลของคุณ..."
              class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 mt-2"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="confirmReject"
              class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              ยืนยัน
            </button>
            <button
              @click="cancelReject"
              class="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>

      <!-- ✅ ตารางรายการคำขอ -->
      <div
        class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      >
        <table class="w-full">
          <thead class="bg-gradient-to-r from-indigo-50 to-violet-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">
                No
              </th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">
                ID
              </th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">
                Name
              </th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">
                Date
              </th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">
                Topic
              </th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">
                File
              </th>
              <th class="px-6 py-4 text-right text-sm font-bold text-indigo-800">
                Status
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in paginatedRequests"
              :key="item.no"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ item.no }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ item.studentId }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.topic }}</td>

              <!-- ✅ แสดงรูปภาพ/ไฟล์ -->
              <td class="px-6 py-4 text-center">
                <img
                  v-if="isImage(item.image_path)"
                  :src="getImageUrl(item.image_path)"
                  alt="Document"
                  class="h-16 w-16 rounded-lg object-cover border mx-auto shadow-sm hover:scale-105 transition-transform"
                />
                <a
                  v-else-if="item.image_path"
                  :href="getImageUrl(item.image_path)"
                  target="_blank"
                  class="text-blue-600 underline"
                >
                  View File
                </a>
                <span v-else class="text-gray-400 italic">No file</span>
              </td>

              <!-- ✅ ปุ่มสถานะ -->
              <td class="px-6 py-4 text-right">
                <!-- Pending -->
                <template v-if="item.status === 'Pending'">
                  <button
                    @click="approve(item)"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mr-2"
                  >
                    ✅ Approve
                  </button>
                  <button
                    @click="reject(item)"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    ❌ Reject
                  </button>
                </template>

                <!-- Approved -->
                <span
                  v-else-if="item.status === 'Approved'"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-emerald-100 text-emerald-800"
                >
                  ✅ Approved
                </span>

                <!-- Rejected -->
                <span
                  v-else
                  class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-rose-100 text-rose-800"
                >
                  ❌ Rejected
                </span>
              </td>
            </tr>

            <!-- ✅ ไม่มีข้อมูล -->
            <tr v-if="requests.length === 0">
              <td
                colspan="7"
                class="text-center py-10 text-gray-500 text-sm bg-gray-50"
              >
                ไม่มีรายการคำขอเอกสาร
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ✅ Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center mt-8 space-x-1"
      >
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          :class="[ 'px-3 py-1 rounded text-sm',
            page === currentPage
              ? 'bg-indigo-600 text-white font-bold'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
          ]"
        >
          {{ page }}
        </button>

        <button
          v-if="currentPage < totalPages"
          @click="goToPage(currentPage + 1)"
          class="ml-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          หน้าถัดไป
        </button>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

// ------------------------------------------
// 🔹 STATE
// ------------------------------------------
const requests = ref([])
const showRejectModal = ref(false)
const selectedReason = ref('')
const customReason = ref('')
const currentRejectItem = ref(null)

const currentPage = ref(1)
const itemsPerPage = 7

// ------------------------------------------
// 🔹 Pagination
// ------------------------------------------
const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return requests.value.slice(start, end)
})
const totalPages = computed(() =>
  Math.ceil(requests.value.length / itemsPerPage)
)
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ------------------------------------------
// 🔹 โหลดข้อมูลจาก backend
// ------------------------------------------
const formatDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`
}

onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return
  try {
    const res = await fetch('/api/secretary/documentRequests', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    requests.value = (data.requests || []).map((item) => ({
      no: item.document_id,
      studentId: item.studentId,
      name: item.full_name,
      date: formatDate(item.submit_date),
      topic: item.topic,
      image_path: item.image_path || null, // ✅ เพิ่มภาพ
      status:
        item.status === 1
          ? 'Approved'
          : item.status === 2
          ? 'Rejected'
          : 'Pending',
    }))
  } catch (err) {
    console.error('❌ Fetch error:', err)
  }
})

// ------------------------------------------
// 🔹 Approve / Reject
// ------------------------------------------
const approve = async (item) => {
  const token = localStorage.getItem('authToken')
  try {
    await fetch('/api/secretary/updateDocumentStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ document_id: item.no, status: 1 }),
    })
    const i = requests.value.findIndex((r) => r.no === item.no)
    if (i !== -1) requests.value.splice(i, 1, { ...item, status: 'Approved' })
  } catch (err) {
    console.error('❌ Approve failed:', err)
  }
}

const reject = (item) => {
  currentRejectItem.value = item
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!selectedReason.value)
    return alert('กรุณาเลือกเหตุผลก่อนดำเนินการ')

  const finalReason =
    selectedReason.value === 'อื่นๆ'
      ? customReason.value.trim()
      : selectedReason.value

  if (selectedReason.value === 'อื่นๆ' && !finalReason)
    return alert('กรุณาพิมพ์เหตุผลในช่องข้อความ')

  const token = localStorage.getItem('authToken')
  try {
    await fetch('/api/secretary/updateDocumentStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        document_id: currentRejectItem.value.no,
        status: 3, // ❌ เปลี่ยนเป็น Reject (3)
        reason: finalReason,
      }),
    })

    const idx = requests.value.findIndex(
      (r) => r.no === currentRejectItem.value.no
    )
    if (idx !== -1)
      requests.value.splice(idx, 1, {
        ...currentRejectItem.value,
        status: 'Rejected',
        rejectionReason: finalReason,
      })

    showRejectModal.value = false
    selectedReason.value = ''
    customReason.value = ''
  } catch (err) {
    console.error('❌ Reject failed:', err)
  }
}

// ------------------------------------------
// 🔹 ตรวจประเภทไฟล์
// ------------------------------------------
const isImage = (path) => {
  if (!path) return false
  return /\.(png|jpg|jpeg|gif)$/i.test(path)
}

const getImageUrl = (path) => {
  if (!path) return null
  const baseUrl = 'http://localhost:3000'

  // ✅ แปลง backslash (\) → forward slash (/)
  let cleanPath = path.replace(/\\/g, '/')

  // ✅ ถ้ามี 'uploads/documents/uploads/documents/' ซ้ำ ให้เหลือแค่ครั้งเดียว
  cleanPath = cleanPath.replace(/(uploads\/documents\/)+/, 'uploads/documents/')

  // ✅ ถ้ามี '/' ซ้ำข้างหน้าก็ตัดออกแค่ครั้งเดียว
  const fullUrl = `${baseUrl}/${cleanPath.replace(/^\/+/, '')}`

  console.log('🖼️ Final image URL:', fullUrl)
  return fullUrl
}



// ✅ ปิด modal
const cancelReject = () => {
  showRejectModal.value = false
  selectedReason.value = ''
  customReason.value = ''
}
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
