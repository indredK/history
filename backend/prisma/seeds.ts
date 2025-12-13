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
    { title: '史记', author: '司马迁', license: 'CC0' },
    { title: '《资治通鉴》', author: '司马光', license: 'CC0' },
    { title: 'CHGIS v6.0', license: 'CC-BY-4.0' },
  ];

  const createdSources = [];
  for (const source of sources) {
    const s = await prisma.source.create({
      data: source,
    }).catch(() => null); // 避免重复创建
    if (s) createdSources.push(s);
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
        const person = await prisma.person.create({
          data: {
            name: row.name,
            birthYear: row.birth_year ? parseInt(row.birth_year) : null,
            deathYear: row.death_year ? parseInt(row.death_year) : null,
            biography: row.biography || undefined,
          },
        });
        
        // 创建来源关联
        if (createdSources.length > 0) {
          await prisma.personSource.create({
            data: {
              personId: person.id,
              sourceId: createdSources[0].id,
            },
          }).catch(() => null);
        }
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
        const event = await prisma.event.create({
          data: {
            title: row.title,
            startYear: parseInt(row.start_year),
            endYear: parseInt(row.end_year) || parseInt(row.start_year),
            description: row.description || undefined,
            eventType: row.event_type || 'other',
          },
        });

        // 创建来源关联
        if (createdSources.length > 1) {
          await prisma.eventSource.create({
            data: {
              eventId: event.id,
              sourceId: createdSources[1].id,
            },
          }).catch(() => null);
        }
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
        const place = await prisma.place.create({
          data: {
            name: row.canonical_name || row.name,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
          },
        });

        // 创建来源关联
        if (createdSources.length > 2) {
          await prisma.placeSource.create({
            data: {
              placeId: place.id,
              sourceId: createdSources[2].id,
            },
          }).catch(() => null);
        }
        count++;
      } catch (e) {
        console.error(`❌ 地点导入失败: ${row.canonical_name || row.name}`, e);
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
