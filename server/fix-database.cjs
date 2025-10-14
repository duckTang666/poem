// 彻底修复数据库问题
require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '123456',
  DB_NAME = 'poem_db'
} = process.env;

async function fixDatabase() {
  let connection;
  
  try {
    console.log('🔧 开始修复数据库...');
    
    // 先连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      charset: 'utf8mb4'
    });

    console.log('📋 检查所有数据库...');
    const [dbs] = await connection.execute('SHOW DATABASES');
    console.log('现有数据库:', dbs.map(db => Object.values(db)[0]));

    // 删除旧数据库（如果存在）并重新创建
    console.log('🗑️  删除旧数据库...');
    await connection.execute(`DROP DATABASE IF EXISTS ${DB_NAME}`);
    
    console.log('🆕 创建新数据库...');
    await connection.execute(`CREATE DATABASE ${DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
    
    // 重新连接到新数据库
    await connection.end();
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      charset: 'utf8mb4'
    });

    console.log('📝 创建诗词表...');
    const createTableSQL = `
      CREATE TABLE poem (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL COMMENT '诗词标题',
        author VARCHAR(100) NOT NULL COMMENT '作者',
        dynasty VARCHAR(100) NOT NULL COMMENT '朝代',
        content TEXT NOT NULL COMMENT '诗词内容',
        appreciation TEXT NULL COMMENT '鉴赏',
        favorite TINYINT(1) DEFAULT 0 COMMENT '是否收藏'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诗词表'
    `;
    await connection.execute(createTableSQL);

    console.log('📚 插入诗词数据...');
    const insertSQL = `
      INSERT INTO poem (title, author, dynasty, content, appreciation, favorite) VALUES
      ('静夜思', '李白', '唐', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '这是李白的代表作之一，通过对月光的描写，表达了诗人深深的思乡之情。全诗语言朴素，意境深远。', 0),
      ('春晓', '孟浩然', '唐', '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', '描写春天早晨的美景，表现了诗人对大自然的热爱和对春光易逝的感慨。', 0),
      ('相思', '王维', '唐', '红豆生南国，春来发几枝。愿君多采撷，此物最相思。', '借红豆寄托相思之情，语言朴实而情深意长，是唐诗中的经典之作。', 1),
      ('登鹳雀楼', '王之涣', '唐', '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', '通过登楼远眺的所见所感，表达了积极向上的人生态度和不断进取的精神。', 1),
      ('咏鹅', '骆宾王', '唐', '鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。', '儿童诗的代表作，用简洁生动的语言描绘了白鹅的形象，朗朗上口。', 0),
      ('望庐山瀑布', '李白', '唐', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '以夸张的手法描写庐山瀑布的壮观景象，展现了诗人的浪漫主义风格。', 0),
      ('早发白帝城', '李白', '唐', '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', '描写了诗人乘舟顺江而下的轻快心情和长江三峡的壮丽景色。', 0),
      ('赋得古原草送别', '白居易', '唐', '离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。', '通过对野草的描写，表现了生命力的顽强和不屈不挠的精神。', 1)
    `;
    await connection.execute(insertSQL);

    console.log('✅ 验证数据...');
    const [tableInfo] = await connection.execute('DESCRIBE poem');
    console.log('表结构:', tableInfo.map(col => `${col.Field} (${col.Type})`));
    
    const [dataCount] = await connection.execute('SELECT COUNT(*) as count FROM poem');
    console.log(`数据条数: ${dataCount[0].count}`);
    
    const [sampleData] = await connection.execute('SELECT id, title, author, dynasty FROM poem LIMIT 3');
    console.log('示例数据:', sampleData);

    console.log('\n🎉 数据库修复完成！');
    console.log('📍 数据库信息:');
    console.log(`   - 主机: ${DB_HOST}:${DB_PORT}`);
    console.log(`   - 数据库: ${DB_NAME}`);
    console.log(`   - 表: poem`);
    console.log(`   - 数据: ${dataCount[0].count} 首诗词`);
    console.log('\n🚀 请重新启动后端服务: npm run server');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDatabase();