import { createI18n } from 'vue-i18n'

const messages = {
  th: {
    feedback: 'แบบประเมิน',
    appointment: 'นัดหมาย',
    document: 'ติดตามเอกสาร',
    submit: 'ส่ง',
    score1: 'ด้านการให้บริการ',
    score2: 'กระบวนการให้บริการ',
    score3: 'สิ่งอำนวยความสะดวก',
    comment: 'ความคิดเห็นเพิ่มเติม',
    required_feedback: 'รายการที่ต้องประเมิน',
    history: 'ประวัติการประเมิน',
    select_path: 'เลือกประเภทแบบประเมิน',
    choose_topic: 'เลือกหัวข้อ',

    sub_topic_title: "พิมพ์หัวข้อย่อยของคุณ",
  sub_topic_example: "เช่น ลงทะเบียนเรียนเพิ่มเติม",
  send_btn: "ส่ง",

  },
  en: {
    feedback: 'Feedback',
    appointment: 'Appointment',
    document: 'Document Tracking',
    submit: 'Submit',
    score1: 'Service Provider',
    score2: 'Service Process',
    score3: 'Facilities',
    comment: 'Additional Comment',
    required_feedback: 'Required Feedback',
    history: 'Feedback History',
    select_path: 'Select Feedback Type',
    choose_topic: 'Choose Topic',

    sub_topic_title: "Type your sub-topic",
  sub_topic_example: "e.g., Additional enrollment request",
  send_btn: "Send",
  },
}


const i18n = createI18n({
  legacy: false,   // ✅ ต้องปิด legacy mode
  globalInjection: true, // ใช้ $t ได้ทุกไฟล์
  locale: localStorage.getItem('lang') || 'th',
  fallbackLocale: 'en',
  messages
})

export default i18n
