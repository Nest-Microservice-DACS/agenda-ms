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
import { CreateTurnoDto, TurnoPaginationDto, UpdateTurnoDto } from './dto';

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

  async create(data: CreateTurnoDto) {
    return this.agenda_slot.create({ data });
  }

  async findAll(turnoPaginationDto: TurnoPaginationDto) {
    const totalPages = await this.agenda_slot.count({
      where: {
        // status: ,
      },
    });

    const currentPage = turnoPaginationDto.page;
    const pageSize = turnoPaginationDto.size;

    return {
      data: await this.agenda_slot.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        where: {
        //  status: turnoPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / pageSize),
      },
    };
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
    return this.agenda_slot.update({
      where: { id },
      data,
    });
  }

  async changeStatus(changeTurnoStatusDto: ChangeTurnoStatusDto) {
    const { id, status } = changeTurnoStatusDto;
    const turno = await this.agenda_slot.findUnique({ where: { id } });

    if (!turno) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Turno con ID ${id} no encontrado`,
      });
    }
    if (turno.status === status) {
      return turno;
    }

    return this.agenda_slot.update({ where: { id }, data: { status: status } });
  }
}
