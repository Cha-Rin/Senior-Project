// 📍 ไฟล์: @/components/together/useHistory.js

import { ref, computed } from 'vue'

// ⬇️ 1. แก้ไขตรงนี้: เพิ่ม (filterType = 'all')
export function useHistory(filterType = 'all') {

  // --- State (เหมือนเดิม) ---
  const history = ref([])
  const startDate = ref(null)
  const endDate = ref(null)
  const showCalendar = ref(false)
  const currentMonth = ref(new Date().getMonth())
  const currentYear = ref(new Date().getFullYear())

  // --- Functions (เหมือนเดิม) ---
  const toggleCalendar = () => { showCalendar.value = !showCalendar.value }
  
  const changeMonth = (inc) => {
    const newDate = new Date(currentYear.value, currentMonth.value + inc, 1)
    currentYear.value = newDate.getFullYear()
    currentMonth.value = newDate.getMonth()
  }

  const selectDate = (date) => {
    const newDate = new Date(date)
    if (!startDate.value || endDate.value) {
      startDate.value = newDate
      endDate.value = null
    } else if (newDate < startDate.value) {
      endDate.value = startDate.value
      startDate.value = newDate
    } else {
      endDate.value = newDate
      toggleCalendar()
    }
  }

  const formatDateDisplay = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' }
    const dateObj = new Date(dateString)
    return {
      date: dateObj.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
  }

  // resetDate ถูกต้องแล้ว (ใช้ event_date)
  const resetDate = () => {
    if (history.value.length === 0) {
      const today = new Date()
      startDate.value = new Date(today.setDate(today.getDate() - today.getDay()))
      endDate.value = new Date(today.setDate(today.getDate() + 6))
      return
    }
    const dates = history.value.map(item => new Date(item.event_date))
    startDate.value = new Date(Math.min.apply(null, dates))
    endDate.value = new Date(Math.max.apply(null, dates))
    currentYear.value = startDate.value.getFullYear()
    currentMonth.value = startDate.value.getMonth()
  }

  // --- Computed ---

  const currentMonthName = computed(() => {
    return new Date(currentYear.value, currentMonth.value).toLocaleString('en-US', { month: 'long' })
  })
  
  // ⬇️ 2. สร้าง computed ตัวกรอง 'วันที่' ก่อน
  //    (ต้องอยู่นอก computed อื่น)
  const dateFilteredHistory = computed(() => {
    if (!startDate.value || !endDate.value) {
      return history.value // ถ้ายังไม่ตั้งค่าวัน ให้แสดงทั้งหมด
    }
    const startOfDay = new Date(startDate.value)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(endDate.value)
    endOfDay.setHours(23, 59, 59, 999)

    return history.value.filter(item => {
      const itemDate = new Date(item.event_date)
      return itemDate >= startOfDay && itemDate <= endOfDay
    })
  })

  // ⬇️ 3. สร้าง filteredHistory (ตัวจริง) ที่กรอง 'type' ทับอีกที
  //    (ต้องอยู่นอก computed อื่น)
  const filteredHistory = computed(() => {
    if (filterType === 'all') {
      return dateFilteredHistory.value // ถ้าไม่ได้ระบุ type, ส่งทั้งหมดที่กรองวันแล้ว
    }
    // ถ้ามีการระบุ type (เช่น 'appointment') ให้กรองซ้ำ
    return dateFilteredHistory.value.filter(item => item.type === filterType)
  })

  // ⬇️ calendarDays ต้องอยู่แยกต่างหาก
  const calendarDays = computed(() => {
    const days = []
    const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
    const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // วันของเดือนก่อนหน้า
    const daysInPrevMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
    for (let i = firstDay; i > 0; i--) {
      const date = new Date(currentYear.value, currentMonth.value - 1, daysInPrevMonth - i + 1)
      days.push({ day: date.getDate(), date: date.toISOString(), isCurrentMonth: false })
    }

    // วันของเดือนปัจจุบัน
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear.value, currentMonth.value, i)
      const dateISO = date.toISOString()
      const d = date.setHours(0, 0, 0, 0)
      
      const isSelected = (startDate.value && d === startDate.value.setHours(0, 0, 0, 0)) ||
                         (endDate.value && d === endDate.value.setHours(0, 0, 0, 0))
      
      const isInRange = startDate.value && endDate.value && d > startDate.value && d < endDate.value

      days.push({
        day: i,
        date: dateISO,
        isCurrentMonth: true,
        isToday: d === today.getTime(),
        isSelected: isSelected,
        isInRange: isInRange
      })
    }
    
    // วันของเดือนถัดไป
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(currentYear.value, currentMonth.value + 1, i)
      days.push({ day: i, date: date.toISOString(), isCurrentMonth: false })
    }

    return days
  })


  // --- Exports (เหมือนเดิม) ---
  return {
    history, 
    startDate, 
    endDate, 
    showCalendar, 
    currentMonth, 
    currentYear,
    toggleCalendar, 
    calendarDays, 
    currentMonthName, 
    filteredHistory, // ⬅️ ส่งตัวนี้ออกไป
    resetDate, 
    formatDateDisplay, 
    formatDateTime, 
    changeMonth, 
    selectDate
  }
}