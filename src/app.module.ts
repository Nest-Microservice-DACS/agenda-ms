import { Module } from '@nestjs/common';
import { AgendaModule } from './agenda/agenda.module';


@Module({
  imports: [AgendaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
