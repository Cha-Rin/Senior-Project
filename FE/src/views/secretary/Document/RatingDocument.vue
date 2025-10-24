<!-- 📁 src/views/secretary/RatingAppointment.vue -->
<template>
  <SecreLayout>
    <div class="page-content">
      <!-- Header แบบภาพแรก -->
      <div class="header-bar">
        <div class="user-info">
          <img src="@/assets/P_Aoi.png" alt="User Avatar" class="avatar" />
          <div class="user-name">
            <span>Name</span>
            <strong>Porntip Panya</strong>
          </div>
        </div>

        <div class="filters">
          <select v-model="selectedSemester" class="filter-select">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <select v-model="selectedYear" class="filter-select">
            <option value="2568">2568</option>
            <option value="2567">2567</option>
            <option value="2566">2566</option>
          </select>
        </div>
      </div>

      <!-- Main Card แบบภาพแรก -->
      <div class="rating-card">
        <!-- Overall Rating -->
        <div class="overall-rating">
          <span class="score">3.9</span>
          <div class="stars">
            <span v-for="i in 5" :key="i" :class="{ 'filled': i <= 4 }">★</span>
          </div>
        </div>

        <!-- Chart & Comments -->
        <div class="content-row">
          <!-- Bar Chart -->
          <div class="chart-container">
            <div class="chart-header">Rating</div>
            <div class="bar-chart-wrapper">
              <!-- Y-axis -->
              <div class="y-axis">
                <span v-for="i in 5" :key="i">{{ i }}</span>
              </div>

              <!-- Bars -->
              <div class="bar-group">
                <div class="bar-item">
                  <div class="bar" :style="{ height: `${ratings.provider * 40}px`, backgroundColor: '#1f6feb' }"></div>
                  <div class="label">Service Provider</div>
                </div>
                <div class="bar-item">
                  <div class="bar" :style="{ height: `${ratings.delivery * 40}px`, backgroundColor: '#f59e0b' }"></div>
                  <div class="label">Service Delivery process</div>
                </div>
                <div class="bar-item">
                  <div class="bar" :style="{ height: `${ratings.facilities * 40}px`, backgroundColor: '#ef4444' }"></div>
                  <div class="label">Facilities</div>
                </div>
              </div>

              <!-- Legend -->
              <div class="legend">
                <div class="legend-item">
                  <div class="legend-color" style="background: #1f6feb;"></div>
                  <span>Service Provider</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #f59e0b;"></div>
                  <span>Service Delivery process</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #ef4444;"></div>
                  <span>Facilities</span>
                </div>
              </div>
            </div>

            <button class="export-btn">Export</button>
          </div>

          <!-- Comments -->
          <div class="comments-container">
            <div class="comment-header">
              <span>Comment</span>
              <select v-model="selectedTopic" class="topic-select">
                <option value="course-registration">Course registration</option>
                <option value="advising">Advising session</option>
                <option value="internship">Internship approval</option>
              </select>
            </div>

            <div class="comment-list">
              <div v-for="(comment, i) in filteredComments" :key="i" class="comment-item">
                <div class="avatar-placeholder">👤</div>
                <div class="comment-text">
                  <div class="stars">
                    <span v-for="j in 5" :key="j" :class="{ 'filled': j <= comment.stars }">★</span>
                  </div>
                  <p>{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue'

// ตัวเลือก
const selectedSemester = ref('1')
const selectedYear = ref('2568')
const selectedTopic = ref('course-registration')

// คะแนนโดยรวม
const ratings = {
  provider: 4.8,
  delivery: 2.0,
  facilities: 2.9
}

// ความคิดเห็น
const comments = [
  {
    topic: 'course-registration',
    stars: 5,
    text: 'She is kind and works very quickly.'
  },
  {
    topic: 'course-registration',
    stars: 4,
    text: 'The service was decent and followed the standard process. However, there\'s still room for improvement in terms of speed and convenience to make the experience smoother and more efficient.'
  },
  {
    topic: 'course-registration',
    stars: 5,
    text: 'Very helpful and professional!'
  },
  {
    topic: 'advising',
    stars: 3,
    text: 'Good advice but took too long.'
  }
]

// กรองความคิดเห็นตามหัวข้อ
const filteredComments = computed(() => {
  return comments.filter(c => c.topic === selectedTopic)
})
</script>

<style scoped>
.page-content {
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f9fafb;
}

/* Header Bar แบบภาพแรก */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 1.25rem;
  color: #1f2937;
}

.user-name span {
  font-size: 0.875rem;
  color: #6b7280;
  display: block;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

/* Main Card แบบภาพแรก */
.rating-card {
  background: #4f46e5; /* สีน้ำเงิน */
  color: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.overall-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.score {
  font-size: 3rem;
  font-weight: bold;
}

.stars {
  font-size: 1.5rem;
  display: flex;
}

.stars span {
  color: #d1d5db;
}

.stars .filled {
  color: #fbbf24;
}

.content-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.chart-container {
  flex: 1;
  min-width: 300px;
  background: white;
  color: #1f2937;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.chart-header {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

.bar-chart-wrapper {
  position: relative;
  height: 250px;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem 0;
}

.y-axis {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.bar-group {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex: 1;
  padding-left: 20px; /* ให้มีพื้นที่สำหรับ Y-axis */
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar {
  width: 40px;
  transition: height 0.3s ease;
  border-radius: 4px 4px 0 0;
}

.label {
  font-size: 0.75rem;
  text-align: center;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend {
  margin-top: 1rem;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.export-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.export-btn:hover {
  background: #4338ca;
}

.comments-container {
  flex: 1;
  min-width: 300px;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comment-header span {
  font-size: 1.25rem;
  font-weight: bold;
}

.topic-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.comment-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.avatar-placeholder {
  font-size: 1.5rem;
  color: #6b7280;
}

.comment-text {
  flex: 1;
}

.comment-text .stars {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.comment-text .stars span {
  color: #d1d5db;
}

.comment-text .stars .filled {
  color: #fbbf24;
}

.comment-text p {
  font-size: 0.875rem;
  line-height: 1.4;
  color: #374151;
}

/* Scrollbar Style */
.comment-list::-webkit-scrollbar {
  width: 8px;
}

.comment-list::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 10px;
}

.comment-list::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 10px;
}

.comment-list::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>