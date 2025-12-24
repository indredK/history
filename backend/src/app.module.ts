import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DynastyModule } from './dynasty/dynasty.module';
import { PersonModule } from './person/person.module';
import { EmperorModule } from './emperor/emperor.module';
import { FigureModule } from './figure/figure.module';
import { EventModule } from './event/event.module';
import { CultureModule } from './culture/culture.module';
import { MythologyModule } from './mythology/mythology.module';
import { ReligionModule } from './religion/religion.module';
import { MapModule } from './map/map.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    DynastyModule,
    PersonModule,
    EmperorModule,
    FigureModule,
    EventModule,
    CultureModule,
    MythologyModule,
    ReligionModule,
    MapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
