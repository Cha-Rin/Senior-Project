<!-- BarChart.vue -->
<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  labels: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const renderChart = () => {
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: 'Rating',
          data: props.data,
          backgroundColor: props.colors,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1,
            autoSkip: false,
            padding: 5
          },
          grid: {
            drawTicks: true,
            lineWidth: 0.5
          }
        },
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0
          }
        }
      }
    }
  })
}

onMounted(renderChart)
watch(props, renderChart, { deep: true })
</script>
