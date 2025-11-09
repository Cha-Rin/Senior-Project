<template>
  <div>
    <div class="min-h-screen bg-white pt-20 px-4 flex flex-col items-center text-center">
      <h1 class="text-xl font-semibold mb-4">Check Status</h1>

      <!-- ✅ มีข้อมูล -->
      <div v-if="paginatedDocuments.length > 0" class="w-full flex flex-col items-center">
        <div
          v-for="(doc, index) in paginatedDocuments"
          :key="index"
          class="bg-white shadow-md w-full max-w-sm p-4 rounded-xl text-left mb-6 space-y-2"
        >
          <div class="flex justify-between items-center text-sm">
            <p><strong>D00{{ (currentPage - 1) * itemsPerPage + index + 1 }}</strong></p>
            <p
              class="text-sm font-semibold"
              :class="{
                'text-yellow-600': doc.status == 0,
                'text-green-600': doc.status == 1,
                'text-red-500': doc.status == 2
              }"
            >
              {{ mapStatus(doc.status) }}
            </p>
          </div>
          <p class="text-sm">📅 Date: {{ formatDate(doc.submit_date) }}</p>
          <p class="text-sm">📂 Topic: {{ doc.doc_title }}</p>
          <p class="text-sm">📝 Note: {{ doc.student_note }}</p>
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

      <!-- ✅ ไม่มีข้อมูล -->
      <p v-else class="text-gray-500 mt-10">ไม่มีรายการเอกสารที่พบ</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const token = localStorage.getItem('token')
const documents = ref([])

// ✅ Pagination states
const currentPage = ref(1)
const itemsPerPage = 7

// ✅ โหลดข้อมูลจาก backend
onMounted(async () => {
  const userId = localStorage.getItem('userId')
  console.log('📦 Loaded userId:', userId)
  try {
    const res = await fetch(`/api/student/api/documents/${userId}`)
    const data = await res.json()

    if (Array.isArray(data)) {
      documents.value = sortByLatestDate(data)
    } else if (data.success && Array.isArray(data.documents)) {
      documents.value = sortByLatestDate(data.documents)
    } else {
      documents.value = []
      console.warn('❗ No documents found for ID:', userId)
    }
  } catch (err) {
    console.error('❌ Failed to load documents:', err)
    documents.value = []
  }
})

// ✅ เรียงจากวันล่าสุด → เก่าสุด
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

// ✅ Utility: แปลงวันที่ให้อ่านง่าย
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
      return 'รอดำเนินการ'
    case 1:
      return 'อนุมัติ'
    case 2:
      return 'ปฏิเสธ'
    default:
      return 'ไม่ทราบสถานะ'
  }
}
</script>
