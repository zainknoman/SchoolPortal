import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChildSummary {
  id: string;
  name: string;
  grNumber: string;
  campus: string;
  class: string;
  section: string;
}

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Only ever returns students linked to THIS parent's profile (via StudentParent) — a parent can
   * never fetch a child they are not linked to, because the query is scoped by userId, not by an
   * open student/campus filter the caller could widen.
   */
  async getChildrenForUser(userId: string): Promise<ChildSummary[]> {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            student: {
              include: {
                campus: true,
                section: { include: { class: true } },
              },
            },
          },
        },
      },
    });

    if (!parentProfile) {
      return [];
    }

    return parentProfile.children.map(({ student }) => ({
      id: student.id,
      name: student.name,
      grNumber: student.grNumber,
      campus: student.campus.name,
      class: student.section.class.name,
      section: student.section.name,
    }));
  }
}
