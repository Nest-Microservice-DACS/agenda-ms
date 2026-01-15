import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  HttpStatus,
} from '@nestjs/common';

import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { RpcException } from '@nestjs/microservices';
import {
  ChangeShiftStatusDto,
  CreateShiftDto,
  ShiftPaginationDto,
  UpdateShiftDto,
} from './dto';

@Injectable()
export class ScheduleService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;
  private adapter: PrismaPg;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
    this.adapter = adapter;
  }

  private readonly logger = new Logger(ScheduleService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connectated to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from the database');
  }

  async create(createShiftDto: CreateShiftDto) {
    try {
      // 1. Buscar todos los slots del quirófano en el rango de tiempo
      const inicio = new Date(createShiftDto.startTime);
      const fin = new Date(createShiftDto.endTime);
      const slotsEnRango = await this.shift_slot.findMany({
        where: {
          operatingRoomId: createShiftDto.operatingRoomId,
          startTime: { lt: fin },
          endTime: { gt: inicio },
        },
        orderBy: { startTime: 'asc' },
      });

      // 2. Verificar que todos estén libres
      const todosLibres = slotsEnRango.every(
        (slot) => slot.status === 'AVAILABLE',
      );
      if (!todosLibres || slotsEnRango.length === 0) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message:
            'No hay suficientes slots disponibles para el turno solicitado',
        });
      }

      // 3. Actualizar todos los slots a BOOKED y asociarles los datos del turno
      const idsAReservar = slotsEnRango.map((slot) => slot.id);
      await this.shift_slot.updateMany({
        where: { id: { in: idsAReservar } },
        data: {
          surgeryId: createShiftDto.surgeryId,
          status: 'BOOKED',
        },
      });

      // Retornar los slots reservados
      return await this.shift_slot.findMany({
        where: { id: { in: idsAReservar } },
      });
    } catch (error) {
      this.logger.error('Error al crear turno', error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear turno',
        error: error?.message || error,
      });
    }
  }

  async findAll(shiftPaginationDto: ShiftPaginationDto) {
    try {
      // filtro dinámico
      const where: any = {};
      if (
        shiftPaginationDto.status !== undefined &&
        shiftPaginationDto.status !== null
      ) {
        where.status = shiftPaginationDto.status;
      }
      if (
        shiftPaginationDto.operatingRoomId !== undefined &&
        shiftPaginationDto.operatingRoomId !== null
      ) {
        where.operatingRoomId = shiftPaginationDto.operatingRoomId;
      }
      if (shiftPaginationDto.startDate) {
        where.startTime = { gte: new Date(shiftPaginationDto.startDate) };
      }
      if (shiftPaginationDto.endDate) {
        where.endTime = { lte: new Date(shiftPaginationDto.endDate) };
      }

      const totalPages = await this.shift_slot.count({ where });
      const currentPage = shiftPaginationDto.page;
      const pageSize = shiftPaginationDto.size;

      // Solo agregar skip/take si están definidos y son números válidos
      const findManyOptions: any = { where };
      if (
        typeof currentPage === 'number' &&
        typeof pageSize === 'number' &&
        !isNaN(currentPage) &&
        !isNaN(pageSize)
      ) {
        findManyOptions.skip = (currentPage - 1) * pageSize;
        findManyOptions.take = pageSize;
      }
      return {
        data: await this.shift_slot.findMany(findManyOptions),
        meta: {
          total: totalPages,
          page: currentPage,
          lastPage: Math.ceil(totalPages / pageSize),
        },
      };
    } catch (error) {
      this.logger.error('Error on shift slots retrieval', error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error on shift slots retrieval',
        error: error?.message || error,
      });
    }
  }

  async findById(id: number) {
    const turno = await this.shift_slot.findUnique({ where: { id } });

    if (!turno) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Shift with ID ${id} not found`,
      });
    }

    return turno;
  }

  async update(id: number, data: UpdateShiftDto) {
    try {
      return await this.shift_slot.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(`Error on shift ${id} update`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error on shift ${id} update`,
        error: error?.message || error,
      });
    }
  }

  async changeStatus(changeShiftStatusDto: ChangeShiftStatusDto) {
    const { surgeryId: surgeryId, status } = changeShiftStatusDto;
    const turno = await this.shift_slot.findFirst({ where: { surgeryId } });

    if (!turno) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Shift with ID ${surgeryId} not found`,
      });
    }
    if (turno.status === status) {
      return turno;
    }

    await this.shift_slot.updateMany({
      where: { surgeryId },
      data: { status },
    });

    return this.shift_slot.findMany({ where: { surgeryId } });
  }

  async remove(surgeryId: number) {
    const shifts = await this.shift_slot.findMany({ where: { surgeryId } });

    if (!shifts || shifts.length === 0) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `No shifts found with surgeryId ${surgeryId}`,
      });
    }

    // Eliminar todos los slots con ese cirugiaId
    await this.shift_slot.updateMany({ where: { surgeryId }, data: { status: 'AVAILABLE', surgeryId: null} });

    return {
      message: `Shifts with surgeryId ${surgeryId} successfully removed`,
      cantidad: shifts.length,
    };
  }
}
