// 检查数据库表结构
require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '123456',
  DB_NAME = 'poem_db'
} = process.env;

async function checkDatabase() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      charset: 'utf8mb4'
    });

    console.log('检查表结构...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('数据库中的表:', tables);

    if (tables.length > 0) {
      const [columns] = await connection.execute('DESCRIBE poem');
      console.log('poem 表结构:', columns);
      
      const [data] = await connection.execute('SELECT * FROM poem LIMIT 3');
      console.log('表中数据示例:', data);
    }

    // 如果表结构不对，删除并重新创建
    console.log('\n重新创建正确的表结构...');
    await connection.execute('DROP TABLE IF EXISTS poem');
    
    const createTableSQL = `
      CREATE TABLE poem (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        dynasty VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        appreciation TEXT NULL,
        favorite TINYINT(1) DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    await connection.execute(createTableSQL);
    console.log('表已重新创建');

    // 插入示例数据
    const insertSQL = `
      INSERT INTO poem (title, author, dynasty, content, appreciation, favorite) VALUES
      ('静夜思','李白','唐','床前明月光，疑是地上霜。举头望明月，低头思故乡。','这是李白的代表作，通过对月光的描写表达了思乡之情。',0),
      ('春晓','孟浩然','唐','春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。','描写春天早晨的美景，表现了诗人对大自然的热爱。',0),
      ('相思','王维','唐','红豆生南国，春来发几枝。愿君多采撷，此物最相思。','借红豆寄托相思之情，语言朴实而情深意长。',0),
      ('登鹳雀楼','王之涣','唐','白日依山尽，黄河入海流。欲穷千里目，更上一层楼。','通过登楼远眺的所见所感，表达了积极向上的人生态度。',1),
      ('咏鹅','骆宾王','唐','鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。','儿童诗的代表作，生动描绘了白鹅的形象。',0)
    `;
    await connection.execute(insertSQL);
    console.log('示例数据已插入');

    // 验证
    const [newColumns] = await connection.execute('DESCRIBE poem');
    console.log('\n新的表结构:', newColumns);
    
    const [newData] = await connection.execute('SELECT id, title, author, dynasty FROM poem');
    console.log('数据验证:', newData);
    
    console.log('\n✅ 数据库修复完成！现在可以正常访问 http://localhost:5173');
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();