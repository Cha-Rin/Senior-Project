<!-- 📁 src/views/secretary/Homepage.vue -->
<template>
  <SecreLayout>
    <div class="homepage-content">
      <h1 class="title">Homepage</h1>

      <div class="card-container">
        <!-- ปุ่ม Appointment -->
        <router-link to="/appointment" class="card">
          Appointment
        </router-link>

        <!-- ✅ ปุ่ม Document Tracking → ไปยัง /request-document -->
        <router-link to="/request-document" class="card">
          Document<br>Tracking
        </router-link>
      </div>
    </div>
  </SecreLayout>
</template>

<script setup>
</script>

<style scoped>
.homepage-content {
  padding: 2rem;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2.5rem;
  color: #333;
}

.card-container {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
}

.card {
  width: 220px;
  height: 160px;
  background-color: #4f46e5;
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: bold;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}

.card:hover {
  background-color: #4338ca;
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}
</style>