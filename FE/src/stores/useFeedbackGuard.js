// stores/useFeedbackGuard.js
import { defineStore } from 'pinia'

export const useFeedbackGuard = defineStore('feedbackGuard', {
  state: () => ({
    loaded: false,
    loading: false,
    pendingAppointments: [],
    pendingDocuments: []
  }),

  getters: {
    mustFeedback: (state) => {
      return state.pendingAppointments.length > 0 || state.pendingDocuments.length > 0
    },
    totalPending: (state) => {
      return state.pendingAppointments.length + state.pendingDocuments.length
    }
  },

  actions: {
    async loadPending(force = false) {
      // ⭐ เพิ่ม parameter force เพื่อบังคับโหลดใหม่
      if (this.loading) {
        console.log('⏳ Already loading, skip...')
        return
      }

      // ✅ ถ้าไม่ force และโหลดแล้ว → skip
      if (this.loaded && !force) {
        console.log('✅ Already loaded, skip...')
        return
      }

      const token = localStorage.getItem('authToken')
      if (!token) {
        console.warn('⚠️ No token found')
        this.loaded = true
        return
      }

      this.loading = true

      try {
        console.log('🔄 Loading pending feedback...')
        
        const res = await fetch('/api/student/feedback/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        console.log('📦 Pending feedback response:', data)

        const appointments = Array.isArray(data.appointments) ? data.appointments : []
        const documents = Array.isArray(data.documents) ? data.documents : []

        console.log('🔍 Appointments sample:', appointments[0])
        console.log('🔍 Documents sample:', documents[0])

        this.pendingAppointments = appointments
        this.pendingDocuments = documents
        this.loaded = true

        console.log('✅ Loaded:', {
          appointments: this.pendingAppointments.length,
          documents: this.pendingDocuments.length,
          mustFeedback: this.mustFeedback
        })

      } catch (err) {
        console.error('❌ loadPending error:', err)
        this.loaded = true
        this.pendingAppointments = []
        this.pendingDocuments = []
      } finally {
        this.loading = false
      }
    },

    // ✅ เพิ่ม method สำหรับบังคับโหลดใหม่
    async forceReload() {
      console.log('🔄 Force reload pending feedback...')
      this.loaded = false
      await this.loadPending(true)
    },

    removeAppointment(id) {
      this.pendingAppointments = this.pendingAppointments.filter(a => a.id !== id)
      console.log('✅ Removed appointment:', id, '| Remaining:', this.pendingAppointments.length)
    },

    removeDocument(id) {
      this.pendingDocuments = this.pendingDocuments.filter(d => d.id !== id)
      console.log('✅ Removed document:', id, '| Remaining:', this.pendingDocuments.length)
    },

    reset() {
      this.loaded = false
      this.loading = false
      this.pendingAppointments = []
      this.pendingDocuments = []
    },

    logout() {
      this.reset()
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')
      localStorage.removeItem('student_id')
    }
  }
})