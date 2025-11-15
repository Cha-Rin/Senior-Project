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
        <p class="text-sm text-gray-500 mt-1">👩‍💼 {{ cat.staff_name || 'ยังไม่มีเจ้าหน้าที่' }}</p>
      </div>
    </div>

    <!-- ❗ Error -->
    <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>

    <!-- 🔹 ฟอร์มกรอกหัวข้อย่อย -->
    <div
      v-if="selectedCategory"
      class="bg-white w-full max-w-2xl mx-auto p-4 shadow-md rounded-xl transition-all duration-300"
    >
      <p class="text-sm font-semibold mb-2">
        พิมพ์หัวข้อย่อยของคุณ
        <span class="text-gray-400">(เช่น ลงทะเบียนเรียนเพิ่มเติม)</span>
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

    <!-- 🔸 Popup กล้อง -->
    <div
      v-if="showCamera"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg w-[380px] text-center">
        <h2 class="text-lg font-bold mb-4">📸 Take a Photo of Your Document</h2>

        <!-- ✅ แสดงกล้อง -->
       <!-- กล้อง + ตัวอย่าง -->
<div v-if="!capturedImage" class="flex flex-col items-center">

  <!-- วิดีโอ -->
  <video
    ref="videoRef"
    autoplay
    playsinline
    class="rounded-lg w-full h-64 object-cover mb-3"
  ></video>

  <!-- ตัวอย่างภาพ -->
  <div class="w-full mb-4">
    <p class="text-sm font-semibold text-gray-600 mb-1 text-left">
      📌 Example (ตัวอย่างภาพที่ถูกต้อง)
    </p>
    <img
      src="/src/assets/image (1).png"
      class="w-full h-40 object-contain rounded-lg border"
      alt="Document Example"
    />
  </div>

  <!-- ปุ่มถ่ายรูป (ย้ายออกมาแล้ว) -->
  <button
    @click="capturePhoto"
    class="bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700"
  >
    📷 Capture
  </button>

</div>


        <!-- ✅ แสดงภาพหลังถ่าย -->
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

        <button
          @click="closeCamera"
          class="mt-4 text-gray-500 underline text-sm"
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
        <h2 class="text-xl font-bold text-green-700 mb-3">🎉 Document Created!</h2>
        <p class="text-lg">Your Document ID:</p>
        <p class="text-3xl font-bold text-blue-600 my-3">#{{ createdDocId }}</p>
        <p class="text-sm text-gray-600 mb-4">Please write this ID on your document form.</p>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const categories = ref([])
const selectedCategory = ref(null)
const subTopic = ref('')
const errorMessage = ref('')
const loadingData = ref(true)

// Camera
const showCamera = ref(false)
const videoRef = ref(null)
const capturedImage = ref(null)
const stream = ref(null)
const loading = ref(false)

// Document result
const showDocId = ref(false)
const createdDocId = ref('')

// User info
const userId = localStorage.getItem('userId')
const email = localStorage.getItem('email')
const token = localStorage.getItem('authToken')

