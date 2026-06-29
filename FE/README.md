# Student Appointment & Counseling Management System

ระบบบริหารจัดการการนัดหมายและการให้คำปรึกษาสำหรับนักศึกษา พัฒนาด้วย **Vue 3 + Vite** (Frontend) และ **Express.js + MySQL** (Backend) โดยรองรับการใช้งานแบบแบ่งสิทธิ์ (Role-based Access Control) สำหรับ **Admin**, **Secretary** และ **Student**

---

# สารบัญ

* ภาพรวมของระบบ
* เทคโนโลยีที่ใช้
* เครื่องมือที่ต้องติดตั้ง
* การติดตั้งโปรเจค
* การตั้งค่าฐานข้อมูล
* การตั้งค่า Environment Variables
* การรันโปรเจค
* โครงสร้างโปรเจค
* คำอธิบายโฟลเดอร์และไฟล์
* การทำงานของระบบ
* Role ของผู้ใช้งาน
* Authentication
* Flow การทำงาน
* API Structure
* การ Deploy
* ปัญหาที่พบบ่อย (Troubleshooting)

---

# ภาพรวมของระบบ

ระบบนี้ถูกพัฒนาขึ้นเพื่อช่วยบริหารจัดการการให้คำปรึกษาของนักศึกษา โดยมีความสามารถหลักดังนี้

* Login ด้วย JWT
* แบ่งสิทธิ์ผู้ใช้งาน
* ระบบนัดหมาย
* ระบบประวัติการให้คำปรึกษา
* ระบบ Feedback หลังการให้คำปรึกษา
* Dashboard สำหรับผู้ดูแล
* จัดการข้อมูลผู้ใช้งาน
* รองรับ Google Authentication

---

# เทคโนโลยีที่ใช้

## Frontend

* Vue 3
* Vite
* Vue Router
* Pinia
* Axios
* Tailwind CSS
* Vue I18n
* SweetAlert2
* Vue3 Toastify
* Chart.js
* Date-fns
* Day.js
* JWT Decode

---

## Backend

* Node.js
* Express.js
* MySQL
* JWT
* Google Auth Library
* Multer
* dotenv
* CORS

---

# เครื่องมือที่ต้องติดตั้ง

ก่อนเริ่มต้นใช้งาน ให้ติดตั้งโปรแกรมดังต่อไปนี้

## 1. Node.js

แนะนำเวอร์ชัน

```
Node.js >= 20
```

ตรวจสอบ

```bash
node -v
npm -v
```

---

## 2. Git

```bash
git --version
```

---

## 3. MySQL Server

แนะนำ

```
MySQL 8.x
```

หรือ

```
MariaDB
```

---

## 4. Visual Studio Code

Extension ที่แนะนำ

* Vue Official (Volar)
* ESLint
* Prettier
* Tailwind CSS IntelliSense
* GitLens

---

## 5. Postman (แนะนำ)

ใช้ทดสอบ API

---

# การติดตั้งโปรเจค

Clone Project

```bash
git clone <repository>
```

Frontend

```bash
cd FE
npm install
```

Backend

```bash
cd BE
npm install
```

---

# การตั้งค่าฐานข้อมูล

1. สร้างฐานข้อมูล

```
student_appointment
```

2. Import ไฟล์ SQL

```
database.sql
```

3. ตรวจสอบว่าฐานข้อมูลทำงานเรียบร้อย

---

# Environment Variables

สร้างไฟล์

```
BE/.env
```

ตัวอย่าง

```
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=student_appointment

JWT_SECRET=your_secret

GOOGLE_CLIENT_ID=xxxxxxxx
```

---

# การรันโปรเจค

Backend

```bash
cd BE
npm run dev
```

Frontend

```bash
cd FE
npm run dev
```

เปิดเว็บ

```
http://localhost:5173
```

---

# โครงสร้างโปรเจค

```
Project
│
├── FE
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── BE
│   ├── routes
│   ├── controllers
│   ├── middleware
│   ├── uploads
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# คำอธิบายโฟลเดอร์

## FE/

ส่วนของ User Interface

ประกอบด้วยหน้าเว็บทั้งหมด

### src/

Source Code หลักของ Frontend

### assets/

เก็บรูปภาพ

### components/

Reusable Components

### layouts/

Layout ของแต่ละ Role

### router/

กำหนดเส้นทางการทำงาน

ตัวอย่าง

```
Student
Secretary
Admin
```

พร้อม Navigation Guard

### stores/

Pinia Store

ใช้เก็บ State ของระบบ

เช่น

* Login
* Feedback
* User

### services/

เชื่อมต่อ API

### utils/

ฟังก์ชันช่วยเหลือ

---

## BE/

Backend API

---

### routes/

กำหนด Endpoint

เช่น

```
/login

/student

/appointment

/feedback
```

---

### controllers/

Business Logic

---

### middleware/

Authentication

Authorization

JWT

---

### uploads/

เก็บไฟล์ที่ผู้ใช้ Upload

---

### server.js

จุดเริ่มต้นของ Backend

ทำหน้าที่

* สร้าง Express Server
* เชื่อม Database
* Register Routes
* เปิดใช้งาน Middleware

---

# Authentication

ระบบใช้

```
JWT (JSON Web Token)
```

หลัง Login สำเร็จ

Frontend จะเก็บ

```
authToken

userRole
```

ไว้ใน

```
localStorage
```

Vue Router จะตรวจสอบ

* Login
* Token หมดอายุ
* Role
* Redirect
* Feedback ที่ยังไม่ทำ

ก่อนเข้าแต่ละหน้า

---

# Role ของผู้ใช้งาน

## Student

* Login
* นัดหมาย
* ดูประวัติ
* ส่ง Feedback

---

## Secretary

* จัดการนัดหมาย
* ตรวจสอบข้อมูลนักศึกษา

---

## Admin

* Dashboard
* จัดการผู้ใช้
* จัดการข้อมูลระบบ

---

# Flow การทำงาน

```
Login

↓

JWT Authentication

↓

Role Detection

↓

Redirect

↓

ใช้งานระบบ

↓

หากมี Feedback ค้าง

↓

Redirect ไปหน้า Feedback

↓

จึงกลับมาใช้งานระบบได้
```

---

# API Structure

Backend ถูกแบ่งออกเป็น

```
Routes

↓

Controller

↓

Database
```

ทำให้แยกหน้าที่ของแต่ละส่วนอย่างชัดเจน และง่ายต่อการดูแลรักษา

---

# การ Deploy

Frontend

```
npm run build
```

Backend

```
npm start
```

---

# Troubleshooting

### npm install ไม่ผ่าน

ลบ

```
node_modules
```

และ

```
package-lock.json
```

จากนั้น

```bash
npm install
```

---

### Port ถูกใช้งาน

เปลี่ยนค่า

```
PORT
```

ใน

```
.env
```

---

### Database เชื่อมไม่ได้

ตรวจสอบ

* Host
* Username
* Password
* Database Name

---

### JWT หมดอายุ

Login ใหม่อีกครั้ง

---

# ผู้พัฒนา

Senior Project

Developed using

* Vue 3
* Express.js
* MySQL
* JWT Authentication
* Tailwind CSS