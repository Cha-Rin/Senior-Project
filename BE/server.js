// ------------------------------------------ Imports -----------------------------------------
require('dotenv').config();
console.log('✅ Environment Check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('SECRET_KEY:', process.env.SECRET_KEY ? '✓ Set' : '✗ Missing');
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path'); // ✅ ต้องมี
const router = express.Router();
const app = express();
const { OAuth2Client } = require('google-auth-library')
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
// ------------------------------------------ Middleware --------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SECRET_KEY = "mysecretkey";

// ------------------------------------------ Database ----------------------------------------
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'andtsp'
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to database.');
  connection.release();
});

// ------------------------------------------ Error Handling ----------------------------------
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ JSON parse error:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  next(err);
});

// ------------------------------------------ Routes Import -----------------------------------
const studentRouter = require('./routes/student')(db);
app.use('/api/student', studentRouter);

// const studentDocRouter = require('./routes/studentDoc')(db);
// app.use('/api/studentDoc', studentDocRouter);

const secretaryRouter = require('./routes/secretary')(db);
app.use('/api/secretary', secretaryRouter);

const adminRouter = require('./routes/admin')(db);
app.use('/api/admin', adminRouter);

const historyRouter = require('./routes/history')(db);
app.use('/api/history', historyRouter);

const academicRoutes = require('./routes/academic.js')(db);
app.use('/api/academic', academicRoutes);

const notiRoutes = require('./routes/Notification.js')(db);
app.use('/api/noti', notiRoutes);
const notiActiveRoutes = require('./routes/NotificationActive.js')(db);
app.use('/api/noti', notiActiveRoutes);


// ------------------------------------------ Static Files ------------------------------------
// ✅ เสิร์ฟโฟลเดอร์ uploads (อยู่ใน BE/ เดียวกับ server.js)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------------------------------ Login -------------------------------------------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('📩 Incoming:', email, password);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email or password missing' });
  }

  const sql = 'SELECT * FROM `user` WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('❌ DB Error:', err);
      return res.status(500).json({ success: false });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];
    // ✅ ตรวจสอบ status ของเลขา
    if (user.role === 2 && user.status === 0) {
      return res.status(403).json({
        success: false,
        message: 'No permission for this account.'
      })
    }
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: Number(user.role) },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: Number(user.role)
      }
    });
  });
});
// ------------------------------------------ login-------------------------------------------
app.post('/api/auth/google', async (req, res) => {
  const { token, credential } = req.body;
  const idToken = token || credential;
  
  if (!idToken) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  let connection;
  try {
    // ✅ ใช้ connection แบบ manual เพื่อควบคุมได้ดีขึ้น
    connection = await db.promise().getConnection();
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const email = payload.email?.trim().toLowerCase();
    const name = payload.name || email;

    if (!email) {
      throw new Error('Email not found in token');
    }

    if (!email.endsWith('@lamduan.mfu.ac.th')) {
      return res.status(403).json({ 
        success: false, 
        message: 'กรุณาใช้อีเมล @lamduan.mfu.ac.th เท่านั้น' 
      });
    }

    // ✅ ใช้ transaction
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM user WHERE email = ?', 
      [email]
    );

    let user;
    if (rows.length === 0) {
      const [insert] = await connection.query(
        'INSERT INTO user (email, name, role) VALUES (?, ?, ?)',
        [email, name, 3]
      );
      
      if (!insert.insertId) {
        throw new Error('Failed to insert user');
      }
      
      user = { user_id: insert.insertId, email, name, role: 3 };
    } else {
      user = rows[0];
    }

    await connection.commit();

    const jwtToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: Number(user.role) },
      process.env.SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.json({ success: true, token: jwtToken });
    
  } catch (err) {
    if (connection) await connection.rollback();
    
    console.error('❌ Google Auth Error:', err);
    
    // ✅ แยก error message ตามประเภท
    let errorMessage = 'Login failed';
    if (err.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection refused';
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'User table not found';
    } else if (err.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Email already exists';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
});
// ------------------------------------------- demo -------------------------------------------
// async function resetDemoAccounts() {
//   try {
//     const db = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//     });

//     // ✅ แทนที่ 'yourname' ด้วยชื่อจริงของคุณ
//     const yourEmail = '6531501019@lamduan.mfu.ac.th';  // ← แก้ตรงนี้!
//     const emailPattern = yourEmail.split('@')[0];    // เอาแค่ส่วนหน้า @

//     console.log(`🗑️ Deleting all accounts containing "${emailPattern}"...`);
    
//     // ลบ accounts ทั้งหมดที่มี email pattern นี้
//     const [result] = await db.query(
//       `DELETE FROM user WHERE email LIKE ?`,
//       [`%${emailPattern}%@lamduan.mfu.ac.th`]
//     );

//     console.log(`✅ Deleted ${result.affectedRows} demo accounts`);
//     console.log('');
//     console.log('📝 Ready for demo! You can now login with:');
//     console.log(`   1. ${emailPattern}+student@lamduan.mfu.ac.th → Student (role 3)`);
//     console.log(`   2. ${emailPattern}+staff@lamduan.mfu.ac.th → Staff (role 2)`);
//     console.log(`   3. ${emailPattern}+admin@lamduan.mfu.ac.th → Admin (role 1)`);
    
//     await db.end();
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//   }
// }

// resetDemoAccounts();
// ------------------------------------------ Upload Config -----------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 📂 บันทึกไฟล์ไว้ใน BE/uploads/documents
    cb(null, path.join(__dirname, 'uploads/documents'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Route สำหรับเพิ่มเอกสารพร้อมอัปโหลดไฟล์
router.post('/api/tracking/add', upload.single('file'), async (req, res) => {
  try {
    const { user_id, category_id, status } = req.body;

    let filePath = null;
    if (req.file) {
      // ✅ ป้องกัน path ซ้ำ uploads/uploads
      filePath = `/uploads/documents/${req.file.filename}`.replace(
        /(\/uploads\/documents\/)+/,
        '/uploads/documents/'
      );
    }

    await db.promise().query(
      `INSERT INTO document_tracking (user_id, category_id, status, image_path)
       VALUES (?, ?, ?, ?)`,
      [user_id, category_id, status, filePath]
    );

    res.json({ success: true, message: '✅ Document added successfully.', path: filePath });
  } catch (err) {
    console.error('🔥 Error adding document:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------------ Profile -----------------------------------------
app.get('/api/profile/:id', (req, res) => {
  const userId = Number(req.params.id);
  const sql = 'SELECT name, surname FROM user WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result[0]);
  });
});

// ------------------------------------------ Logout ------------------------------------------
app.post('/student/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ------------------------------------------ Categories --------------------------------------
app.get('/api/categories', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ------------------------------------------ 404 Handler -------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// ------------------------------------------ Server Start ------------------------------------
app.listen(3000, () => {
  console.log('🚀 API server running on http://localhost:3000');
});
