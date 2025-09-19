<template>
  <div>
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <div class="min-h-screen bg-white pt-20 px-4 flex flex-col items-center text-center">
      <h1 class="text-xl font-semibold mb-4">Check Status</h1>

      <div v-if="documents.length > 0">
        <div
          v-for="(doc, index) in documents"
          :key="index"
          class="bg-white shadow-md w-full max-w-sm p-4 rounded-xl text-left mb-6 space-y-2"
        >
          <div class="flex justify-between items-center text-sm">
            <p><strong>D00{{ index + 1 }}</strong></p>
            <p class="text-sm text-green-600">{{ mapStatus(doc.status) }}</p>
          </div>
          <p class="text-sm">Date: {{ formatDate(doc.submit_date) }}</p>
          <p class="text-sm">Topic: {{ doc.doc_title }}</p>
          <p class="text-sm">Name: {{ doc.student_note }}</p>
        </div>
      </div>

      <p v-else class="text-gray-500">ไม่มีรายการเอกสารที่พบ</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from "@/components/student/NavbarDoc.vue";

const route = useRoute()
const router = useRouter()
const token = localStorage.getItem("token");
const documents = ref([])
// const docId = ref('A001')
// const selectedTopic = ref('')
// const topic = ref('')
// const date = ref('')
// const status = ref('')

onMounted(async () => {
const userId = localStorage.getItem('userId')
  console.log('📦 Loaded userId:', userId)
  try {
    const res = await fetch(`http://localhost:3000/student/api/documents/${userId}`)
    const data = await res.json()

    if (Array.isArray(data)) {
      documents.value = data
    } else if (data.success && Array.isArray(data.documents)) {
      documents.value = data.documents
    } else {
      documents.value = []
      console.warn('❗ No documents found for ID:', userId)
    }
  } catch (err) {
    console.error('❌ Failed to load documents:', err)
    documents.value = []
  }
})


function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
}

function mapStatus(code) {
  const c = parseInt(code)
  switch (c) {
    case 0: return 'รอดำเนินการ'
    case 1: return 'อนุมัติ'
    case 2: return 'ปฏิเสธ'
    default: return 'ไม่ทราบสถานะ'
  }
}




</script>
