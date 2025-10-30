const express = require('express')
const cors = require('cors')
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mysql = require('mysql2')
const router = express.Router();
const app = express()
// const authMiddleware = require('./middleware/auth') ;
app.use(cors())
app.use(express.json()) 
app.use(express.json({ limit: '1mb' }))  
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());

const SECRET_KEY = "mysecretkey";

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'andtsp'
})

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack)
    return
  }
  console.log('Connected to database.')
})

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ JSON parse error:', err.message)
    return res.status(400).json({ success: false, message: 'Invalid JSON' })
  }
  next(err)
})

// ------------------------------------------ Routes -----------------------------------------

const studentRouter = require('./routes/student')(db)
app.use('/student', studentRouter)

const secretaryRouter = require('./routes/secretary')(db)
app.use('/secretary', secretaryRouter)

const adminRouter = require('./routes/admin')(db)
app.use('/admin', adminRouter)

const historyRouter = require('./routes/history')(db)
app.use('/history', historyRouter)
// ------------------------------------------ Log in -----------------------------------------
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

    // ✅ สร้าง token โดยใส่ user.id + role
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: Number(user.role) },
      SECRET_KEY,
      { expiresIn: '1h' } // หมดอายุใน 1 ชั่วโมง
    );

    res.json({
      success: true,
      token, // ส่ง token กลับ
      user: {
        id: user.id,
        email: user.email,
        role: Number(user.role)
      }
    });
  });
});
// ------------------------------------------ Profile -----------------------------------------
app.get('/profile/:id', (req, res) => {
  const userId = Number(req.params.id); // แปลงเป็น number
  const sql = 'SELECT name, surname FROM user WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result[0]);
  });
});

// ------------------------------------------ Log out -----------------------------------------
app.post('/student/logout', (req, res) => {
  // สำหรับ JWT ปกติ เราแค่บอก client ให้ลบ token
  res.json({ success: true, message: 'Logged out successfully' })
})

// --------------------------------------- Catagories ---------------------------------------
app.get('/api/categories', (req, res) => {
  const sql = 'SELECT * FROM categories'
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(results)
  })
})

// --------------------------------------- 404 Handler ---------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' })
})
// -------------------------------------------------------------------------------------------------
app.listen(3000, () => {
  console.log('API server running on http://localhost:3000')
})
