import { prisma } from '../src/prisma/prisma.extension';

const dynasties = [
  {
    name: '夏朝',
    startYear: -2070,
    endYear: -1600,
    capital: '阳城',
    founder: '禹',
    description: '中国历史上第一个世袭制王朝'
  },
  {
    name: '商朝',
    startYear: -1600,
    endYear: -1046,
    capital: '殷',
    founder: '汤',
    description: '中国历史上第二个王朝，以甲骨文著称'
  },
  {
    name: '周朝',
    startYear: -1046,
    endYear: -256,
    capital: '镐京',
    founder: '周武王',
    description: '中国历史上最长的朝代，分为西周和东周'
  },
  {
    name: '秦朝',
    startYear: -221,
    endYear: -206,
    capital: '咸阳',
    founder: '秦始皇',
    description: '中国历史上第一个统一的中央集权制王朝'
  },
  {
    name: '汉朝',
    startYear: -206,
    endYear: 220,
    capital: '长安',
    founder: '刘邦',
    description: '中国历史上最重要的朝代之一，分为西汉和东汉'
  },
  {
    name: '唐朝',
    startYear: 618,
    endYear: 907,
    capital: '长安',
    founder: '李渊',
    description: '中国历史上最繁荣的朝代之一，文化艺术达到顶峰'
  },
  {
    name: '宋朝',
    startYear: 960,
    endYear: 1279,
    capital: '开封',
    founder: '赵匡胤',
    description: '中国历史上商品经济、文化教育、科学创新高度繁荣的时代'
  },
  {
    name: '元朝',
    startYear: 1271,
    endYear: 1368,
    capital: '大都',
    founder: '忽必烈',
    description: '中国历史上第一个由少数民族建立的统一王朝'
  },
  {
    name: '明朝',
    startYear: 1368,
    endYear: 1644,
    capital: '南京',
    founder: '朱元璋',
    description: '中国历史上最后一个由汉族建立的大一统王朝'
  },
  {
    name: '清朝',
    startYear: 1644,
    endYear: 1912,
    capital: '北京',
    founder: '努尔哈赤',
    description: '中国历史上最后一个封建王朝'
  }
];

async function seedDynasties() {
  console.log('🏛️ 开始导入朝代数据...');
  
  for (const dynasty of dynasties) {
    try {
      await prisma.dynasty.create({
        data: dynasty,
      });
      console.log(`✅ 已创建朝代: ${dynasty.name}`);
    } catch (error) {
      console.error(`❌ 创建朝代失败: ${dynasty.name}`, error);
    }
  }
  
  console.log('✨ 朝代数据导入完成！');
}

seedDynasties()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });