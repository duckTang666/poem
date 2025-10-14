// 扩展诗歌数据脚本
require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '123456',
  DB_NAME = 'poem_db'
} = process.env;

async function expandPoemsData() {
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

    console.log('添加更多朝代的诗歌数据...');
    
    const newPoems = [
      // 宋朝诗词
      {
        title: '水调歌头',
        author: '苏轼',
        dynasty: '宋',
        content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。',
        appreciation: '苏轼的代表作，通过对月的咏叹，表达了对人生哲理的思考和对美好愿望的寄托。'
      },
      {
        title: '如梦令',
        author: '李清照',
        dynasty: '宋',
        content: '常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。',
        appreciation: '李清照早期作品，描写了少女时代天真烂漫的生活情趣，语言清新自然。'
      },
      {
        title: '念奴娇·赤壁怀古',
        author: '苏轼',
        dynasty: '宋',
        content: '大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾，谈笑间，樯橹灰飞烟灭。故国神游，多情应笑我，早生华发。人生如梦，一尊还酹江月。',
        appreciation: '豪放词的代表作，通过对赤壁古战场的凭吊，抒发了作者对历史兴亡的感慨。'
      },
      
      // 元朝诗词
      {
        title: '天净沙·秋思',
        author: '马致远',
        dynasty: '元',
        content: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
        appreciation: '元曲中的经典之作，寥寥数笔勾勒出深秋黄昏的萧瑟景象，表达了游子的思乡之情。'
      },
      {
        title: '山坡羊·潼关怀古',
        author: '张养浩',
        dynasty: '元',
        content: '峰峦如聚，波涛如怒，山河表里潼关路。望西都，意踌躇。伤心秦汉经行处，宫阙万间都做了土。兴，百姓苦；亡，百姓苦。',
        appreciation: '通过对潼关险要地势的描写，感慨历史兴亡，体现了作者对民生疾苦的关注。'
      },
      
      // 明朝诗词
      {
        title: '石灰吟',
        author: '于谦',
        dynasty: '明',
        content: '千锤万凿出深山，烈火焚烧若等闲。粉骨碎身全不怕，要留清白在人间。',
        appreciation: '借咏石灰抒发自己坚贞不屈的品格和为国为民的决心，言志诗的典型代表。'
      },
      {
        title: '竹石',
        author: '郑燮',
        dynasty: '清',
        content: '咬定青山不放松，立根原在破岩中。千磨万击还坚劲，任尔东西南北风。',
        appreciation: '通过对竹子的赞美，表现了诗人不屈不挠、坚韧不拔的品格。'
      },
      
      // 清朝诗词
      {
        title: '己亥杂诗',
        author: '龚自珍',
        dynasty: '清',
        content: '九州生气恃风雷，万马齐喑究可哀。我劝天公重抖擞，不拘一格降人才。',
        appreciation: '表达了作者对当时政治现状的不满和对人才的渴求，体现了变革思想。'
      },
      {
        title: '示儿',
        author: '陆游',
        dynasty: '宋',
        content: '死去元知万事空，但悲不见九州同。王师北定中原日，家祭无忘告乃翁。',
        appreciation: '陆游临终前写给儿子的诗，表达了诗人至死不忘收复失地的爱国情怀。'
      },
      
      // 近现代诗歌
      {
        title: '沁园春·雪',
        author: '毛泽东',
        dynasty: '近现代',
        content: '北国风光，千里冰封，万里雪飘。望长城内外，惟余莽莽；大河上下，顿失滔滔。山舞银蛇，原驰蜡象，欲与天公试比高。须晴日，看红装素裹，分外妖娆。江山如此多娇，引无数英雄竞折腰。惜秦皇汉武，略输文采；唐宗宋祖，稍逊风骚。一代天骄，成吉思汗，只识弯弓射大雕。俱往矣，数风流人物，还看今朝。',
        appreciation: '气势磅礴的词作，展现了祖国山河的壮丽和作者的雄心壮志。'
      },
      {
        title: '再别康桥',
        author: '徐志摩',
        dynasty: '近现代',
        content: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。那河畔的金柳，是夕阳中的新娘；波光里的艳影，在我的心头荡漾。软泥上的青荇，油油的在水底招摇；在康河的柔波里，我甘心做一条水草！',
        appreciation: '现代诗歌的经典之作，以优美的意象和音韵表达了对剑桥的眷恋之情。'
      },
      {
        title: '雨巷',
        author: '戴望舒',
        dynasty: '近现代',
        content: '撑着油纸伞，独自彷徨在悠长、悠长又寂寥的雨巷，我希望逢着一个丁香一样地结着愁怨的姑娘。她是有丁香一样的颜色，丁香一样的芬芳，丁香一样的忧愁，在雨中哀怨，哀怨又彷徨。',
        appreciation: '象征主义诗歌的代表作，通过雨巷和丁香姑娘的意象，营造了朦胧忧郁的意境。'
      }
    ];

    for (const poem of newPoems) {
      const insertSQL = `
        INSERT INTO poem (title, author, dynasty, content, appreciation, favorite) 
        VALUES (?, ?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE 
        content = VALUES(content), 
        appreciation = VALUES(appreciation)
      `;
      await connection.execute(insertSQL, [poem.title, poem.author, poem.dynasty, poem.content, poem.appreciation]);
    }

    console.log('诗歌数据扩展完成！已添加宋、元、明、清、近现代等朝代的经典诗词。');
    console.log('可以访问 http://localhost:5173 查看更丰富的诗词内容');
    
  } catch (error) {
    console.error('数据扩展失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

expandPoemsData();