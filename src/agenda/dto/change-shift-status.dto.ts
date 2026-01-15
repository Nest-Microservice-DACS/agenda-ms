import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ShiftStatus } from 'generated/prisma/client';
import { ShiftStatusList } from '../enum/agenda.enum';

export class ChangeShiftStatusDto {
  @IsNumber()
  @IsPositive()
  surgeryId: number;

  @IsEnum(ShiftStatusList, {
    message: `Possible status values are ${Object.values(ShiftStatusList).join(', ')}`,
  })
  status: ShiftStatus;
}
