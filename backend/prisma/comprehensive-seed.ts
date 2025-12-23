import { prisma } from '../src/prisma/prisma.extension';

// Sample data for comprehensive testing
const sampleData = {
  // Emperors data
  emperors: [
    {
      name: '李世民',
      dynastyName: '唐朝',
      reignStart: 626,
      reignEnd: 649,
      templeName: '太宗',
      posthumousName: '文武大圣大广孝皇帝',
      birthYear: 598,
      deathYear: 649,
      biography: '唐朝第二位皇帝，开创了贞观之治的盛世。',
      eraNames: [
        { name: '贞观', startYear: 627, endYear: 649, description: '贞观之治时期' }
      ],
      achievements: ['开创贞观之治', '完善科举制度', '推行均田制'],
      historicalEvaluation: {
        rating: 9,
        summary: '中国历史上最杰出的皇帝之一',
        positives: ['政治清明', '经济繁荣', '文化昌盛'],
        negatives: ['晚年好大喜功'],
        impact: '为唐朝的繁荣奠定了基础'
      }
    }
  ],

  // Events data
  events: [
    {
      title: '安史之乱',
      startYear: 755,
      endYear: 763,
      description: '唐朝中期的一次重大叛乱，严重削弱了唐朝的国力。',
      eventType: 'war'
    },
    {
      title: '贞观之治',
      startYear: 627,
      endYear: 649,
      description: '唐太宗李世民统治时期的政治清明、经济繁荣时期。',
      eventType: 'political'
    },
    {
      title: '玄奘西行取经',
      startYear: 629,
      endYear: 645,
      description: '唐朝高僧玄奘前往印度取经的历史事件。',
      eventType: 'cultural'
    }
  ],

  // Persons data
  persons: [
    {
      name: '李白',
      birthYear: 701,
      deathYear: 762,
      biography: '唐朝著名诗人，被誉为"诗仙"。'
    },
    {
      name: '杜甫',
      birthYear: 712,
      deathYear: 770,
      biography: '唐朝著名诗人，被誉为"诗圣"。'
    },
    {
      name: '玄奘',
      birthYear: 602,
      deathYear: 664,
      biography: '唐朝著名高僧，西行取经，翻译佛经。'
    }
  ],

  // Tang Figures data
  tangFigures: [
    {
      name: '李白',
      role: 'poet',
      birthYear: 701,
      deathYear: 762,
      period: 'middle',
      achievements: ['创作大量优秀诗歌', '开创浪漫主义诗风'],
      works: ['《将进酒》', '《蜀道难》', '《静夜思》'],
      biography: '唐朝著名诗人，被誉为"诗仙"。'
    },
    {
      name: '杜甫',
      role: 'poet',
      birthYear: 712,
      deathYear: 770,
      period: 'middle',
      achievements: ['现实主义诗歌大师', '反映社会现实'],
      works: ['《春望》', '《茅屋为秋风所破歌》', '《三吏三别》'],
      biography: '唐朝著名诗人，被誉为"诗圣"。'
    }
  ],

  // Scholars data
  scholars: [
    {
      name: '孔子',
      dynastyPeriod: '春秋',
      birthYear: -551,
      deathYear: -479,
      majorWorks: ['《论语》', '《春秋》'],
      contributions: ['创立儒家学说', '教育思想', '政治理念'],
      biography: '春秋时期思想家、教育家，儒家学派创始人。'
    },
    {
      name: '老子',
      dynastyPeriod: '春秋',
      birthYear: -571,
      deathYear: -471,
      majorWorks: ['《道德经》'],
      contributions: ['创立道家学说', '哲学思想'],
      biography: '春秋时期思想家，道家学派创始人。'
    }
  ],

  // Philosophical Schools data
  philosophicalSchools: [
    {
      name: '儒家',
      founder: '孔子',
      foundingYear: -551,
      coreBeliefs: ['仁爱', '礼制', '中庸', '修身齐家治国平天下'],
      keyTexts: ['《论语》', '《孟子》', '《大学》', '《中庸》'],
      description: '中国古代最重要的哲学流派之一，强调道德修养和社会秩序。'
    },
    {
      name: '道家',
      founder: '老子',
      foundingYear: -571,
      coreBeliefs: ['道法自然', '无为而治', '阴阳平衡'],
      keyTexts: ['《道德经》', '《庄子》'],
      description: '强调自然和谐、无为而治的哲学流派。'
    }
  ],

  // Mythologies data
  mythologies: [
    {
      name: '盘古开天',
      category: 'creation_myth',
      origin: '中原',
      period: '上古',
      description: '中国古代神话中关于天地开辟的故事。',
      stories: ['盘古开天辟地', '身化万物'],
      symbolism: ['创世', '牺牲精神', '天地分离']
    },
    {
      name: '女娲补天',
      category: 'legend',
      origin: '中原',
      period: '上古',
      description: '女娲炼石补天的神话故事。',
      stories: ['天塌地陷', '炼五色石补天'],
      symbolism: ['拯救世界', '母性力量', '创造与修复']
    }
  ]
};

