<script setup>
import { defineProps, ref, watch, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ✅ รับ props จากหน้า Dashboard
const props = defineProps({
  chartData: {
    type: [Array, Object],
    default: () => []
  },
  title: {
    type: String,
    default: ''
  }
})

// ✅ Chart.js setup
const canvasRef = ref(null)
let chart = null

const renderChart = () => {
  if (!canvasRef.value) return
  if (chart) chart.destroy()

  let data = {}

  // ✅ รองรับข้อมูลทั้งแบบ Array และ Object
  if (Array.isArray(props.chartData)) {
    const labels = props.chartData.map(i => i.day || i.label)
    const appointmentData = props.chartData.map(i => i.appointments || 0)
    const documentData = props.chartData.map(i => i.documents || 0)

    data = {
      labels,
      datasets: [
        {
          label: 'Appointment',
          data: appointmentData,
          backgroundColor: 'rgba(37, 99, 235, 0.7)', // น้ำเงิน
        },
        {
          label: 'Document Tracking',
          data: documentData,
          backgroundColor: 'rgba(250, 204, 21, 0.7)', // เหลือง
        }
      ]
    }
  } else if (props.chartData?.labels && props.chartData?.datasets) {
    data = props.chartData
  } else {
    return
  }

  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#374151',
            font: { size: 13, weight: 'bold' }
          }
        },
        title: {
          display: !!props.title,
          text: props.title,
          color: '#111827',
          font: { size: 16, weight: 'bold' },
          padding: { top: 10, bottom: 20 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 30, // ✅ สูงสุด 30
          ticks: {
            stepSize: 5, // ✅ ทีละ 5 หน่วย
            callback: function (value) {
              return Number.isInteger(value) ? value : ''
            },
            color: '#374151',
            font: { size: 12, weight: 'bold' }
          },
          grid: {
            color: 'rgba(0,0,0,0.1)',
            lineWidth: 1
          },
          border: {
            display: true,
            color: '#9ca3af'
          }
        },
        x: {
          ticks: {
            color: '#374151',
            font: { size: 12, weight: '500' }
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          },
          border: {
            color: '#9ca3af'
          }
        }
      }
    }
  })
}

// ✅ Watch ข้อมูลเปลี่ยน แล้ว render ใหม่
watch(() => props.chartData, renderChart, { deep: true })
onMounted(renderChart)
</script>

<template>
  <div class="bg-white p-4 rounded shadow h-[400px] flex items-center justify-center">
    <canvas
      v-if="chartData && (Array.isArray(chartData) ? chartData.length : true)"
      ref="canvasRef"
    ></canvas>
    <div v-else class="text-gray-500">กำลังโหลดข้อมูล...</div>
  </div>
</template>