// ✅ โหลดหัวข้อและพี่เลขา
onMounted(async () => {
  try {
    const res = await fetch('/api/student/categories-with-staff', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    categories.value = Array.isArray(data) ? data : data.data || []
  } catch (err) {
    errorMessage.value = 'Failed to load topics.'
  } finally {
    loadingData.value = false
  }
})

// 🔹 เลือกหัวข้อ
const selectCategory = (cat) => {
  selectedCategory.value = cat
  errorMessage.value = ''
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

// 🔹 เปิดกล้อง
// const openCameraPopup = async () => {
//   if (!subTopic.value.trim()) {
//     errorMessage.value = 'กรุณาพิมพ์หัวข้อย่อยก่อนส่ง'
//     return
//   }
//   try {
//     showCamera.value = true
//     const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
//     stream.value = s
//     videoRef.value.srcObject = s
//   } catch (err) {
//     console.error('🚫 Cannot access camera:', err)
//     alert('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง')
//     showCamera.value = false
//   }
// }





const openCameraPopup = async () => {
  if (!subTopic.value.trim()) {
    errorMessage.value = 'กรุณาพิมพ์หัวข้อย่อยก่อนส่ง'
    return
  }

  try {
    const formData = new FormData()
    formData.append('user_id', userId)
    formData.append('category_id', selectedCategory.value.category_id)
    formData.append('student_email', email)
    formData.append('student_note', subTopic.value)
    formData.append('status', 0)
    formData.append('submit_date', new Date().toISOString().slice(0, 19).replace('T', ' '))

    const res = await fetch('/api/student/documents/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const data = await res.json()
    if (!data.success) throw new Error('Create document failed')

    createdDocId.value = data.document_id
    showDocId.value = true

  } catch (err) {
    console.error(err)
    alert('สร้างเอกสารไม่สำเร็จ')
  }
}


const closeDocIdPopup = async () => {
  showDocId.value = false

  try {
    showCamera.value = true
    const s = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.value = s
    videoRef.value.srcObject = s
  } catch (err) {
    alert('ไม่สามารถเปิดกล้องได้')
  }
}



const submitDocument = async () => {
  if (!capturedImage.value) return alert('กรุณาถ่ายภาพก่อนส่ง')
  loading.value = true

  try {
    const blob = await (await fetch(capturedImage.value)).blob()
    const file = new File([blob], 'document.jpg', { type: 'image/jpeg' })

    const formData = new FormData()
    formData.append('document_id', createdDocId.value)
    formData.append('photo', file)

    const res = await fetch('/api/student/documents/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const data = await res.json()
    if (!data.success) throw new Error('Upload failed')

    alert('อัปโหลดสำเร็จ!')
    router.push('/student/document/check')

  } catch (err) {
    console.error(err)
    alert('อัปโหลดไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}



// 🔹 ถ่ายภาพ
const capturePhoto = () => {
  const video = videoRef.value
  if (!video) return
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  capturedImage.value = canvas.toDataURL('image/jpeg')
  stopCamera()
}

// 🔹 ปิดกล้อง
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
}

// 🔹 ถ่ายใหม่
const retakePhoto = () => {
  capturedImage.value = null
  openCameraPopup()
}

// 🔹 ปิด popup
const closeCamera = () => {
  stopCamera()
  showCamera.value = false
  capturedImage.value = null
}

// 🔹 ส่งเอกสาร
// const submitDocument = async () => {
//   if (!capturedImage.value) return alert('กรุณาถ่ายภาพก่อนส่ง')
//   loading.value = true
//   try {
//     // แปลง base64 → file
//     const blob = await (await fetch(capturedImage.value)).blob()
//     const file = new File([blob], 'document.jpg', { type: 'image/jpeg' })

//     const formData = new FormData()
//     formData.append('photo', file)
//     formData.append('user_id', userId)
//     formData.append('category_id', selectedCategory.value.category_id)
//     formData.append('student_email', email)
//     formData.append('student_note', subTopic.value)
//     formData.append('status', 0)
//     formData.append('submit_date', new Date().toISOString().slice(0, 19).replace('T', ' '))
//     formData.append('finish_date', '')

//     const res = await fetch('/api/student/documents', {
//       method: 'POST',
//       headers: { Authorization: `Bearer ${token}` },
//       body: formData,
//     })

//     const data = await res.json()
//     if (!data.success) throw new Error('Create document failed')

//     createdDocId.value = data.document_id
//     showCamera.value = false
//     showDocId.value = true
//   } catch (err) {
//     console.error('❌ Submit error:', err)
//     alert('อัปโหลดไม่สำเร็จ กรุณาลองใหม่')
//   } finally {
//     loading.value = false
//   }
// }

// 🔹 ปิด popup Document ID
// const closeDocIdPopup = () => {
//   showDocId.value = false
//   router.push({ path: '/student/document/check' })
// }

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
