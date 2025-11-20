<template>
  <div class="min-h-screen bg-gray-50 pt-20 px-6">
    <h1 class="text-2xl font-bold text-center mb-6">{{ $t('choose_topic') }}</h1>

    <!-- Loading -->
    <div v-if="loadingData" class="text-center text-gray-500">Loading topics...</div>

    <!-- Unique Categories -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      <div
        v-for="cat in uniqueCategories"
        :key="cat.category_id"
        @click="selectCategory(cat)"
        :class="[
          'p-4 rounded-xl border shadow-md cursor-pointer transition',
          selectedCategory?.category_id === cat.category_id
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 bg-white hover:shadow-lg'
        ]"
      >
        <p class="text-lg font-semibold text-gray-800">{{ translateCategory(cat.type) }}</p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>

    <!-- Subtopic input -->
    <div 
      v-if="selectedCategory" 
      class="bg-white w-full max-w-2xl mx-auto p-4 shadow-md rounded-xl transition-all duration-300"
    >
     <p class="text-sm font-semibold mb-2">
  {{ $t('sub_topic_title') }}
  <span class="text-gray-400">({{ $t('sub_topic_example') }})</span>
</p>

      <textarea
        v-model="subTopic"
        class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-blue-400"
        rows="3"
        :placeholder="$t('sub_topic_example')"
      ></textarea>

      <div class="text-center mt-4">
        <button
          @click="openCameraPopup"
          class="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          {{ $t('send_btn') }}
        </button>
      </div>
    </div>

    <!-- Camera Popup -->
    <div
      v-if="showCamera"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg w-[380px] text-center">
        <h2 class="text-lg font-bold mb-4">📸 Take a Photo of Your Document</h2>

        <!-- Camera -->
        <div v-if="!capturedImage" class="flex flex-col items-center">
          <video ref="videoRef" autoplay playsinline class="rounded-lg w-full h-64 object-cover mb-3"></video>

          <div class="w-full mb-4">
            <p class="text-sm font-semibold text-gray-600 mb-1 text-left">📌 Example</p>
            <img src="/src/assets/image (1).png" class="w-full h-40 object-contain rounded-lg border" />
          </div>

          <button
            @click="capturePhoto"
            class="bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700"
          >
            📷 Capture
          </button>
        </div>

        <!-- Preview -->
        <div v-else class="flex flex-col items-center">
          <img :src="capturedImage" class="w-full h-64 object-contain rounded-lg mb-3" />

          <div class="space-x-2">
            <button
              @click="submitDocument"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              :disabled="loading"
            >
              {{ loading ? 'Uploading...' : 'Submit' }}
            </button>

            <button
              @click="retakePhoto"
              class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Retake
            </button>
          </div>
        </div>

        <button @click="closeCamera" class="mt-4 text-gray-500 underline text-sm">Cancel</button>
      </div>
    </div>

    <!-- Document ID Popup -->
    <div
      v-if="showDocId"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg text-center">
        <h2 class="text-xl font-bold text-green-700 mb-3">🎉 Document Created!</h2>
        <p class="text-lg">Your Document ID:</p>

        <p class="text-3xl font-bold text-blue-600 my-3">#{{ createdDocCode }}</p>

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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const categories = ref([])
const selectedCategory = ref(null)
const subTopic = ref('')
const loadingData = ref(true)
const errorMessage = ref('')

// Camera
const showCamera = ref(false)
const videoRef = ref(null)
const capturedImage = ref(null)
const stream = ref(null)
const loading = ref(false)

const showDocId = ref(false)
const createdDocCode = ref("")
const createdDocId = ref("")

const userId = localStorage.getItem('userId')
const email = localStorage.getItem('email')
const token = localStorage.getItem('authToken')

// ⭐ ใช้ i18n
import { useI18n } from "vue-i18n"
const { locale } = useI18n()

