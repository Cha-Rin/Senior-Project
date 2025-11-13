<template>
  <div class="flex flex-col items-center justify-center min-h-screen space-y-6 bg-white px-4">
    <!-- Appointment Card -->
    <button
      class="w-64 h-28 bg-blue-900 text-white rounded-xl shadow-md text-lg font-semibold hover:bg-blue-800 transition"
      @click="enterAppointment"
    >
      Appointment
    </button>

    <button
      class="w-64 h-28 bg-blue-900 text-white rounded-xl shadow-md text-lg font-semibold hover:bg-blue-800 transition"
      @click="enterDocument"
    >
      Document Tracking
    </button>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFeedbackGuard } from "@/stores/useFeedbackGuard";

const router = useRouter();
const guard = useFeedbackGuard();

// ✅ โหลดใหม่ทุกครั้งที่เข้าหน้า PathSelect
onMounted(async () => {
  console.log('🔄 PathSelect mounted - reloading feedback...')
  await guard.forceReload()
  
  // ✅ ถ้ามี feedback ค้าง redirect ทันที
  if (guard.mustFeedback) {
    router.push({ name: 'FeedbackRequired' })
  }
})

const enterAppointment = async () => {
  await guard.forceReload() // โหลดใหม่อีกครั้งก่อนเข้า

  if (guard.mustFeedback) {
    router.push({ name: "FeedbackRequired" });
  } else {
    router.push({ name: "ChooseTopic" });
  }
};

const enterDocument = async () => {
  await guard.forceReload() // โหลดใหม่อีกครั้งก่อนเข้า

  if (guard.mustFeedback) {
    router.push({ name: "FeedbackRequired" });
  } else {
    router.push({ name: "TopicTrack" });
  }
};
</script>