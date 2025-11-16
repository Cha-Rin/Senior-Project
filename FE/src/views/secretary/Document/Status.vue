<template>
  <SecreLayout>
    <div class="page-content">
      <h1
        class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      >
        Document Status
      </h1>

      <!-- ✅ Pop-up สำหรับอัปโหลดไฟล์ก่อน Mark Complete -->
      <!-- ✅ Pop-up สำหรับอัปโหลดไฟล์ก่อน Mark Complete -->
<div
  v-if="showCompleteModal"
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
>
  <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">

    <!-- ปิด Modal -->
    <button
      @click="cancelComplete"
      class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
    >✖</button>

    <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">
      อัปโหลดเอกสารยืนยัน
    </h3>

    <p class="text-sm text-gray-600 mb-4 text-center">
      กรุณาเลือกไฟล์ภาพ / PDF หรือถ่ายภาพจากกล้อง
    </p>

    <!-- ⭐ ปุ่มเปิดกล้อง -->
    <button
      @click="openCamera"
      class="w-full px-4 py-2 mb-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      📸 ถ่ายภาพจากกล้อง
    </button>

    <!-- ⭐ เลือกไฟล์ -->
    <input
      type="file"
      ref="fileInput"
      @change="onFileChange"
      accept=".jpg,.jpeg,.png,.pdf"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
    />

    <!-- ⭐ Preview รูปที่ถ่าย หรือรูปที่เลือก -->
    <div v-if="previewImage" class="mt-4">
      <img :src="previewImage" class="w-full rounded-lg border" />
    </div>

    <!-- ปุ่มกด ยืนยัน / ยกเลิก -->
    <div class="flex gap-3 mt-6">
      <button
        @click="confirmComplete"
        :disabled="!selectedFile"
        class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:shadow-lg transition-all"
        :class="{ 'opacity-50 cursor-not-allowed': !selectedFile }"
      >
        ✔ ยืนยัน
      </button>

      <button
        @click="cancelComplete"
        class="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:shadow-lg transition-all"
      >
        ✖ ยกเลิก
      </button>
    </div>

  </div>
</div>


      <!-- ตารางสถานะเอกสาร -->
      <div
        class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      >
        <table class="w-full">
          <thead class="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">No</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">ID</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Name</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Date</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Topic</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-indigo-800">Status</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in paginatedDocuments"
              :key="item.no"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-bold text-indigo-700">{{ item.no }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.studentId }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ item.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ item.topic }}</td>

              <td class="px-6 py-4">
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

                <!-- ปุ่ม Complete -->
                <div class="flex gap-2">
                  <button
                    v-if="!item.status.includes('complete')"
                    @click="openCompleteModal(item)"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    ✅ <span class="ml-1.5">Complete</span>
                  </button>
                </div>
              </td>
            </tr>

            <!-- ถ้าไม่มีข้อมูล -->
            <tr v-if="documents.length === 0">
              <td
                colspan="6"
                class="text-center py-10 text-gray-500 text-sm bg-gray-50"
              >
                ไม่มีข้อมูลสถานะเอกสาร
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
          :class="[
            'px-3 py-1 rounded text-sm',
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

<!-- Modal กล้อง -->
<div
  v-if="showCamera"
  class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
>
  <div class="bg-white p-4 rounded-xl shadow-xl max-w-md w-full">
    <video ref="video" autoplay playsinline class="w-full rounded-lg"></video>

    <div class="flex gap-3 mt-4">
      <button
        @click="capturePhoto"
        class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg"
      >
        📸 ถ่ายรูป
      </button>

      <button
        @click="closeCamera"
        class="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg"
      >
        ❌ ปิดกล้อง
      </button>
    </div>
  </div>
</div>

    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'
import jwt_decode from "jwt-decode"
// ------------------------------------------
// STATE
// ------------------------------------------
const documents = ref([])
const showCompleteModal = ref(false)
const selectedFile = ref(null)
const currentCompleteItem = ref(null)
const fileInput = ref(null)
const token = localStorage.getItem('authToken')
let userId = localStorage.getItem('userId')
if (token) {
  try {
    const decoded = jwt_decode(token)
    if (decoded.userId) {
      userId = decoded.userId
      localStorage.setItem('userId', userId)
    }
  } catch (e) {
    console.warn('Token decode failed:', e)
  }
}
// ✅ Pagination
const currentPage = ref(1)
const itemsPerPage = 7

// ✅ แปลงวันที่ (ไทย)
const formatDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`
}

// ✅ โหลดข้อมูลจาก Backend
const loadDocuments = async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return

  try {
    const res = await fetch('/api/secretary/documentStatus', {
     headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()

    documents.value = (data.documents || []).map((d) => ({
      no: d.document_id,
      studentId: d.studentId,
      name: d.full_name,
      date: formatDate(d.submit_date),
      topic: d.topic,
      status:
        d.status === 0
          ? ['pending']
          : d.status === 1
          ? ['in-progress']
          : d.status === 2
          ? ['complete']
          : [],
    }))
  } catch (err) {
    console.error('❌ Fetch document status:', err)
  }
}

const showCamera = ref(false)
const video = ref(null)
const previewImage = ref(null)

const openCamera = async () => {
  showCamera.value = true
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    video.value.srcObject = stream
  } catch (err) {
    alert('ไม่สามารถเปิดกล้องได้')
  }
}

const closeCamera = () => {
  showCamera.value = false
  const stream = video.value?.srcObject
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
  }
}

const capturePhoto = () => {
  const canvas = document.createElement('canvas')
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight

  const context = canvas.getContext('2d')
  context.drawImage(video.value, 0, 0)

  const dataUrl = canvas.toDataURL('image/jpeg') // base64 image

  previewImage.value = dataUrl

  // แปลงเป็นไฟล์
  const byteString = atob(dataUrl.split(',')[1])
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]

  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  selectedFile.value = new File([ab], 'camera_capture.jpg', { type: mimeString })

  closeCamera()
}



// ✅ เปิด Modal อัปโหลด
const openCompleteModal = (item) => {
  if (item.status.includes('complete')) return
  currentCompleteItem.value = item
  showCompleteModal.value = true
}

// ✅ เมื่อเลือกไฟล์
const onFileChange = (e) => {
  selectedFile.value = e.target.files[0] || null
}

// ✅ ยืนยัน Complete → Upload file → Update backend
const confirmComplete = async () => {
  if (!selectedFile.value) return alert('กรุณาเลือกไฟล์ก่อนยืนยัน')

  const token = localStorage.getItem('authToken')
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('document_id', currentCompleteItem.value.no)

  try {
    const res = await fetch('/api/secretary/markDocumentComplete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // ✅ อย่าใส่ Content-Type เอง
      },
      body: formData,
    })

    const result = await res.json()
    if (!result.success) throw new Error(result.message || 'Upload failed')

    alert('✅ อัปโหลดสำเร็จ และอัปเดตสถานะเป็น Complete แล้ว')
    await loadDocuments()
  } catch (err) {
    console.error('❌ Upload failed:', err)
    alert('เกิดข้อผิดพลาดระหว่างอัปโหลดไฟล์')
  } finally {
    showCompleteModal.value = false
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ✅ ยกเลิก Modal
const cancelComplete = () => {
  showCompleteModal.value = false
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ✅ Pagination logic
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return documents.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(documents.value.length / itemsPerPage)
)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ✅ โหลดตอน mount
onMounted(loadDocuments)
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
