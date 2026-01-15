import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ShiftStatusList } from '../enum/agenda.enum';
import { ShiftStatus } from 'generated/prisma/client';
import { Type } from 'class-transformer';

export class CreateShiftDto {
  @IsNumber()
  @IsPositive()
  operatingRoomId: number;

  @IsDateString()
  @Type(() => Date)
  startTime: string;

  @IsDateString()
  @Type(() => Date)
  endTime: string;

  // @IsOptional()
  // @IsEnum(AgendaStatusList, { message: `Possible status values are ${Object.values(AgendaStatusList).join(", ")}` })
  // status: AgendaStatus = AgendaStatus.BOOKED;

  @IsNumber()
  @IsPositive()
  surgeryId: number;

  @IsNumber()
  @IsPositive()
  version?: number;
}
