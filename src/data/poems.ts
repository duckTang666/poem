export type Poem = {
  title: string;
  author: string;
  dynasty: string;
  preview: string;
  image: string;
  content?: string;
  appreciation?: string;
};

export const poems: Poem[] = [
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐代',
    preview: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
    image: 'https://ai-public.mastergo.com/ai/img_res/07a2cddcadbe9cdc3bb84926b9a54577.jpg',
    content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
    appreciation: '诗人登楼远望，借景寓意，结句以“更上一层楼”收束，表达开阔进取的人生志向，千古传诵。'
  },
  {
    title: '念奴娇·赤壁怀古',
    author: '苏轼',
    dynasty: '宋代',
    preview: '大江东去，浪淘尽，千古风流人物。',
    image: 'https://ai-public.mastergo.com/ai/img_res/135bbaccc77df04113a2253e3ba3e19b.jpg',
    content: '大江东去，浪淘尽，千古风流人物。故垒西边，人道是、三国周郎赤壁……（略）',
    appreciation: '全词气势宏大，以赤壁为历史意象，感慨人生与功业的盛衰，展现词人旷达胸襟。'
  },
  {
    title: '天净沙·秋思',
    author: '马致远',
    dynasty: '元代',
    preview: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。',
    image: 'https://ai-public.mastergo.com/ai/img_res/a0654cd0c3afb4288952efa2d42d5094.jpg',
    content: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
    appreciation: '意象叠加，色彩凝练，寥寥数笔写尽羁旅之愁与秋景之凄清，余韵悠长。'
  },
  {
    title: '再别康桥',
    author: '徐志摩',
    dynasty: '近现代',
    preview: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。',
    image: 'https://ai-public.mastergo.com/ai/img_res/74b98f74d8d66167af7e367105530077.jpg',
    content: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩……（略）',
    appreciation: '语言轻灵婉约，情感细腻含蓄，洋溢着对康桥的眷恋与对美好生活的诗意追求。'
  }
];