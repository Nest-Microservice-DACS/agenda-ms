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
  ChangeTurnoStatusDto,
  CreateTurnoDto,
  TurnoPaginationDto,
  UpdateTurnoDto,
} from './dto';

@Injectable()
export class AgendaService
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

  private readonly logger = new Logger(AgendaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma conectado a la base de datos');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma desconectado de la base de datos');
  }

  async create(createTurnoDto: CreateTurnoDto) {
    try {
      // 1. Buscar todos los slots del quirófano en el rango de tiempo
      const inicio = new Date(createTurnoDto.startTime);
      const fin = new Date(createTurnoDto.endTime);
      const slotsEnRango = await this.agenda_slot.findMany({
        where: {
          quirofanoId: createTurnoDto.quirofanoId,
          startTime: { lt: fin },
          endTime: { gt: inicio },
        },
        orderBy: { startTime: 'asc' },
      });

      // 2. Verificar que todos estén libres
      const todosLibres = slotsEnRango.every(slot => slot.status === 'AVAILABLE');
      if (!todosLibres || slotsEnRango.length === 0) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'No hay suficientes slots disponibles para el turno solicitado',
        });
      }

      // 3. Actualizar todos los slots a BOOKED y asociarles los datos del turno
      const idsAReservar = slotsEnRango.map(slot => slot.id);
      await this.agenda_slot.updateMany({
        where: { id: { in: idsAReservar } },
        data: {
          ...createTurnoDto,
          status: 'BOOKED',
        },
      });

      // Retornar los slots reservados
      return await this.agenda_slot.findMany({ where: { id: { in: idsAReservar } } });
    } catch (error) {
      this.logger.error('Error al crear turno', error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear turno',
        error: error?.message || error,
      });
    }
  }

  async findAll(turnoPaginationDto: TurnoPaginationDto) {
    try {
      // filtro dinámico
      const where: any = {};
      if (
        turnoPaginationDto.status !== undefined &&
        turnoPaginationDto.status !== null
      ) {
        where.status = turnoPaginationDto.status;
      }
      if (
        turnoPaginationDto.quirofanoId !== undefined &&
        turnoPaginationDto.quirofanoId !== null
      ) {
        where.quirofanoId = turnoPaginationDto.quirofanoId;
      }
      if (turnoPaginationDto.fechaInicio) {
        where.startTime = { gte: new Date(turnoPaginationDto.fechaInicio) };
      }
      if (turnoPaginationDto.fechaFin) {
        where.endTime = { lte: new Date(turnoPaginationDto.fechaFin) };
      }

      const totalPages = await this.agenda_slot.count({ where });
      const currentPage = turnoPaginationDto.page;
      const pageSize = turnoPaginationDto.size;

      // Solo agregar skip/take si están definidos y son números válidos
      const findManyOptions: any = { where };
      if (typeof currentPage === 'number' && typeof pageSize === 'number' && !isNaN(currentPage) && !isNaN(pageSize)) {
        findManyOptions.skip = (currentPage - 1) * pageSize;
        findManyOptions.take = pageSize;
      }
      return {
        data: await this.agenda_slot.findMany(findManyOptions),
        meta: {
          total: totalPages,
          page: currentPage,
          lastPage: Math.ceil(totalPages / pageSize),
        },
      };
    } catch (error) {
      this.logger.error('Error al obtener turnos', error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener turnos',
        error: error?.message || error,
      });
    }
  }

  async findById(id: number) {
    const turno = await this.agenda_slot.findUnique({ where: { id } });

    if (!turno) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Turno con ID ${id} no encontrado`,
      });
    }

    return turno;
  }

  async update(id: number, data: UpdateTurnoDto) {
    try {
      return await this.agenda_slot.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(`Error al actualizar turno con ID ${id}`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error al actualizar turno con ID ${id}`,
        error: error?.message || error,
      });
    }
  }

  async changeStatus(changeTurnoStatusDto: ChangeTurnoStatusDto) {
    const { cirugiaId, status } = changeTurnoStatusDto;
    const turno = await this.agenda_slot.findFirst({ where: { cirugiaId } });

    if (!turno) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Turno con cirugiaId ${cirugiaId} no encontrado`,
      });
    }
    if (turno.status === status) {
      return turno;
    }

    await this.agenda_slot.updateMany({
      where: { cirugiaId },
      data: { status },
    });

    return this.agenda_slot.findMany({ where: { cirugiaId } });
  }

  async remove(cirugiaId: number) {
    const turno = await this.agenda_slot.findFirst({ where: { cirugiaId } });

    if (!turno) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Turno con cirugiaId ${cirugiaId} no encontrado`,
      });
    }
    await this.agenda_slot.updateMany({
      where: { cirugiaId },
      data: { cirugiaId: null, status: 'AVAILABLE', updatedAt: null },
    });
    return {
      message: `Turno con cirugiaId ${cirugiaId} liberado exitosamente`,
    };
  }
}


  

  