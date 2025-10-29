import { ref, computed } from 'vue'

export function useHistory() {
  const history = ref([])
  const startDate = ref('')
  const endDate = ref('')
  const showCalendar = ref(false)
  const currentMonth = ref(new Date().getMonth())
  const currentYear = ref(new Date().getFullYear())

  const toggleCalendar = () => showCalendar.value = !showCalendar.value

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  }

  const calendarDays = computed(() => {
    const days = []
    const firstDay = new Date(currentYear.value, currentMonth.value, 1)
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
    const startWeek = firstDay.getDay()

    for (let i=0;i<startWeek;i++) {
      const prev = new Date(firstDay)
      prev.setDate(prev.getDate() - (startWeek-i))
      days.push(createDay(prev,false))
    }

    for (let d=1; d<=lastDay.getDate(); d++) {
      days.push(createDay(new Date(currentYear.value,currentMonth.value,d),true))
    }

    while(days.length < 42) {
      const next = new Date(lastDay)
      next.setDate(next.getDate() + (days.length - (startWeek + lastDay.getDate()) + 1))
      days.push(createDay(next,false))
    }

    return days
  })

  const createDay = (date, isCurrentMonth) => {
    const dateStr = date.toISOString().slice(0,10)
    const isSelected = dateStr === startDate.value || dateStr === endDate.value
    const isInRange = startDate.value && endDate.value && dateStr >= startDate.value && dateStr <= endDate.value
    const isToday = dateStr === new Date().toISOString().slice(0,10)
    return { day: date.getDate(), date: dateStr, isCurrentMonth, isSelected, isInRange, isToday }
  }

  const currentMonthName = computed(() => 
    new Date(currentYear.value, currentMonth.value).toLocaleString('default', { month: 'long' })
  )

  const filteredHistory = computed(() => {
    if (!startDate.value || !endDate.value) return history.value
    const start = new Date(startDate.value + 'T00:00:00')
    const end = new Date(endDate.value + 'T23:59:59')
    return history.value.filter(item => {
      const d = new Date(item.appointment_date.replace(' ','T'))
      return d >= start && d <= end
    })
  })

  const resetDate = () => {
    if (history.value.length === 0) {
      startDate.value = ''
      endDate.value = ''
    } else {
      const dates = history.value.map(i => new Date(i.appointment_date.replace(' ','T')))
      startDate.value = new Date(Math.min(...dates)).toISOString().slice(0,10)
      endDate.value = new Date(Math.max(...dates)).toISOString().slice(0,10)
    }
    showCalendar.value = false
  }

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '-'
    const d = new Date(isoDate.replace(' ','T'))
    if (isNaN(d)) return '-'
    return { 
      date: `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`, 
      time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    }
  }

  return {
    history, startDate, endDate, showCalendar, currentMonth, currentYear,
    toggleCalendar, changeMonth: (offset)=>{ currentMonth.value+=offset; if(currentMonth.value<0){currentMonth.value=11; currentYear.value--}else if(currentMonth.value>11){currentMonth.value=0; currentYear.value++} },
    formatDateDisplay, calendarDays, currentMonthName, filteredHistory,
    resetDate, formatDateTime
  }
}
