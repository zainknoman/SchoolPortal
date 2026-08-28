import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { StudentAccessService } from '../common/student-access.service';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Module({
  providers: [TimetableService, StudentAccessService, EnrollmentService],
  controllers: [TimetableController],
})
export class TimetableModule {}
