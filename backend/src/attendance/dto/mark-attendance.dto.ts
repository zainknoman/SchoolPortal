import { IsDateString, IsIn, IsString, MinLength } from 'class-validator';

export const ATTENDANCE_STATUSES = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'LEAVE',
  'HOLIDAY',
] as const;

export class MarkAttendanceDto {
  @IsString()
  @MinLength(1)
  studentId!: string;

  @IsDateString()
  date!: string;

  @IsIn(ATTENDANCE_STATUSES)
  status!: (typeof ATTENDANCE_STATUSES)[number];
}
