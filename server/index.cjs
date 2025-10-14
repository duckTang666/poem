require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 从环境变量读取数据库配置
const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '123456',
  DB_NAME = 'poem_db'
} = process.env;

let pool;
async function initPool() {
  pool = await mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });
  console.log('[server] MySQL pool ready:', DB_HOST + ':' + DB_PORT, DB_NAME);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: !!pool });
});

// 列表
app.get('/api/poems', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, author, dynasty, content, appreciation, favorite FROM poem ORDER BY id DESC'
    );
    res.json({ code: 0, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 1, message: 'DB_ERROR' });
  }
});

// 单条
app.get('/api/poems/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, author, dynasty, content, appreciation, favorite FROM poem WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ code: 1, message: 'NOT_FOUND' });
    res.json({ code: 0, data: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 1, message: 'DB_ERROR' });
  }
});

// 切换收藏
app.post('/api/poems/:id/favorite', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.execute('SELECT favorite FROM poem WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ code: 1, message: 'NOT_FOUND' });
    const next = rows[0].favorite ? 0 : 1;
    await pool.execute('UPDATE poem SET favorite = ? WHERE id = ?', [next, id]);
    res.json({ code: 0, data: { id, favorite: !!next } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 1, message: 'DB_ERROR' });
  }
});

const PORT = process.env.PORT || 3001;
initPool()
  .then(() => {
    app.listen(PORT, () => {
      console.log('[server] listening on http://localhost:' + PORT);
    });
  })
  .catch((e) => {
    console.error('[server] init error:', e);
    process.exit(1);
  });