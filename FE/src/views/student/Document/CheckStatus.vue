<template>
  <div>
    <div class="min-h-screen bg-white pt-20 px-4 flex flex-col items-center text-center">
      <h1 class="text-xl font-semibold mb-4">Check Status</h1>

      <!-- ✅ แสดงรายการเอกสาร -->
      <div v-if="paginatedDocuments.length > 0" class="w-full flex flex-col items-center">
        <div
          v-for="(doc, index) in paginatedDocuments"
          :key="index"
          class="bg-white shadow-md w-full max-w-sm p-4 rounded-xl text-left mb-6 space-y-2"
        >
          <div class="flex justify-between items-center text-sm">
            <p
              class="text-sm font-semibold"
              :class="{
                'text-yellow-600': doc.status == 0,
                'text-blue-600': doc.status == 1,
                'text-green-500': doc.status == 2,
                'text-red-500': doc.status == 3
              }"
            >
              {{ mapStatus(doc.status) }}
            </p>
          </div>

          <p class="text-sm">📅 Date: {{ formatDate(doc.submit_date) }}</p>
          <p class="text-sm">📂 Topic: {{ doc.doc_title }}</p>
          <p class="text-sm">📝 Note: {{ doc.student_note }}</p>

          <!-- 🖼️ ปุ่มดูรูป / ไฟล์แนบ -->
          <div v-if="doc.image_path" class="mt-2">
            <button
              @click="openImage(doc.image_path)"
              class="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
            >
              🖼️ ดูรูป / ไฟล์แนบ
            </button>
          </div>
        </div>

        <!-- ✅ Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center mt-6 space-x-1">
          <button
            v-if="currentPage > 1"
            @click="goToPage(currentPage - 1)"
            class="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
            หน้าก่อนหน้า
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded text-sm',
              page === currentPage
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            ]"
          >
            {{ page }}
          </button>

          <button
            v-if="currentPage < totalPages"
            @click="goToPage(currentPage + 1)"
            class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            หน้าถัดไป
          </button>
        </div>
      </div>

      <!-- ❌ ไม่มีข้อมูล -->
      <p v-else class="text-gray-500 mt-10">ไม่มีรายการเอกสารที่พบ</p>
    </div>

    <!-- 🧩 Popup Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div
        class="relative bg-white rounded-2xl p-4 shadow-2xl w-auto max-w-6xl max-h-[90vh] flex flex-col items-center"
      >
        <!-- ปุ่มปิด -->
        <button
          @click="closeModal"
          class="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-3xl font-bold"
        >
          ×
        </button>

        <!-- ✅ แสดงรูป -->
        <div
          v-if="isImage(selectedImage)"
          class="flex justify-center items-center w-full h-full overflow-auto"
        >
          <img
            :src="selectedImage"
            alt="Document Image"
            class="max-h-[80vh] max-w-full object-contain rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>

        <!-- ❗ ถ้าไม่ใช่รูป -->
        <div v-else class="text-center mt-6">
          <p class="text-gray-600 mb-3">ไม่ใช่ไฟล์ภาพ</p>
          <a
            :href="selectedImage"
            download
            target="_blank"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            📎 ดาวน์โหลดไฟล์แนบ
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const documents = ref([])

// ✅ Pagination
const currentPage = ref(1)
const itemsPerPage = 7

// ✅ Modal state
const showImageModal = ref(false)
const selectedImage = ref(null)

// ✅ โหลดข้อมูลจาก backend
onMounted(async () => {
  const userId = localStorage.getItem('userId')
  try {
    const res = await fetch(`/api/student/documents/${userId}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      documents.value = sortByLatestDate(data)
    } else if (data.success && Array.isArray(data.documents)) {
      documents.value = sortByLatestDate(data.documents)
    } else {
      documents.value = []
    }
  } catch (err) {
    console.error('❌ Failed to load documents:', err)
  }
})

// ✅ เรียงวันที่ใหม่ → เก่าสุด
function sortByLatestDate(arr) {
  return arr.sort((a, b) => new Date(b.submit_date) - new Date(a.submit_date))
}

// ✅ Pagination logic
const totalPages = computed(() => Math.ceil(documents.value.length / itemsPerPage))
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return documents.value.slice(start, end)
})
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ✅ Utility: แปลงวันที่
function formatDate(isoString) {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// ✅ แปลงสถานะเอกสาร
function mapStatus(code) {
  const c = parseInt(code)
  switch (c) {
    case 0:
      return 'Pending'
    case 1:
      return 'In progress'
    case 2:
      return 'Complete'
    case 3:
      return 'Reject'
    default:
      return 'ไม่ทราบสถานะ'
  }
}

// ✅ เปิดภาพใน Popup
function openImage(path) {
  if (!path) return
  const baseUrl = 'http://localhost:3000'

  // ✅ แปลง backslash (\) → forward slash (/)
  let cleanPath = path.replace(/\\/g, '/')

  // ✅ ถ้ามี 'uploads/documents/uploads/documents/' ซ้ำ ให้เหลือแค่ครั้งเดียว
  cleanPath = cleanPath.replace(/(uploads\/documents\/)+/, 'uploads/documents/')

  // ✅ ถ้ามี '/' ซ้ำข้างหน้าก็ตัดออกแค่ครั้งเดียว
  const fullUrl = `${baseUrl}/${cleanPath.replace(/^\/+/, '')}`

  console.log('🖼️ Final image URL:', fullUrl) // <— ช่วยตรวจสอบได้

  selectedImage.value = fullUrl
  showImageModal.value = true
}



// ✅ ปิด popup
function closeModal() {
  showImageModal.value = false
  selectedImage.value = null
}

// ✅ ตรวจว่าเป็นไฟล์ภาพไหม
function isImage(url) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}
</script>

<style scoped>
.fixed {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
