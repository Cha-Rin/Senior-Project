<template>
  <div>
    <!-- Tabs -->
    <div class="flex gap-4 mb-6">
      <button
        class="px-4 py-2 rounded-t-lg"
        :class="activeTab === 'appointment' ? 'bg-purple-500 text-white' : 'bg-gray-200'"
        @click="activeTab = 'appointment'"
      >
        Appointment
      </button>
      <button
        class="px-4 py-2 rounded-t-lg"
        :class="activeTab === 'document' ? 'bg-purple-500 text-white' : 'bg-gray-200'"
        @click="activeTab = 'document'"
      >
        Document Tracking
      </button>
    </div>

    <!-- Content -->
    <div class="bg-purple-100 rounded-lg p-6 flex flex-col gap-6 md:flex-row">
      <div class="flex-1 space-y-4">
        <h2 class="text-2xl font-bold">
          {{ averageRating.toFixed(1) }} ★★★★★
        </h2>
        <RatingBarChart :ratings="ratings" />
      </div>

      <div class="w-full md:w-1/2 bg-white rounded shadow p-4 h-64 overflow-y-auto">
        <RatingCommentList :comments="comments" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RatingBarChart from './RatingBarChart.vue'
import RatingCommentList from './RatingCommentList.vue'

const activeTab = ref('appointment')

const ratingData = {
  appointment: {
    ratings: [3, 4, 2],
    comments: [
      { name: 'Student A', stars: 4, text: 'Helpful and friendly.' },
      { name: 'Student B', stars: 5, text: 'Very good experience.' },
      { name: 'Student C', stars: 2, text: 'Slow response.' }
    ]
  },
  document: {
    ratings: [4, 4, 4],
    comments: [
      { name: 'Student D', stars: 5, text: 'Perfect service.' },
      { name: 'Student E', stars: 3, text: 'Average support.' }
    ]
  }
}

const ratings = computed(() => ratingData[activeTab.value].ratings)
const comments = computed(() => ratingData[activeTab.value].comments)
const averageRating = computed(() =>
  ratings.value.reduce((a, b) => a + b, 0) / ratings.value.length
)
</script>
