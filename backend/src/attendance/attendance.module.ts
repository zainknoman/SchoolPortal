import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { StudentAccessService } from '../common/student-access.service';

@Module({
  providers: [AttendanceService, StudentAccessService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
