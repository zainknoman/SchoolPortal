import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { StudentAccessService } from '../common/student-access.service';

@Module({
  providers: [TimetableService, StudentAccessService],
  controllers: [TimetableController],
})
export class TimetableModule {}
