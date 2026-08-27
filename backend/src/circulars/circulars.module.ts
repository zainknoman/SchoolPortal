import { Module } from '@nestjs/common';
import { CircularsService } from './circulars.service';
import { CircularsController } from './circulars.controller';

@Module({
  providers: [CircularsService],
  controllers: [CircularsController],
})
export class CircularsModule {}
