import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { TimelineController } from './timeline.controller';
import { EventService } from './event.service';

@Module({
  controllers: [EventController, TimelineController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
