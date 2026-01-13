import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AgendaService } from './agenda.service';
import {
  ChangeTurnoStatusDto,
  CreateTurnoDto,
  TurnoPaginationDto,
  UpdateTurnoDto,
} from './dto';

@Controller()
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @MessagePattern({ cmd: 'create_turno' })
  create(@Payload() createTurnoDto: CreateTurnoDto) {
    return this.agendaService.create(createTurnoDto);
  }

  @MessagePattern({ cmd: 'get_turnos' })
  findAll(@Payload() turnoPaginationDto: TurnoPaginationDto) {
    return this.agendaService.findAll(turnoPaginationDto);
  }

  @MessagePattern({ cmd: 'get_turno_by_cirugia_id' })
  findOne(@Payload() cirugiaId: number) {
    return this.agendaService.findById(cirugiaId);
  }

  @MessagePattern({ cmd: 'update_turno' })
  update(@Payload() updateTurnoDto: UpdateTurnoDto) {
    return this.agendaService.update(updateTurnoDto.id, updateTurnoDto);
  }

  // @MessagePattern({ cmd: 'change_turno_status' })
  // changeStatus(@Payload() changeTurnoStatusDto: ChangeTurnoStatusDto) {
  //   return this.agendaService.changeStatus(changeTurnoStatusDto);
  // }

  @MessagePattern({ cmd: 'remove_turno' })
  remove(@Payload() cirugiaId: number) {
    return this.agendaService.remove(cirugiaId);
  }
}