async function seedComprehensiveData() {
  console.log('🌱 开始综合数据导入...\n');

  try {
    // 1. Get Tang Dynasty ID for foreign key relationships
    const tangDynasty = await prisma.dynasty.findFirst({
      where: { name: '唐朝' }
    });

    if (!tangDynasty) {
      console.error('❌ 未找到唐朝数据，请先运行基础朝代种子脚本');
      return;
    }

    // 2. Seed Philosophical Schools
    console.log('📚 导入哲学流派...');
    const createdSchools = [];
    for (const school of sampleData.philosophicalSchools) {
      try {
        const createdSchool = await prisma.philosophicalSchool.create({
          data: {
            ...school,
            coreBeliefs: JSON.stringify(school.coreBeliefs),
            keyTexts: JSON.stringify(school.keyTexts),
          },
        });
        createdSchools.push(createdSchool);
        console.log(`✅ 已创建哲学流派: ${school.name}`);
      } catch (error) {
        console.error(`❌ 创建哲学流派失败: ${school.name}`, error);
      }
    }

    // 3. Seed Scholars
    console.log('\n👨‍🎓 导入学者...');
    for (const scholar of sampleData.scholars) {
      try {
        // Find related philosophical school
        const relatedSchool = createdSchools.find(school => 
          school.founder === scholar.name
        );

        await prisma.scholar.create({
          data: {
            ...scholar,
            philosophicalSchoolId: relatedSchool?.id || null,
            majorWorks: JSON.stringify(scholar.majorWorks),
            contributions: JSON.stringify(scholar.contributions),
          },
        });
        console.log(`✅ 已创建学者: ${scholar.name}`);
      } catch (error) {
        console.error(`❌ 创建学者失败: ${scholar.name}`, error);
      }
    }

    // 4. Seed Emperors
    console.log('\n👑 导入皇帝...');
    for (const emperor of sampleData.emperors) {
      try {
        await prisma.emperor.create({
          data: {
            name: emperor.name,
            dynastyId: tangDynasty.id,
            reignStart: emperor.reignStart,
            reignEnd: emperor.reignEnd,
            templeName: emperor.templeName,
            posthumousName: emperor.posthumousName,
            birthYear: emperor.birthYear,
            deathYear: emperor.deathYear,
            biography: emperor.biography,
            eraNames: JSON.stringify(emperor.eraNames),
            achievements: JSON.stringify(emperor.achievements),
            historicalEvaluation: JSON.stringify(emperor.historicalEvaluation),
          },
        });
        console.log(`✅ 已创建皇帝: ${emperor.name}`);
      } catch (error) {
        console.error(`❌ 创建皇帝失败: ${emperor.name}`, error);
      }
    }

    // 5. Seed Events
    console.log('\n📅 导入历史事件...');
    for (const event of sampleData.events) {
      try {
        await prisma.event.create({
          data: event,
        });
        console.log(`✅ 已创建事件: ${event.title}`);
      } catch (error) {
        console.error(`❌ 创建事件失败: ${event.title}`, error);
      }
    }

    // 6. Seed Persons
    console.log('\n👤 导入人物...');
    for (const person of sampleData.persons) {
      try {
        await prisma.person.create({
          data: person,
        });
        console.log(`✅ 已创建人物: ${person.name}`);
      } catch (error) {
        console.error(`❌ 创建人物失败: ${person.name}`, error);
      }
    }

    // 7. Seed Tang Figures
    console.log('\n🏛️ 导入唐朝人物...');
    for (const figure of sampleData.tangFigures) {
      try {
        await prisma.tangFigure.create({
          data: {
            ...figure,
            dynastyId: tangDynasty.id,
            achievements: JSON.stringify(figure.achievements),
            works: JSON.stringify(figure.works),
          },
        });
        console.log(`✅ 已创建唐朝人物: ${figure.name}`);
      } catch (error) {
        console.error(`❌ 创建唐朝人物失败: ${figure.name}`, error);
      }
    }

    // 8. Seed Mythologies
    console.log('\n🐲 导入神话传说...');
    for (const mythology of sampleData.mythologies) {
      try {
        await prisma.mythology.create({
          data: {
            ...mythology,
            stories: JSON.stringify(mythology.stories),
            symbolism: JSON.stringify(mythology.symbolism),
          },
        });
        console.log(`✅ 已创建神话: ${mythology.name}`);
      } catch (error) {
        console.error(`❌ 创建神话失败: ${mythology.name}`, error);
      }
    }

    console.log('\n✨ 综合数据导入完成！');
    
    // Print summary
    const counts = await Promise.all([
      prisma.dynasty.count(),
      prisma.emperor.count(),
      prisma.person.count(),
      prisma.event.count(),
      prisma.tangFigure.count(),
      prisma.scholar.count(),
      prisma.philosophicalSchool.count(),
      prisma.mythology.count(),
    ]);

    console.log('\n📊 数据库统计:');
    console.log(`朝代: ${counts[0]} 条`);
    console.log(`皇帝: ${counts[1]} 条`);
    console.log(`人物: ${counts[2]} 条`);
    console.log(`事件: ${counts[3]} 条`);
    console.log(`唐朝人物: ${counts[4]} 条`);
    console.log(`学者: ${counts[5]} 条`);
    console.log(`哲学流派: ${counts[6]} 条`);
    console.log(`神话传说: ${counts[7]} 条`);

  } catch (error) {
    console.error('❌ 数据导入过程中发生错误:', error);
  }
}

seedComprehensiveData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });