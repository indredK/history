// This file allows you to create seed data for your database.
// See docs for more details: https://docs.prisma.io/orm/prisma-client/setup-and-configuration/databases/seed-your-database

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据导入...\n');

  // 1. 创建来源记录
  const sources = [
    { title: '史记', author: '司马迁', license: 'CC0', confidence: 0.95 },
    { title: '《资治通鉴》', author: '司马光', license: 'CC0', confidence: 0.90 },
    { title: 'CHGIS v6.0', license: 'CC-BY-4.0', confidence: 0.95 },
  ];

  const createdSources = [];
  for (const source of sources) {
    const s = await prisma.source.upsert({
      where: { title: source.title },
      update: {},
      create: source,
    });
    createdSources.push(s);
  }
  console.log(`✅ 来源 (Sources): ${createdSources.length} 条`);

  // 2. 导入人物数据
  const personsPath = path.join(__dirname, '../..', 'data', 'raw', 'persons.csv');
  if (fs.existsSync(personsPath)) {
    const personsData = fs.readFileSync(personsPath, 'utf-8');
    const persons = parse(personsData, { columns: true });

    let count = 0;
    for (const row of persons) {
      try {
        await prisma.person.create({
          data: {
            name: row.name,
            nameEn: row.name_en || undefined,
            birthYear: row.birth_year ? parseInt(row.birth_year) : null,
            birthMonth: row.birth_month ? parseInt(row.birth_month) : null,
            deathYear: row.death_year ? parseInt(row.death_year) : null,
            deathMonth: row.death_month ? parseInt(row.death_month) : null,
            biography: row.biography || undefined,
            roles: row.roles ? row.roles.split(',').map(r => r.trim()) : [],
            sourceIds: createdSources[0]?.id ? [createdSources[0].id] : [],
          },
        });
        count++;
      } catch (e) {
        console.error(`❌ 人物导入失败: ${row.name}`, e);
      }
    }
    console.log(`✅ 人物 (Persons): ${count} 条`);
  }

  // 3. 导入事件数据
  const eventsPath = path.join(__dirname, '../..', 'data', 'raw', 'events.csv');
  if (fs.existsSync(eventsPath)) {
    const eventsData = fs.readFileSync(eventsPath, 'utf-8');
    const events = parse(eventsData, { columns: true });

    let count = 0;
    for (const row of events) {
      try {
        await prisma.event.create({
          data: {
            title: row.title,
            titleEn: row.title_en || undefined,
            startYear: parseInt(row.start_year),
            startMonth: row.start_month ? parseInt(row.start_month) : null,
            endYear: parseInt(row.end_year),
            endMonth: row.end_month ? parseInt(row.end_month) : null,
            description: row.description || undefined,
            eventType: row.event_type || 'other',
            sourceIds: createdSources[1]?.id ? [createdSources[1].id] : [],
          },
        });
        count++;
      } catch (e) {
        console.error(`❌ 事件导入失败: ${row.title}`, e);
      }
    }
    console.log(`✅ 事件 (Events): ${count} 条`);
  }

  // 4. 导入地点数据
  const placesPath = path.join(__dirname, '../..', 'data', 'raw', 'places.csv');
  if (fs.existsSync(placesPath)) {
    const placesData = fs.readFileSync(placesPath, 'utf-8');
    const places = parse(placesData, { columns: true });

    let count = 0;
    for (const row of places) {
      try {
        await prisma.place.create({
          data: {
            canonicalName: row.canonical_name,
            altNames: row.alt_names ? row.alt_names.split(',').map(n => n.trim()) : [],
            description: row.description || undefined,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            sourceIds: createdSources[2]?.id ? [createdSources[2].id] : [],
          },
        });
        count++;
      } catch (e) {
        console.error(`❌ 地点导入失败: ${row.canonical_name}`, e);
      }
    }
    console.log(`✅ 地点 (Places): ${count} 条`);
  }

  console.log('\n✨ 数据导入完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
