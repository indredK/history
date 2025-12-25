import { Module } from '@nestjs/common';
import { ScholarController } from './scholar.controller';
import { SchoolController } from './school.controller';
import { CultureService } from './culture.service';

@Module({
  controllers: [ScholarController, SchoolController],
  providers: [CultureService],
  exports: [CultureService],
})
export class CultureModule {}
