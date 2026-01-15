import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ScheduleService } from './schedule.service';
import {
  ChangeShiftStatusDto,
  CreateShiftDto,
  ShiftPaginationDto,
  UpdateShiftDto,
} from './dto';
import { Cons } from 'rxjs';

@Controller()
export class ShiftController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @MessagePattern({ cmd: 'create_shift' })
  create(@Payload() createShiftDto: CreateShiftDto) {
    return this.scheduleService.create(createShiftDto);
  }

  @MessagePattern({ cmd: 'get_shifts' })
  findAll(@Payload() shiftPaginationDto: ShiftPaginationDto) {
    return this.scheduleService.findAll(shiftPaginationDto);
  }

  @MessagePattern({ cmd: 'get_shift_by_surgery_id' })
  findOne(@Payload() surgeryId: number) {
    return this.scheduleService.findById(surgeryId);
  }

  @MessagePattern({ cmd: 'update_shift' })
  update(@Payload() updateShiftDto: UpdateShiftDto) {
    return this.scheduleService.update(updateShiftDto.id, updateShiftDto);
  }

  // @MessagePattern({ cmd: 'change_shift_status' })
  // changeStatus(@Payload() changeShiftStatusDto: ChangeShiftStatusDto) {
  //   return this.scheduleService.changeStatus(changeShiftStatusDto);
  // }

  @MessagePattern({ cmd: 'remove_shift' })
  remove(@Payload() surgeryId: number) {
    return this.scheduleService.remove(surgeryId);
  }
}
