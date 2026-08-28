import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * The one place every module resolves "what section/campus is this student in" — mirrors
 * StudentAccessService's role as a single shared read path, so this rule isn't re-implemented
 * (and re-broken) per module the way it was before Enrollment existed (Diary and Timetable each
 * read `student.sectionId` directly, which meant a mid-year section change silently rewrote what
 * a parent saw for past months).
 */
@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentEnrollment(studentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, status: 'ACTIVE' },
      orderBy: { startDate: 'desc' },
    });
    if (!enrollment) {
      throw new NotFoundException('Student has no active enrollment');
    }
    return enrollment;
  }

  /**
   * Resolves which section a student belonged to as of a given date — NOT the student's current
   * section. Use for any month/date-scoped query (e.g. Diary) so a later section transfer doesn't
   * retroactively change what a past month shows.
   */
  async getEnrollmentForDate(studentId: string, date: Date) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        startDate: { lte: date },
        OR: [{ endDate: null }, { endDate: { gte: date } }],
      },
      orderBy: { startDate: 'desc' },
    });
    if (!enrollment) {
      throw new NotFoundException('Student has no enrollment covering this date');
    }
    return enrollment;
  }
}
