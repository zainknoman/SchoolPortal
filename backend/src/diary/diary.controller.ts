import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DiaryService } from './diary.service';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { StudentAccessService, RequestUser } from '../common/student-access.service';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

@Controller('api/v1')
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly studentAccess: StudentAccessService,
  ) {}

  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post('diary')
  createEntry(@Body() dto: CreateDiaryEntryDto, @Req() req: AuthenticatedRequest) {
    return this.diaryService.createEntry(dto, req.user.id);
  }

  @Get('students/:id/diary')
  async getForStudent(
    @Param('id') studentId: string,
    @Query('month') month: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.studentAccess.assertCanAccessStudent(req.user, studentId);
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    return this.diaryService.getForStudent(studentId, targetMonth);
  }

  @Roles('TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTS', 'SUPER_ADMIN')
  @Get('sections/:id/diary')
  getForSection(@Param('id') sectionId: string, @Query('month') month: string) {
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    return this.diaryService.getForSection(sectionId, targetMonth);
  }
}
