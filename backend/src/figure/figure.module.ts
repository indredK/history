import { Module } from '@nestjs/common';
import { FigureController } from './figure.controller';
import { FigureService } from './figure.service';

@Module({
  controllers: [FigureController],
  providers: [FigureService],
  exports: [FigureService],
})
export class FigureModule {}