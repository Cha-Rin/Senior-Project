<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8"
  >
    <div
      class="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md animate-fade-in"
    >
      <!-- Title -->
      <h1 class="text-2xl font-extrabold text-red-600 mb-4">
        Please provide feedback first.
      </h1>

      <!-- Description -->
      <p class="text-gray-700 text-base mb-6 leading-relaxed">
        The system detected that you have uncompleted assessments.<br />
        Please complete this first to use other features.
      </p>

      <!-- Button: ไปทำฟีดแบ็ค -->
      <button
        class="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl w-full font-semibold transition"
        @click="goFeedback"
      >
        Go do some feedback.
      </button>

      

      <!-- ✅ เพิ่มปุ่ม Logout -->
      <button
        class="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl w-full transition"
        @click="handleLogout"
      >
        Log out
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useFeedbackGuard } from "@/stores/useFeedbackGuard";

const router = useRouter();
const guard = useFeedbackGuard();

// ⭐ ไปหน้า Feedback
const goFeedback = () => {
  router.push({ name: "Feedback" });  // ⬅️ ตรงนี้ต้อง redirect ไป StudentFeedbackPage
};

// ⭐ กลับหน้า PathSelect (ถูก redirect กลับมาอีกถ้ายังมี feedback ค้าง)
const goBack = () => {
  router.push({ name: "PathSelect" });
};

// ✅ Logout
const handleLogout = () => {
  if (confirm('Log out?')) {
    guard.logout();
    router.push({ name: 'Login' });
  }
};
</script>

<style scoped>
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