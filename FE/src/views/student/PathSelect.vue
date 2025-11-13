<template>
  <div class="flex flex-col items-center justify-center min-h-screen space-y-6 bg-white px-4">
    <!-- Appointment Card -->
    <button
      class="w-64 h-28 bg-blue-900 text-white rounded-xl shadow-md text-lg font-semibold hover:bg-blue-800 transition"
      @click="goToAppointment"
    >
      Appointment
    </button>

    <!-- Document Tracking Card -->
    <button
      class="w-64 h-28 bg-blue-900 text-white rounded-xl shadow-md text-lg font-semibold hover:bg-blue-800 transition"
      @click="goToTracking"
    >
      Document Tracking
    </button>
      
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goToAppointment() {
  router.push('/student/appointment/topic')
}

function goToTracking() {
  router.push('/student/document/topictrack')
}
</script>

<!-- <script setup>
// import { useFeedbackGuard } from "@/stores/useFeedbackGuard";
import { useRouter } from "vue-router";

const router = useRouter();
const guard = useFeedbackGuard();

const enterAppointment = async () => {
  await guard.loadPending();   // โหลดข้อมูลค้างก่อน

  if (guard.mustFeedback) {
    router.push({ name: "FeedbackRequired" });
  } else {
    router.push({ name: "ChooseTopic" });  // เส้นทางนัดหมายจริง
  }
};

const enterDocument = async () => {
  await guard.loadPending();

  if (guard.mustFeedback) {
    router.push({ name: "FeedbackRequired" });
  } else {
    router.push({ name: "TopicTrack" });  // เส้นทางเอกสารจริง
  }
};
</script> -->

