import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { AgendaStatusList } from '../enum/agenda.enum';
import { AgendaStatus } from 'generated/prisma/client';
import { Type } from 'class-transformer';

export class CreateTurnoDto {
  @IsNumber()
  @IsPositive()
  quirofanoId: number;

  @IsDateString()
  @Type(() => Date)
  startTime: Date;

  @IsDateString()
  @Type(() => Date)
  endTime: Date;

  @IsOptional()
  @IsEnum(AgendaStatusList, { message: `Possible status values are ${Object.values(AgendaStatusList).join(", ")}` })
  status: AgendaStatus = AgendaStatus.BOOKED;

  @IsNumber()
  @IsPositive()
  cirugiaId: number;

  @IsNumber()
  @IsPositive()
  version?: number;
}
