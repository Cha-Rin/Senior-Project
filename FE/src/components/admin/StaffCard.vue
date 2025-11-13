<template>
  <div
    class="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition"
  >
    <div class="flex items-center gap-3">
      <!-- 🔹 รูปโปรไฟล์ -->
      <img
        :src="avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'"
        alt="avatar"
        class="w-12 h-12 rounded-full border object-cover"
      />
      <!-- 🔹 ข้อมูล Staff -->
      <div>
        <h3 class="font-semibold text-gray-800 text-sm">
          {{ name || 'ไม่ระบุชื่อ' }}
        </h3>
        <p class="text-xs text-gray-500">{{ category || 'ไม่มีหมวดหมู่' }}</p>

        <!-- 🔹 คะแนน -->
        <div class="flex items-center gap-1 text-yellow-500 text-xs mt-1">
          <span>⭐</span>
          <span>{{ rating ?? 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 🔹 ปุ่มไปหน้า rating -->
    <RouterLink
      :to="`/admin/staff-rating/${id}`"
      class="text-blue-500 text-xs hover:underline"
    >
      ดูรายละเอียด
    </RouterLink>
  </div>
</template>

<script setup>

defineProps({
  id: [String, Number],
  name: String,
  avatar: String,
  rating: Number,
  category: String
})

</script>
