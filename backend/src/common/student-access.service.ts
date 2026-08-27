import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STAFF_ROLES = ['TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTS', 'SUPER_ADMIN'];

export interface RequestUser {
  id: string;
  role: string;
}

/**
 * The one place that decides "can this caller see/act on this student's records" — shared by
 * Timetable, Attendance, and every later module (Diary, Circulars, Fees) so the parent-isolation
 * rule is enforced identically everywhere, not re-implemented per module.
 */
@Injectable()
export class StudentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanAccessStudent(
    user: RequestUser,
    studentId: string,
  ): Promise<void> {
    if (STAFF_ROLES.includes(user.role)) {
      return;
    }

    // PARENT (or any other non-staff role): must have a StudentParent link, never a broader query
    // the caller could widen.
    const link = await this.prisma.studentParent.findFirst({
      where: { studentId, parentProfile: { userId: user.id } },
    });

    if (!link) {
      throw new ForbiddenException('You do not have access to this student');
    }
  }
}
