import { Controller, Get } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles('TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTS', 'SUPER_ADMIN')
  @Get()
  listAll() {
    return this.subjectsService.listAll();
  }
}
