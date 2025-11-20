<template>
  <div class="min-h-screen bg-gray-50 pt-20 px-6">
    <h1 class="text-2xl font-bold text-center mb-6">Choose Topic</h1>

    <!-- 🔹 แสดงเฉพาะหัวข้อแบบไม่ซ้ำ -->
    <div
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center max-w-6xl mx-auto"
    >
      <div
        v-for="cat in uniqueCategories"
        :key="cat.category_id"
        @click="goToStaffSchedule(cat)"
        class="p-5 rounded-xl border shadow-md bg-white cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all"
      >
        <p class="text-lg font-semibold text-gray-800">
          {{ cat.type }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const token = localStorage.getItem('authToken')

import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()



// const topicMapping = {
//   'กิจกรรมนักศึกษา': 'Student Activities',
//   'งานทะเบียน': 'Registrar Office',
//   'สหกิจศึกษา': 'Cooperative Education',
//   'บัณฑิตศึกษา': 'Graduate Studies',
//   'ผ่อนผัน': 'Deferment'
//   // ใส่เพิ่มตามที่มีใน DB
// }

// // 3. ฟังก์ชันสำหรับเลือกภาษาที่จะแสดง
// const getTopicName = (text) => {
//   if (locale.value === 'en') {
//     // ถ้าเป็น EN ให้ไปหาคำแปลมาแสดง ถ้าหาไม่เจอให้ใช้คำเดิม
//     return topicMapping[text] || text
//   }
//   // ถ้าเป็น TH ก็ส่งค่าเดิมกลับไป
//   return text
// }


// ------------------------------------------
// 🔹 โหลดข้อมูลหัวข้อทั้งหมด + พี่เลขา (อาจมีหลายคน)
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
  }
})


// ------------------------------------------
// 🔥 ทำให้หัวข้อ UNIQUE ตาม category_id
// เช่น หัวข้อเดียวกันมีเลขา 2 คน → ยังเหลือแค่ 1 การ์ด
// ------------------------------------------
const uniqueCategories = computed(() => {
  const map = new Map()
  categories.value.forEach(cat => {
    if (!map.has(cat.category_id)) {
      map.set(cat.category_id, cat)
    }
  })
  return Array.from(map.values())
})


// ------------------------------------------
// 🔹 เมื่อเลือกหัวข้อ → ไประบุเลขา + ตารางนัดหมายในหน้าถัดไป
// ------------------------------------------
const goToStaffSchedule = (cat) => {
  router.push({
    name: 'CreateAppointment',
    query: {
      category_id: cat.category_id,
      topic: cat.type,  // ส่งเฉพาะหัวข้อ
    },
  })
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
