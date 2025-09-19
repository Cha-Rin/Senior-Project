<template>
  <Bar :data="chartData" :options="options" />
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps(['ratings'])

const chartData = {
  labels: ['Service Provider', 'Service Delivery process', 'Facilities'],
  datasets: [
    {
      label: 'Rating',
      data: props.ratings,
      backgroundColor: ['#2563eb', '#facc15', '#f87171']
    }
  ]
}

const options = {
  responsive: true,
  plugins: { legend: { display: false }, title: { display: false } },
  scales: {
    y: { min: 0, max: 5 }
  }
}
</script>
