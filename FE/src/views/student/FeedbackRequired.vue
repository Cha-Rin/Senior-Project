<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8"
  >
    <div
      class="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md animate-fade-in"
    >
      <!-- Title -->
      <h1 class="text-2xl font-extrabold text-red-600 mb-4">
        กรุณาทำฟีดแบ็คก่อน
      </h1>

      <!-- Description -->
      <p class="text-gray-700 text-base mb-6 leading-relaxed">
        ระบบตรวจพบว่าคุณมีแบบประเมินที่ยังไม่ได้ทำ<br />
        กรุณาทำให้เสร็จสิ้นก่อนเพื่อใช้งานฟีเจอร์อื่น ๆ
      </p>

      <!-- Button: ไปทำฟีดแบ็ค -->
      <button
        class="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl w-full font-semibold transition"
        @click="goFeedback"
      >
        ไปทำฟีดแบ็ค
      </button>

      <!-- Optional: ปุ่มกลับหน้าเลือก path -->
      <button
        class="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl w-full transition"
        @click="goBack"
      >
        กลับหน้าเลือกเส้นทาง
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// ⭐ ไปหน้า Feedback (ดีกว่าใช้ path ตรง ๆ)
const goFeedback = () => {
  router.push({ name: "Feedback" });
};

// ⭐ ปุ่มกลับ (กลับไปหน้า PathSelect)
const goBack = () => {
  router.push({ name: "PathSelect" });
};
</script>

<style scoped>
/* Animation loading page */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
