import { IsEnum, IsOptional } from 'class-validator';
import { AgendaStatusList } from '../enum/agenda.enum';
import { AgendaStatus } from 'generated/prisma/enums';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class TurnoPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(AgendaStatusList, {
    message: `Possible status values are ${Object.values(AgendaStatusList).join(', ')}`,
  })
  status: AgendaStatus;
}
