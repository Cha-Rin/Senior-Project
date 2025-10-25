<!-- ✅ StaffCard.vue -->
<template>
  <div
    class="flex items-center p-3 bg-gray-100 rounded shadow cursor-pointer hover:bg-gray-200"
    @click="goToDetail"
  >
    <img
      :src="avatar"
      class="w-20 h-20 rounded-full mr-4 object-cover"
      alt="avatar"
    />
    <div>
      <h3 class="font-bold">{{ name }}</h3>
      <p class="text-yellow-600">⭐ {{ rating.toFixed(2) }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  id: [String, Number],
  name: String,
  avatar: String,
  rating: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

// ✅ ใช้ route name ให้ตรงกับ router ของ admin (/admin/staff-rating/:id)
const goToDetail = () => {
  router.push({
    name: 'StaffRatingView',
    params: { id: props.id },
    query: {
      name: props.name,
      avatar: props.avatar
    }
  })
}
</script>
