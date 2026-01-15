import { Module } from '@nestjs/common';
import { AgendaModule } from './agenda/schedule.module';


@Module({
  imports: [AgendaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
