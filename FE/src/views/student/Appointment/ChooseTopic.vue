<!-- =======================================
📄 File: TopicChoose.vue
Version: เลือกหัวข้อ → กรอกหัวข้อย่อย → ส่ง → อัปโหลดรูป → แสดง doc ID
======================================= -->

<template>
  <div class="min-h-screen bg-gray-50 pt-20 px-6">
    <!-- 🔹 หัวข้อหน้า -->
    <h1 class="text-2xl font-bold text-center mb-6">Choose Topic</h1>

     <!-- 🔹 แสดงหัวข้อทั้งหมด -->
    <div
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center max-w-6xl mx-auto"
    >
      <div
        v-for="cat in categories"
        :key="cat.category_id"
        @click="goToStaffSchedule(cat)"
        class="p-5 rounded-xl border shadow-md bg-white cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all"
      >
        <p class="text-lg font-semibold text-gray-800">{{ cat.type }}</p>
        <p class="text-sm text-gray-500 mt-1 flex items-center">
          <span class="mr-1">👩‍💼</span> {{ cat.staff_name || 'Unknown Staff' }}
        </p>
      </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const selectedCategory = ref(null)
const subTopic = ref('')
const errorMessage = ref('')
const showCamera = ref(false)
const previewUrl = ref('')
const imageFile = ref(null)
const loading = ref(false)
const showDocId = ref(false)
const createdDocId = ref('')

// ✅ user info
const userId = localStorage.getItem('userId')
const email = localStorage.getItem('email')
const token = localStorage.getItem('authToken')

// ------------------------------------------
// 🔹 โหลดข้อมูลหมวดหมู่ + ชื่อพี่เลขา
// ------------------------------------------
onMounted(async () => {
  try {
    const res = await fetch('/api/student/categories-with-staff', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    categories.value = data
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Failed to load topics.'
  }
})

// ------------------------------------------
// 🔹 เลือกหัวข้อหลัก
// ------------------------------------------
const selectCategory = (cat) => {
  selectedCategory.value = cat
  errorMessage.value = ''
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

// ------------------------------------------
// 🔹 เมื่อคลิกหัวข้อ → ไปหน้าตารางนัดหมาย
// ------------------------------------------
const goToStaffSchedule = (cat) => {
  router.push({
    name: 'CreateAppointment', // ต้องมี route นี้ใน router/index.js
    query: {
      category_id: cat.category_id,
      staff_name: cat.staff_name,
      topic: cat.type,
    },
  })
}
// ------------------------------------------
// 🔹 เปิด popup กล้อง / อัปโหลด
// ------------------------------------------
const openCameraPopup = () => {
  if (!subTopic.value.trim())
    return (errorMessage.value = 'กรุณาพิมพ์หัวข้อย่อยของคุณก่อนส่ง')
  showCamera.value = true
  errorMessage.value = ''
}

// ------------------------------------------
// 🔹 handle file input
// ------------------------------------------
const handleFile = (e) => {
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

// ------------------------------------------
// 🔹 submit document + upload image
// ------------------------------------------
const submitDocument = async () => {
  if (!imageFile.value) return alert('Please upload a photo.')

  loading.value = true
  try {
    // 1️⃣ ส่งข้อมูลเอกสารไป backend
    const payload = {
      user_id: userId,
      category_id: selectedCategory.value.category_id,
      student_email: email,
      student_note: subTopic.value,
      status: 0, // Pending
      submit_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      finish_date: '',
    }

    const res = await fetch('/student/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!data.success) throw new Error('Create document failed')

    // 2️⃣ อัปโหลดรูป
    const docId = data.document_id
    const formData = new FormData()
    formData.append('photo', imageFile.value)
    formData.append('document_id', docId)

    await fetch('/student/upload-document-image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    // 3️⃣ แสดง doc ID
    loading.value = false
    showCamera.value = false
    createdDocId.value = docId
    showDocId.value = true
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Failed to submit document.'
  } finally {
    loading.value = false
  }
}

// ------------------------------------------
// 🔹 ปิด popup แสดง doc id
// ------------------------------------------
const closeDocIdPopup = () => {
  showDocId.value = false
  router.push({ path: '/student/document/check' })
}
</script>

<style scoped>
textarea {
  transition: border-color 0.2s, box-shadow 0.2s;
}
textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}
</style>
