<!-- =======================================
📄 File: TopicChoose.vue
Version: ใช้งานได้สมบูรณ์ (Load category + staff name + upload)
======================================= -->

<template>
  <div class="min-h-screen bg-gray-50 pt-20 px-6">
    <!-- 🔹 หัวข้อหน้า -->
    <h1 class="text-2xl font-bold text-center mb-6">Choose Topic</h1>

    <!-- 🔹 โหลดข้อมูล -->
    <div v-if="loadingData" class="text-center text-gray-500">Loading topics...</div>

    <!-- 🔹 แสดงหัวข้อหลัก -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      <div
        v-for="cat in categories"
        :key="cat.category_id"
        @click="selectCategory(cat)"
        :class="[
          'p-4 rounded-xl border shadow-md cursor-pointer transition',
          selectedCategory?.category_id === cat.category_id
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 bg-white hover:shadow-lg'
        ]"
      >
        <p class="text-lg font-semibold text-gray-800">{{ cat.type }}</p>
        <p class="text-sm text-gray-500 mt-1">
          👩‍💼 {{ cat.staff_name || 'ยังไม่มีเจ้าหน้าที่' }}
        </p>
      </div>
    </div>

    <!-- ❗ Error Message -->
    <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>

    <!-- 🔹 ฟอร์มกรอกหัวข้อย่อย -->
    <div
      v-if="selectedCategory"
      class="bg-white w-full max-w-2xl mx-auto p-4 shadow-md rounded-xl transition-all duration-300"
    >
      <p class="text-sm font-semibold mb-2">
        พิมพ์หัวข้อย่อยของคุณ
        <span class="text-gray-400">(ตัวอย่างเช่น ลงทะเบียนเรียนเพิ่มเติม)</span>
      </p>
      <textarea
        v-model="subTopic"
        placeholder="เช่น ลงทะเบียนเรียนเพิ่มเติม"
        class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-blue-400"
        rows="3"
      ></textarea>

      <div class="text-center mt-4">
        <button
          @click="openCameraPopup"
          class="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>

    <!-- 🔸 Popup: ถ่ายรูป / อัปโหลด -->
    <div
      v-if="showCamera"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
        <h2 class="text-lg font-bold mb-4">📸 Upload your document photo</h2>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          @change="handleFile"
          class="mb-4"
        />

        <div v-if="previewUrl" class="mb-4">
          <img :src="previewUrl" class="w-full h-48 object-contain rounded-lg" />
        </div>

        <button
          @click="submitDocument"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          :disabled="loading"
        >
          {{ loading ? 'Uploading...' : 'Submit' }}
        </button>

        <button
          @click="showCamera = false"
          class="ml-3 text-gray-600 underline text-sm"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- 🔸 Popup: แสดง Document ID -->
    <div
      v-if="showDocId"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg text-center">
        <h2 class="text-xl font-bold text-green-700 mb-3">
          🎉 Document Created!
        </h2>
        <p class="text-lg">Your Document ID:</p>
        <p class="text-3xl font-bold text-blue-600 my-3">#{{ createdDocId }}</p>
        <p class="text-sm text-gray-600 mb-4">
          Please write this ID on your document form.
        </p>
        <button
          @click="closeDocIdPopup"
          class="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700"
        >
          OK
        </button>
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
const loadingData = ref(true)

// ✅ user info
const userId = localStorage.getItem('userId')
const email = localStorage.getItem('email')
const token = localStorage.getItem('authToken')

// ------------------------------------------
// 🔹 โหลดข้อมูลหมวดหมู่ + ชื่อพี่เลขา
// ------------------------------------------
onMounted(async () => {
  try {
    console.log('📩 Fetching categories with staff...')
    const res = await fetch('/api/student/categories-with-staff', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    console.log('✅ Response:', data)

    // รองรับทั้ง array หรือ { data: [...] }
    if (Array.isArray(data)) {
      categories.value = data
    } else if (data.data && Array.isArray(data.data)) {
      categories.value = data.data
    } else {
      categories.value = []
      console.warn('⚠️ Unexpected response format:', data)
    }

    if (categories.value.length === 0) {
      errorMessage.value = 'ไม่พบข้อมูลหัวข้อหรือเจ้าหน้าที่ในระบบ'
    }
  } catch (err) {
    console.error('❌ Error loading categories:', err)
    errorMessage.value = 'Failed to load topics. Please try again later.'
  } finally {
    loadingData.value = false
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
// 🔹 เปิด popup กล้อง / อัปโหลด
// ------------------------------------------
const openCameraPopup = () => {
  if (!subTopic.value.trim()) {
    errorMessage.value = 'กรุณาพิมพ์หัวข้อย่อยของคุณก่อนส่ง'
    return
  }
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
    const payload = {
      user_id: userId,
      category_id: selectedCategory.value.category_id,
      student_email: email,
      student_note: subTopic.value,
      status: 0, // Pending
      submit_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      finish_date: '',
    }

    const res = await fetch('/api/student/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!data.success) throw new Error('Create document failed')

    const docId = data.document_id
    const formData = new FormData()
    formData.append('photo', imageFile.value)
    formData.append('document_id', docId)

    await fetch('/api/student/upload-document-image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    showCamera.value = false
    createdDocId.value = docId
    showDocId.value = true
  } catch (err) {
    console.error('❌ Submit error:', err)
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
