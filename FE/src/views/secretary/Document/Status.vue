<template>
  <SecreLayout>
    <div class="page-content">
      <h1
        class="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      >
        Document Status
      </h1>

      <!-- ============================= -->
      <!-- 📌 Modal: Upload for Complete -->
      <!-- ============================= -->
      <div
        v-if="showCompleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
          <button
            @click="cancelComplete"
            class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>

          <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">
            อัปโหลดเอกสารยืนยัน
          </h3>

          <p class="text-sm text-gray-600 mb-4 text-center">
            กรุณาเลือกไฟล์ภาพ หรือถ่ายภาพจากกล้อง
          </p>

          <button
            @click="openCamera"
            class="w-full px-4 py-2 mb-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            📸 ถ่ายภาพจากกล้อง
          </button>

          <input
            type="file"
            ref="fileInput"
            @change="onFileChange"
            accept=".jpg,.jpeg,.png,.pdf"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
          />

          <div v-if="previewImage" class="mt-4">
            <img :src="previewImage" class="w-full rounded-lg border" />
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="confirmComplete"
              :disabled="!selectedFile"
              class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:shadow-lg"
              :class="{ 'opacity-50 cursor-not-allowed': !selectedFile }"
            >
              ✔ ยืนยัน
            </button>

            <button
              @click="cancelComplete"
              class="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:shadow-lg"
            >
              ✖ ยกเลิก
            </button>
          </div>
        </div>
      </div>

      <!-- ============================= -->
      <!-- 📌 Document Status Table -->
      <!-- ============================= -->
      <div
        class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      >
        <table class="w-full"> <thead class="bg-gradient-to-r from-indigo-50 to-purple-50"> <tr> 
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
              class="hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 font-bold text-indigo-700">
                {{ item.no }}
              </td>

              <td class="px-6 py-4">{{ getStudentCode(item.email) }}</td>

              <td class="px-6 py-4">{{ item.name }}</td>

              <td class="px-6 py-4">{{ item.date }}</td>

              <td class="px-6 py-4">{{ item.topic }}</td>

              <!-- Status + Complete button -->
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-if="item.status === 'pending'"
                    class="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full"
                  >
                    Pending
                  </span>

                  <span
                    v-if="item.status === 'in-progress'"
                    class="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                  >
                    In progress
                  </span>

                  <span
                    v-if="item.status === 'complete'"
                    class="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full"
                  >
                    Complete
                  </span>
                </div>

                <button
                  v-if="item.status !== 'complete'"
                  @click="openCompleteModal(item)"
                  class="px-4 py-2 text-sm rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  ✅ Complete
                </button>
              </td>
            </tr>

            <tr v-if="documents.length === 0">
              <td colspan="6" class="text-center py-10 text-gray-500">
                ไม่มีข้อมูลสถานะเอกสาร
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ============================= -->
      <!-- 📌 Pagination -->
      <!-- ============================= -->
      <div v-if="totalPages > 1" class="flex justify-center items-center mt-8 space-x-1">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded',
            page === currentPage ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          ]"
        >
          {{ page }}
        </button>
      </div>

      <!-- ============================= -->
      <!-- 📌 Camera Modal -->
      <!-- ============================= -->
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
import { ref, computed, onMounted } from "vue"
import SecreLayout from "@/layouts/secretary/SecreLayout.vue"
import jwt_decode from "jwt-decode"

/* ================================
   STATE
================================ */
const documents = ref([])
const showCompleteModal = ref(false)
const selectedFile = ref(null)
const currentCompleteItem = ref(null)
const fileInput = ref(null)

const showCamera = ref(false)
const video = ref(null)
const previewImage = ref(null)

/* ================================
   Load documents
================================ */
const formatDate = (iso) => {
  if (!iso) return "-"
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`
}

const loadDocuments = async () => {
  const token = localStorage.getItem("authToken")

  const res = await fetch("/api/secretary/documentStatus", {
    headers: { Authorization: `Bearer ${token}` }
  })

  const data = await res.json()

  documents.value = (data.documents || []).map((d) => ({
    no: d.document_code,
    documentId: d.document_id,   // ✅ ใช้ document_id จริง
    email: d.student_email,
    name: d.full_name,
    date: formatDate(d.submit_date),
    topic: d.topic,
    status:
      d.status === 0
        ? "pending"
        : d.status === 1
        ? "in-progress"
        : d.status === 2
        ? "complete"
        : ""
  }))
}

onMounted(loadDocuments)

/* ================================
   Complete modal
================================ */
const openCompleteModal = (item) => {
  currentCompleteItem.value = item
  showCompleteModal.value = true
}

const cancelComplete = () => {
  showCompleteModal.value = false
  selectedFile.value = null
  previewImage.value = null
}

/* ================================
   File picker
================================ */
const onFileChange = (e) => {
  selectedFile.value = e.target.files[0]
}

/* ================================
   Camera
================================ */
const openCamera = async () => {
  showCamera.value = true

  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  video.value.srcObject = stream
}

const closeCamera = () => {
  showCamera.value = false
  const stream = video.value?.srcObject
  if (stream) stream.getTracks().forEach((t) => t.stop())
}

const capturePhoto = () => {
  const canvas = document.createElement("canvas")
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight

  canvas.getContext("2d").drawImage(video.value, 0, 0)

  const dataUrl = canvas.toDataURL("image/jpeg")
  previewImage.value = dataUrl

  selectedFile.value = dataURLtoFile(dataUrl, "capture.jpg")

  closeCamera()
}

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",")
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

/* ================================
   Confirm complete (upload + update status)
================================ */
const confirmComplete = async () => {
  if (!selectedFile.value) return alert("กรุณาเลือกไฟล์")

  const token = localStorage.getItem("authToken")

  const fd = new FormData()
  fd.append("file", selectedFile.value)
  fd.append("document_id", currentCompleteItem.value.documentId) // ⬅ ใช้ document_id จริง

  const res = await fetch("/api/secretary/markDocumentComplete", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  })

  const result = await res.json()

  if (!result.success) {
    alert("อัปโหลดไม่สำเร็จ")
    return
  }

  alert("อัปโหลดสำเร็จและอัปเดตสถานะเป็น Complete แล้ว")

  showCompleteModal.value = false
  selectedFile.value = null

  await loadDocuments() // ⬅ reload ข้อมูลหลัง update
}

/* ================================
   Pagination
================================ */
const currentPage = ref(1)
const itemsPerPage = 7

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return documents.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(documents.value.length / itemsPerPage)
)

const goToPage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: "smooth" })
}

const getStudentCode = (email) => email?.split("@")[0] || "-"
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
}
</style>
