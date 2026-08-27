import { Controller, Get, Param } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Roles('TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTS', 'SUPER_ADMIN')
  @Get()
  listAll() {
    return this.sectionsService.listAll();
  }

  @Roles('TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTS', 'SUPER_ADMIN')
  @Get(':id/students')
  getStudents(@Param('id') sectionId: string) {
    return this.sectionsService.getStudents(sectionId);
  }
}
