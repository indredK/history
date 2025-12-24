import { Module } from '@nestjs/common';
import { ReligionController, ReligionsController } from './religion.controller';
import { ReligionService } from './religion.service';

@Module({
  controllers: [ReligionController, ReligionsController],
  providers: [ReligionService],
  exports: [ReligionService],
})
export class ReligionModule {}