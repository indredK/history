import { Module } from '@nestjs/common';
import { DynastyController } from './dynasty.controller';
import { DynastyService } from './dynasty.service';

@Module({
  controllers: [DynastyController],
  providers: [DynastyService],
  exports: [DynastyService],
})
export class DynastyModule {}