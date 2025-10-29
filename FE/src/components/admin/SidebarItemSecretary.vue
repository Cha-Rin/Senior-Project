<!-- 📁 src/components/secretary/SidebarItemSecretary.vue -->
<template>
  <div class="flex items-center space-x-3 p-2 cursor-pointer hover:bg-blue-800 rounded">
    <component :is="resolveIcon(icon)" class="w-5 h-5" />
    <span @click="handleClick">{{ label }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  icon: String,
  label: String,
  to: [String, Object]
})

const router = useRouter()

const resolveIcon = (iconName) => {
  // ใช้ไอคอนพื้นฐานแทน หรือ import ไอคอนจริง
  return 'span' // หรือใช้ไอคอนจริงจากไลบรารี
}

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  } else if (props.label === 'Log out') {
    // ปล่อยให้ parent จัดการ
    emit('click')
  }
}

const emit = defineEmits(['click'])
</script>