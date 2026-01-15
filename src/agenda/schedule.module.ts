import { Module } from '@nestjs/common';
import { ShiftController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  controllers: [ShiftController],
  providers: [ScheduleService],
  imports: [],
})
export class AgendaModule {}
