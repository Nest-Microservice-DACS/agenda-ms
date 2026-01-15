import { IsDate, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ShiftStatusList } from '../enum/agenda.enum';
import { ShiftStatus } from 'generated/prisma/enums';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Type } from 'class-transformer';

export class ShiftPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ShiftStatusList, {
    message: `Possible status values are ${Object.values(ShiftStatusList).join(', ')}`,
  })
  status: ShiftStatus;

  @IsOptional()
  @Type(() => Number)
  operatingRoomId: number;

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  startDate: string;

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  endDate: string;
}
