import { supabaseBulkInsert } from './http';

const samplePoems = [
  {
    title: "静夜思",
    author: "李白",
    dynasty: "唐",
    content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
    appreciation: "此诗描写秋夜思乡之情，语言清新朴素而韵味含蓄无穷。",
    favorite: false
  },
  {
    title: "春望",
    author: "杜甫",
    dynasty: "唐",
    content: "国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。",
    appreciation: "全诗抒发了诗人忧国忧民、感时伤怀的情感。",
    favorite: false
  },
  {
    title: "水调歌头",
    author: "苏轼",
    dynasty: "宋",
    content: "明月几时有？把酒问青天。不知天上宫阙，今夕是何年。",
    appreciation: "此词是中秋望月怀人之作，表达了对胞弟苏辙的无限怀念。",
    favorite: true
  }
];

export async function seedPoems() {
  try {
    const result = await supabaseBulkInsert('poems', samplePoems);
    console.log(`成功插入 ${result.length} 首诗词`);
    return result;
  } catch (error) {
    console.error('初始化诗词数据失败:', error);
    return [];
  }
}

// 执行数据初始化（开发环境）
if (import.meta.env.DEV) {
  seedPoems();
}