import { Module } from '@nestjs/common';
import { MythologyController } from './mythology.controller';
import { MythologyService } from './mythology.service';

@Module({
  controllers: [MythologyController],
  providers: [MythologyService],
  exports: [MythologyService],
})
export class MythologyModule {}