const categoryNameMap = {
  "กิจกรรมนักศึกษา": { th: "กิจกรรมนักศึกษา", en: "Student Activities" },
  "สหกิจศึกษา": { th: "สหกิจศึกษา", en: "Cooperative Education" },
  "ผ่อนผัน": { th: "ผ่อนผัน", en: "Permission / Deferment" },
  "งานทะเบียน": { th: "งานทะเบียน", en: "Registration Office" },
  "บัณฑิตศึกษา": { th: "บัณฑิตศึกษา", en: "Graduate Studies" }
}

const translateCategory = (name) => {
  if (!categoryNameMap[name]) return name
  return categoryNameMap[name][locale.value] || name
}


// Unique Categories
const uniqueCategories = computed(() => {
  const map = new Map()
  categories.value.forEach(c => {
    if (!map.has(c.category_id)) map.set(c.category_id, c)
  })
  return Array.from(map.values())
})

// Load data
onMounted(async () => {
  try {
    const res = await fetch('/api/student/categories-with-staff', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    categories.value = Array.isArray(data) ? data : data.data || []
  } catch {
    errorMessage.value = 'Failed to load topics.'
  } finally {
    loadingData.value = false
  }
})

const selectCategory = (cat) => {
  selectedCategory.value = cat
  errorMessage.value = ''
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

// Create Document (before camera)
const openCameraPopup = async () => {
  if (!subTopic.value.trim()) {
    errorMessage.value = 'กรุณาพิมพ์หัวข้อย่อยก่อนส่ง'
    return
  }

  try {
    const form = new FormData()
    form.append('user_id', selectedCategory.value.user_id) //form.append('user_id', userId)
    form.append('category_id', selectedCategory.value.category_id)
    form.append('student_email', email)
    form.append('student_note', subTopic.value)
    form.append('status', 0)
    form.append('submit_date', new Date().toISOString().slice(0, 19).replace('T',' '))

    const res = await fetch('/api/student/documents/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    })

    const data = await res.json()
    if (!data.success) throw new Error()

    createdDocId.value = data.document_id
    createdDocCode.value = data.document_code
    showDocId.value = true
  } catch {
    alert("สร้างเอกสารไม่สำเร็จ")
  }
}

const closeDocIdPopup = async () => {
  showDocId.value = false
  try {
    showCamera.value = true
    const s = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.value.srcObject = s
    stream.value = s
  } catch {
    alert("ไม่สามารถเปิดกล้องได้")
  }
}

const capturePhoto = () => {
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext("2d")
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  capturedImage.value = canvas.toDataURL("image/jpeg")
  stopCamera()
}

const submitDocument = async () => {
  if (!capturedImage.value) return alert("กรุณาถ่ายภาพก่อนส่ง")
  loading.value = true

  try {
    const blob = await (await fetch(capturedImage.value)).blob()
    const file = new File([blob], "document.jpg", { type: "image/jpeg" })

    const form = new FormData()
    form.append("document_id", createdDocId.value)
    form.append("photo", file)

    const res = await fetch("/api/student/documents/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    })

    const data = await res.json()
    if (!data.success) throw new Error()

    alert("อัปโหลดสำเร็จ!")

        // ⭐⭐ RESET STATE เพื่อไม่ให้ค่าค้าง ⭐⭐
    selectedCategory.value = null
    subTopic.value = ''
    capturedImage.value = null
    showCamera.value = false
    showDocId.value = false

    // 🟢 ปิดกล้อง + ปิด popup + reset state
    stopCamera()
    showCamera.value = false
    capturedImage.value = null

    // 🟢 กลับหน้าเลือกหัวข้อเอกสาร
    router.push('/student/document/topictrack')

  } catch (err) {
    alert("อัปโหลดไม่สำเร็จ")
  } finally {
    loading.value = false
  }
}


const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
}

const retakePhoto = () => {
  capturedImage.value = null
  openCameraPopup()
}

const closeCamera = () => {
  stopCamera()
  showCamera.value = false
  capturedImage.value = null
}

onUnmounted(() => stopCamera())
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
