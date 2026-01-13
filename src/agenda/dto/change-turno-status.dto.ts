import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { AgendaStatus } from 'generated/prisma/client';
import { AgendaStatusList } from '../enum/agenda.enum';

export class ChangeTurnoStatusDto {
  @IsNumber()
  @IsPositive()
  cirugiaId: number;

  @IsEnum(AgendaStatusList, {
    message: `Possible status values are ${Object.values(AgendaStatusList).join(', ')}`,
  })
  status: AgendaStatus;
}
