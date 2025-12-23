import { Module } from '@nestjs/common';
import { ReligionController } from './religion.controller';
import { ReligionService } from './religion.service';

@Module({
  controllers: [ReligionController],
  providers: [ReligionService],
  exports: [ReligionService],
})
export class ReligionModule {}