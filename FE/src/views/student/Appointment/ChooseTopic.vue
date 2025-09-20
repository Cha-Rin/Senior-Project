<template>
  <div>
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
  <div class="min-h-screen flex flex-col items-center bg-white pt-20 px-4 py-2">
    <!-- 🔹 Headline -->
    <h1 class="text-2xl font-semibold mb-6">Choose Topic</h1>

    <!-- 🔹 Dropdown -->
    <select
  v-model="selectedTopic"
  class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-2 border border-gray-300 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-8">
  <option disabled value="">Choose Main-Topic</option>
  <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
    {{ cat.type }}
  </option>
</select>


    <!-- 🔹 Button -->
    <button
      @click="goNext"
      class="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
    >
      Next
    </button>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted  } from 'vue'
import { useRouter} from 'vue-router'
import Navbar from '@/components/student/Navbar.vue'
import girl from '@/assets/girl.png'
import boy from '@/assets/boy.png'
import unicorn from '@/assets/unicorn.png'
import user from '@/assets/user.png'
import { apiFetch } from '@/utils/api'

const router = useRouter()
const userId = localStorage.getItem('userId')
// 🔹 ตัวแปรที่ใช้กับ v-model และอื่นๆ
const selectedTopic = ref('')

const categories = ref([])

// 🔹 ดึงข้อมูลหมวดหมู่จาก API
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/categories')
    const data = await res.json()
    categories.value = data
    
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
})

const staffList = [
  { name: 'Porntip Panya', avatar: girl },
  { name: 'Somsak Kittisak', avatar: boy },
  { name: 'Money', avatar: unicorn },
  { name: 'user', avatar: user },
  
]



// 🔹 ไปหน้าถัดไปพร้อมส่ง query
function goNext() {
  if (!selectedTopic.value) {
    alert('Please select a topic first.')
    return
  }
  router.push({
    name: 'CreateAppointment',
    query: {
      category_id: selectedTopic.value,
      
    }
  })
}

// 🔹 กดเลือก staff (ถ้าใช้)
function chooseStaff(staff) {
  router.push({
    name: 'CreateAppointment',
    query: {
      name: staff.name,
      avatar: staff.avatar
    }
  })
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
