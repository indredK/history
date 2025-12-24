import { Module } from '@nestjs/common';
import { SongController } from './song/song.controller';
import { SongService } from './song/song.service';
import { TangController } from './tang/tang.controller';
import { TangService } from './tang/tang.service';
import { MingController } from './ming/ming.controller';
import { MingService } from './ming/ming.service';
import { YuanController } from './yuan/yuan.controller';
import { YuanService } from './yuan/yuan.service';
import { QingController } from './qing/qing.controller';
import { QingService } from './qing/qing.service';
import { SanguoController } from './sanguo/sanguo.controller';
import { SanguoService } from './sanguo/sanguo.service';
import { FigureBaseService } from './common/figure-base.service';

@Module({
  controllers: [
    SongController,
    TangController,
    MingController,
    YuanController,
    QingController,
    SanguoController,
  ],
  providers: [
    FigureBaseService,
    SongService,
    TangService,
    MingService,
    YuanService,
    QingService,
    SanguoService,
  ],
  exports: [
    SongService,
    TangService,
    MingService,
    YuanService,
    QingService,
    SanguoService,
  ],
})
export class FigureModule {}