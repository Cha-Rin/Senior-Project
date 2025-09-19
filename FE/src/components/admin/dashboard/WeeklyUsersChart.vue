<!-- ✅ WeeklyUsersChart.vue -->
<template>
  <Bar :data="chartData" :options="options" />
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps(['chartData'])

const options = {
  responsive: true,
  plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'NUMBER OF WEEKLY USERS' } }
}


</script>