import { Module } from '@nestjs/common';
import { MapController, MapDataController } from './map.controller';
import { MapService } from './map.service';

@Module({
  controllers: [MapController, MapDataController],
  providers: [MapService],
})
export class MapModule {}
