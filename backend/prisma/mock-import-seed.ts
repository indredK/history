import { prisma } from '../src/prisma/prisma.extension';
import fs from 'fs';
import path from 'path';

const JSON_DATA_PATH = path.resolve(__dirname, '../../frontend/public/data/json');

async function readJson(filename: string) {
  const filePath = path.join(JSON_DATA_PATH, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ 文件不存在: ${filename}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function main() {
  console.log('🚀 开始从前端 Mock 数据导入到后端数据库...');

  // 1. 朝代 (Dynasties)
  console.log('\n🏛️ 导入朝代...');
  const dynastiesData = await readJson('dynasties.json');
  if (dynastiesData) {
    for (const d of dynastiesData) {
      // 兼容两种后缀的处理
      const name = d.name.endsWith('朝') || d.name.endsWith('代') ? d.name : d.name + '朝';
      await prisma.dynasty.upsert({
        where: { name: name },
        update: {
          startYear: d.startYear || 0,
          endYear: d.endYear,
          description: d.description,
        },
        create: {
          name: name,
          startYear: d.startYear || 0,
          endYear: d.endYear,
          description: d.description,
        },
      });
    }
  }

  // 找到常用的朝代 ID 以便后续关联
  const dynasties = await prisma.dynasty.findMany();
  const getDynastyId = (name: string) => {
    if (!name) return null;
    const normalized = name.endsWith('朝') || name.endsWith('代') ? name : name + '朝';
    return dynasties.find(d => d.name === normalized || d.name.includes(name))?.id || null;
  };

  // 2. 哲学流派 (Schools)
  console.log('\n📚 导入哲学流派...');
  const schoolsData = await readJson('schools.json');
  if (schoolsData) {
    for (const s of schoolsData) {
      await prisma.philosophicalSchool.upsert({
        where: { name: s.name },
        update: {
          founder: s.founder,
          foundingYear: s.foundingYear,
          coreBeliefs: s.coreBeliefs,
          keyTexts: s.keyTexts,
          description: s.description,
        },
        create: {
          name: s.name,
          founder: s.founder,
          foundingYear: s.foundingYear,
          coreBeliefs: s.coreBeliefs,
          keyTexts: s.keyTexts,
          description: s.description,
        },
      });
    }
  }
  const schools = await prisma.philosophicalSchool.findMany();

  // 3. 学者 (Scholars)
  console.log('\n👨‍🎓 导入学者...');
  const scholarsData = await readJson('scholars.json');
  if (scholarsData) {
    for (const s of scholarsData) {
      const schoolId = schools.find(sch => sch.name === s.schoolOfThought)?.id || null;
      await prisma.scholar.create({
        data: {
          name: s.name,
          dynastyPeriod: s.dynasty,
          birthYear: s.birthYear,
          deathYear: s.deathYear,
          philosophicalSchoolId: schoolId,
          majorWorks: s.representativeWorks || s.majorWorks,
          contributions: s.achievements || s.contributions,
          biography: s.biography,
        },
      }).catch((err: any) => console.error(`❌ 学者 ${s.name} 导入失败:`, err.message));
    }
  }

  // 4. 三国人物 (Sanguo Figures)
  console.log('\n⚔️ 导入三国人物...');
  const sanguoData = await readJson('sanguo_figures.json');
  if (sanguoData) {
    for (const f of sanguoData) {
      await prisma.sanguoFigure.create({
        data: {
          name: f.name,
          courtesy: f.courtesy,
          role: f.role || 'other',
          kingdom: f.kingdom || '其他',
          birthYear: f.birthYear || f.birth_year,
          deathYear: f.deathYear || f.death_year,
          positions: f.positions,
          faction: f.faction,
          biography: f.biography,
          politicalViews: f.politicalViews || f.political_views,
          achievements: f.achievements,
          events: f.events,
          evaluations: f.evaluations,
          sources: f.sources,
        }
      }).catch((err: any) => console.error(`❌ 三国人物 ${f.name} 导入失败:`, err.message));
    }
  }

  // 朝代人物映射表
  const dynastyFiguresFiles = [
    { file: 'tang_figures.json', model: 'tangFigure', dynasty: '唐朝' },
    { file: 'song_figures.json', model: 'songFigure', dynasty: '宋朝' },
    { file: 'yuan_figures.json', model: 'yuanFigure', dynasty: '元朝' },
    { file: 'ming_figures.json', model: 'mingFigure', dynasty: '明朝' },
    { file: 'qing_figures.json', model: 'qingRuler', dynasty: '清朝' },
  ];

  for (const item of dynastyFiguresFiles) {
    console.log(`\n🏛️ 导入 ${item.dynasty} 人物...`);
    const data = await readJson(item.file);
    const dynastyId = getDynastyId(item.dynasty);
    if (data && dynastyId) {
      for (const f of data) {
        // @ts-ignore
        await prisma[item.model].create({
          data: {
            name: f.name,
            dynastyId: dynastyId,
            courtesy: f.courtesy,
            role: f.role || (item.model === 'qingRuler' ? 'emperor' : 'other'),
            birthYear: f.birthYear || f.birth_year,
            deathYear: f.deathYear || f.death_year,
            positions: f.positions,
            faction: f.faction,
            biography: f.biography,
            politicalViews: f.politicalViews || f.political_views,
            achievements: f.achievements,
            events: f.events,
            evaluations: f.evaluations,
            sources: f.sources || (f.source ? [f.source] : []),
            // 清朝特有字段
            ...(item.model === 'qingRuler' ? {
              templeName: f.templeName,
              eraName: f.eraName,
              reignStart: f.reignStart,
              reignEnd: f.reignEnd,
              policies: f.policies,
              majorEvents: f.majorEvents,
              contribution: f.contribution,
              responsibility: f.responsibility,
            } : {})
          }
        }).catch((err: any) => console.error(`❌ ${item.dynasty}人物 ${f.name} 导入失败:`, err.message));
      }
    }
  }

  // 5. 皇帝 (Emperors from persons.json)
  console.log('\n👑 导入皇帝 (persons.json)...');
  const personsData = await readJson('persons.json');
  if (personsData) {
    for (const p of personsData) {
      if (p.roles?.includes('emperor')) {
        // 尝试推断朝代
        let dId = null;
        if (p.biography?.includes('秦')) dId = getDynastyId('秦');
        else if (p.biography?.includes('汉')) dId = getDynastyId('汉');
        else if (p.biography?.includes('唐')) dId = getDynastyId('唐');
        else if (p.biography?.includes('宋')) dId = getDynastyId('宋');
        else if (p.biography?.includes('明')) dId = getDynastyId('明');
        else if (p.biography?.includes('清')) dId = getDynastyId('清');

        if (dId) {
          await prisma.emperor.create({
            data: {
              name: p.name,
              dynastyId: dId,
              reignStart: p.birth_year + 20, // 粗略估计
              birthYear: p.birth_year,
              deathYear: p.death_year,
              biography: p.biography,
              achievements: p.achievements ? [p.achievements] : [],
            }
          }).catch(() => {});
        }
      }
      
      // 同时导入到通用人物表
      await prisma.person.create({
        data: {
          name: p.name,
          birthYear: p.birth_year,
          deathYear: p.death_year,
          biography: p.biography,
        }
      }).catch(() => {});
    }
  }

  // 6. 历史事件 (Events)
  console.log('\n📅 导入历史事件...');
  const eventsData = await readJson('events.json');
  if (eventsData) {
    for (const e of eventsData) {
      await prisma.event.create({
        data: {
          title: e.title,
          startYear: e.startYear || e.start_year || 0,
          endYear: e.endYear || e.end_year,
          description: e.description,
          eventType: e.eventType || e.event_type || 'other',
        }
      }).catch(() => {});
    }
  }

  // 7. 神话传说 (Mythologies)
  console.log('\n🐲 导入神话传说...');
  const mythData = await readJson('mythologies.json');
  if (mythData) {
    for (const m of mythData) {
      await prisma.mythology.create({
        data: {
          name: m.title || m.name,
          category: m.category || 'other',
          description: m.description,
          stories: m.characters ? [m.characters] : [],
          origin: m.source,
        }
      }).catch(() => {});
    }
  }

  // 8. 宗教 (Religions)
  console.log('\n✨ 导入宗教数据...');
  const relData = await readJson('religions.json');
  if (relData && relData.nodes) {
    const nodeMap = new Map();
    for (const n of relData.nodes) {
      try {
        const node = await prisma.religionNode.create({
          data: {
            name: n.name,
            nodeType: n.type || 'other',
            tradition: n.sect || 'other',
            description: n.description,
          }
        });
        nodeMap.set(n.id, node.id);
      } catch (err) {}
    }

    if (relData.edges) {
      for (const e of relData.edges) {
        const sourceId = nodeMap.get(e.source);
        const targetId = nodeMap.get(e.target);
        if (sourceId && targetId) {
          await prisma.religionEdge.create({
            data: {
              sourceNodeId: sourceId,
              targetNodeId: targetId,
              relationship: e.label || 'related',
            }
          }).catch(() => {});
        }
      }
    }
  }

  console.log('\n✅ 所有 Mock 数据导入完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
