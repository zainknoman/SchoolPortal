import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';
import { EnrollmentService } from '../enrollment/enrollment.service';

export interface TimetableEntrySummary {
  id: string;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string | null;
  room: string | null;
}

@Injectable()
export class TimetableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async getForStudent(studentId: string): Promise<TimetableEntrySummary[]> {
    const enrollment =
      await this.enrollmentService.getCurrentEnrollment(studentId);

    const entries = await this.prisma.timetable.findMany({
      where: { sectionId: enrollment.sectionId },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
      include: { subject: true, teacher: true },
    });

    return entries.map((e) => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      period: e.period,
      startTime: e.startTime,
      endTime: e.endTime,
      subject: e.subject.name,
      teacher: e.teacher?.name ?? null,
      room: e.room,
    }));
  }

  async createEntry(dto: CreateTimetableEntryDto) {
    return this.prisma.timetable.create({ data: dto });
  }
}
