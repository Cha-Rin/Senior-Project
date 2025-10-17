<!-- 📁 src/views/secretary/Document/RatingDocument.vue -->
<template>
  <div class="rating-document-container">
    <h1 class="title">รายงานคะแนนการให้บริการเอกสาร</h1>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ totalRatings }}</div>
        <div class="stat-label">จำนวนการให้คะแนนทั้งหมด</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ averageRating.toFixed(1) }} <span class="star">★</span></div>
        <div class="stat-label">คะแนนเฉลี่ย</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ fiveStarCount }}</div>
        <div class="stat-label">5 ดาว</div>
      </div>
    </div>

    <div class="chart-section">
      <h2 class="subtitle">กราฟการกระจายคะแนน</h2>
      <div v-if="hasData" class="chart-wrapper">
        <BarChart :chart-data="chartData" :chart-options="chartOptions" />
      </div>
      <div v-else class="no-data">
        <p>ยังไม่มีข้อมูลการให้คะแนน</p>
      </div>
    </div>

    <div class="recent-reviews">
      <h2 class="subtitle">รีวิวล่าสุด</h2>
      <div v-if="recentReviews.length > 0" class="reviews-list">
        <div v-for="(review, index) in recentReviews" :key="index" class="review-card">
          <div class="review-header">
            <div class="review-title">{{ review.documentType }}</div>
            <div class="review-date">{{ review.date }}</div>
          </div>
          <div class="review-stars">
            <span v-for="star in 5" :key="star" class="star" :class="{ active: star <= review.rating }">★</span>
          </div>
          <div v-if="review.comment" class="review-comment">
            "{{ review.comment }}"
          </div>
          <div class="review-author">- {{ review.studentName }}</div>
        </div>
      </div>
      <div v-else class="no-reviews">
        <p>ยังไม่มีรีวิวล่าสุด</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import SecreLayout from '@/layouts/secretary/SecreLayout.vue' // ✅ เพิ่มการ import
import BarChart from '@/components/secretary/Barchart.vue' // ✅ ใช้ alias @/

export default {
  name: 'RatingDocument',
  components: {
    SecreLayout, // ✅ เพิ่มใน components
    BarChart
  },
  setup() {
    // ข้อมูลจำลอง
    const mockReviews = ref([
      { documentType: 'ใบสมัครฝึกงาน', rating: 5, comment: 'ดำเนินการรวดเร็ว บริการดีมาก', date: '2025-04-15', studentName: 'นายสมชาย ใจดี' },
      { documentType: 'ใบรับรองการศึกษา', rating: 4, comment: 'รอคิวนานไปหน่อย', date: '2025-04-14', studentName: 'นางสาวสมหญิง เรียนเก่ง' },
      { documentType: 'ใบสมัครฝึกงาน', rating: 5, comment: 'พนักงานให้คำแนะนำดีมาก', date: '2025-04-13', studentName: 'นายวิทยา ขยันเรียน' },
      { documentType: 'ใบรับรองผลการเรียน', rating: 3, comment: 'เอกสารมีข้อผิดพลาดต้องมาแก้ใหม่', date: '2025-04-12', studentName: 'นางสาวสุดา สมบูรณ์' },
      { documentType: 'ใบสมัครฝึกงาน', rating: 5, comment: 'ประทับใจในบริการ', date: '2025-04-11', studentName: 'นายกิตติ ขยันทำงาน' }
    ])

    const totalRatings = computed(() => mockReviews.value.length)
    const averageRating = computed(() => {
      if (mockReviews.value.length === 0) return 0
      const sum = mockReviews.value.reduce((acc, review) => acc + review.rating, 0)
      return sum / mockReviews.value.length
    })
    const fiveStarCount = computed(() => {
      return mockReviews.value.filter(review => review.rating === 5).length
    })

    const recentReviews = computed(() => {
      return [...mockReviews.value].slice(0, 5)
    })

    const hasData = computed(() => mockReviews.value.length > 0)

    // ข้อมูลสำหรับกราฟ
    const chartData = computed(() => {
      const ratings = [1, 2, 3, 4, 5]
      const counts = ratings.map(rating => {
        return mockReviews.value.filter(review => review.rating === rating).length
      })

      return {
        labels: ['1 ดาว', '2 ดาว', '3 ดาว', '4 ดาว', '5 ดาว'],
        datasets: [
          {
            label: 'จำนวนการให้คะแนน',
            backgroundColor: '#4a67d8',
            data: counts
          }
        ]
      }
    })

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }

    return {
      totalRatings,
      averageRating,
      fiveStarCount,
      recentReviews,
      hasData,
      chartData,
      chartOptions
    }
  }
}
</script>

<style scoped>
.rating-document-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 24px;
  text-align: center;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4a67d8;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: #4b5563;
}

.star {
  color: #fbbf24;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.chart-wrapper {
  height: 400px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.1rem;
}

.recent-reviews {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #4a67d8;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-title {
  font-weight: 600;
  color: #1f2937;
}

.review-date {
  color: #6b7280;
  font-size: 0.9rem;
}

.review-stars {
  margin: 8px 0;
}

.review-stars .star {
  color: #d1d5db;
  font-size: 1.2rem;
}

.review-stars .star.active {
  color: #fbbf24;
}

.review-comment {
  font-style: italic;
  color: #374151;
  margin: 8px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.review-author {
  font-weight: 500;
  color: #4b5563;
  text-align: right;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 1.1rem;
}
</style>