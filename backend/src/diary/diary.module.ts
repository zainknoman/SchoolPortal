import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { StudentAccessService } from '../common/student-access.service';

@Module({
  providers: [DiaryService, StudentAccessService],
  controllers: [DiaryController],
})
export class DiaryModule {}
