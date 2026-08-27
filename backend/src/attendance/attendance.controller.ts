import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import {
  StudentAccessService,
  RequestUser,
} from '../common/student-access.service';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

@Controller('api/v1')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly studentAccess: StudentAccessService,
  ) {}

  @Get('students/:id/attendance')
  async getForStudent(
    @Param('id') studentId: string,
    @Query('month') month: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.studentAccess.assertCanAccessStudent(req.user, studentId);
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    return this.attendanceService.getForStudent(studentId, targetMonth);
  }

  // Deliberately NOT guarded by StudentAccessService's parent-allow path — @Roles restricts this
  // to staff outright, so a PARENT token is rejected before ever reaching the service.
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post('attendance')
  markAttendance(
    @Body() dto: MarkAttendanceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attendanceService.markAttendance(dto, req.user.id);
  }
}
