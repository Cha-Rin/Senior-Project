<template>
  <div
    class="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-800 rounded transition"
    @click="handleClick"
  >
    <div class="flex items-center gap-3">
      <span class="text-xl">{{ icon }}</span>
      <span>{{ label }}</span>
    </div>

    <!-- 🔴 Badge แจ้งเตือน (ใช้เฉพาะบางเมนู เช่น Request Appointment) -->
    <span
      v-if="count && count > 0"
      class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-[1px]"
    >
      {{ count }}
    </span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  icon: String,
  label: String,
  to: String,
  count: { type: Number, default: 0 } // ✅ เพิ่ม property สำหรับ badge
})

const emit = defineEmits(['click'])
const router = useRouter()

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  } else if (props.label === 'Log out') {
    emit('click')
  }
}
</script>
