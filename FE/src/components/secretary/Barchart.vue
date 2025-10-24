<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  labels: Array,
  data: Array,
  colors: Array
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
        stepSize: 1,         // บังคับให้แสดงทีละ 1
        autoSkip: false,     // ไม่ข้าม tick
        padding: 5,          // ระยะห่างของตัวเลขจากแกน
      },
      grid: {
        drawTicks: true,     // แสดง tick บนแกน
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
