<template>
  <div class="relative">
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
  
  <div class="min-h-screen flex flex-col items-center bg-white pt-20 px-4">
    
    <!-- 🔹 Headline -->
    <h1 class="text-2xl font-semibold mb-6">Choose Topic</h1>

    <!-- 🔹 Dropdown -->
    <select
  v-model="selectedCategoryId"
  class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-2 border border-gray-300 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-8">
  <option disabled value="">Choose Main-Topic</option>
  <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
    {{ cat.type }}
  </option>
</select>

    <!-- 🔹 Document Name Textarea -->
    <div class="bg-white w-full p-4 shadow-md rounded-xl text-left mt-8 space-y-2">
      <p class="text-sm font-semibold">Type document name</p>
      <textarea
        v-model="note"
        placeholder="Comment..."
        class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
        rows="3"
      ></textarea>
    </div>

    <!-- 🔹 Button -->
    <button
      @click="goNext"
      class="bg-blue-600 text-white font-semibold mt-4 px-6 py-2 rounded-full hover:bg-blue-700 transition"
    >
      Send
    </button>
    
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from "@/components/student/NavbarDoc.vue";
import girl from '@/assets/girl.png'
import boy from '@/assets/boy.png'
import unicorn from '@/assets/unicorn.png'

const token = localStorage.getItem("token");
const router = useRouter()
const categories = ref([])
const note = ref('')
const selectedCategoryId = ref('')

const staffList = [
  { name: 'Porntip Panya', avatar: girl },
  { name: 'Somsak Kittisak', avatar: boy },
  { name: 'Money', avatar: unicorn }
]

const studentEmail = ref('')
const studentNote = ref('')
const submitDate = ref(new Date().toISOString().split('T')[0]) // yyyy-mm-dd
const finishDate = ref('') 
const status = ref('Pending')
const errorMessage = ref('')

const sidebarOpen = ref(false)

// 🔹 ดึงข้อมูลหมวดหมู่จาก API
onMounted(async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      errorMessage.value = 'Please login again.'
      router.push('/login')
      return
    }

    const res = await fetch('http://localhost:3000/api/categories', {
      headers: {
        Authorization: `Bearer ${token}` // ✅ ส่ง token ไปด้วย
      }
    })
    const data = await res.json()
    categories.value = data
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
})

const goNext = async () => {
  try {
    const token = localStorage.getItem('authToken')

    if (!token) {
      console.warn('❗ Token not found in localStorage')
      errorMessage.value = 'Please login again.'
      router.push('/login')
      return
    }
    if (!selectedCategoryId.value) {
      errorMessage.value = 'Please select a topic.'
      return
    }

    const res = await fetch('http://localhost:3000/student/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ✅ แนบ token
      },
      body: JSON.stringify({
        category_id: selectedCategoryId.value,
        student_email: studentEmail.value,
        submit_date: submitDate.value,
        finish_date: finishDate.value,
        student_note: note.value,
        status: 'pending'
      })
    })

    const data = await res.json()

    if (data.success) {
      console.log('✅ Document request submitted:', data)
      router.push({
        path: 'check',
        query: {
          topic: selectedCategoryId.value,
          date: submitDate.value,
          status: 'Pending'
        }
      })
    } else {
      throw new Error(data.error || 'Unknown error')
    }
  } catch (err) {
    console.error('❌ API Error:', err)
    errorMessage.value = 'Failed to submit request. Please try again.'
  }
}
</script>

<style scoped>
/* Optional: force mobile max width */
@media (min-width: 768px) {
  .max-w-xs {
    max-width: 300px;
  }
}
</style>

