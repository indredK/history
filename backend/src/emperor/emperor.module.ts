import { Module } from '@nestjs/common';
import { EmperorController } from './emperor.controller';
import { EmperorService } from './emperor.service';

@Module({
  controllers: [EmperorController],
  providers: [EmperorService],
  exports: [EmperorService],
})
export class EmperorModule {}
