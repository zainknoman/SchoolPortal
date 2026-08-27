import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TimetableService } from './timetable.service';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';
import {
  StudentAccessService,
  RequestUser,
} from '../common/student-access.service';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

@Controller('api/v1')
export class TimetableController {
  constructor(
    private readonly timetableService: TimetableService,
    private readonly studentAccess: StudentAccessService,
  ) {}

  @Get('students/:id/timetable')
  async getForStudent(
    @Param('id') studentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.studentAccess.assertCanAccessStudent(req.user, studentId);
    return this.timetableService.getForStudent(studentId);
  }

  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post('timetable')
  createEntry(@Body() dto: CreateTimetableEntryDto) {
    return this.timetableService.createEntry(dto);
  }
}
