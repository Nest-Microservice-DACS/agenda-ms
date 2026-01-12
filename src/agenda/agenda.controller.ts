import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AgendaService } from './agenda.service';
import { CreateTurnoDto, UpdateTurnoDto } from './dto';

@Controller()
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @MessagePattern({cmd: 'create_turno'})
  create(@Payload() createTurnoDto: CreateTurnoDto) {
    return this.agendaService.create(createTurnoDto);
  }

  @MessagePattern({cmd: 'find_all_turnos'})
  findAll() {
    return this.agendaService.findAll();
  }

  @MessagePattern({cmd: 'find_one_turno'})
  findOne(@Payload() id: number) {
    return this.agendaService.findById(id);
  }

  @MessagePattern({cmd: 'update_turno'})
  update(@Payload() updateTurnoDto: UpdateTurnoDto) {
    return this.agendaService.update(updateTurnoDto.id, updateTurnoDto);
  }

  @MessagePattern({cmd: 'remove_turno'})
  remove(@Payload() changeTurnoStatusDto: ChangeTurnoStatusDto) {
    return this.agendaService.changeStatus(changeTurnoStatusDto);
  }
}
