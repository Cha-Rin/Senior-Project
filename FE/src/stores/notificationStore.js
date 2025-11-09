import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  
  state: () => ({
    pendingAppointments: [],
    isLoading: false,
  }),
  getters: {
    pendingCount: (state) => state.pendingAppointments.length,
    hasPending: (state) => state.pendingAppointments.length > 0,
  },
  actions: {
    async fetchPendingAppointments(userId) {
      if (!userId) {
      this.pendingAppointments = [];
      return; 
    }
      if (this.isLoading) return
      this.isLoading = true
      try {
        const response = await fetch('/api/noti/pending-now?user_id=${userId}')
        const data = await response.json()
        this.pendingAppointments = data
        
      } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลนัดหมายได้:', error)
      } finally {
        this.isLoading = false
      }
    },

    async approveAppointment(appointmentId) {
      try {
        await fetch(`/api/noti/${appointmentId}/approve`, { method: 'POST' })

        this.removeAppointmentFromList(appointmentId)
        
      } catch (error) {
        console.error('การอนุมัตินัดหมายล้มเหลว:', error)
      }
    },
    async rejectAppointment(appointmentId) {
      try {
        await fetch(`/api/noti/${appointmentId}/reject`, { method: 'POST' })

        this.removeAppointmentFromList(appointmentId)
        
      } catch (error) {
        console.error('การยกเลิกนัดหมายล้มเหลว:', error)
      }
    },
    removeAppointmentFromList(id) {
      this.pendingAppointments = this.pendingAppointments.filter(
        (app) => app.id !== id
      )
    },
  },
})