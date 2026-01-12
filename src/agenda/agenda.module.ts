import { Module } from '@nestjs/common';
import { AgendaController } from './agenda.controller';

@Module({
  controllers: [AgendaController],
  providers: [],
  imports: [],
})
export class AgendaModule {}
