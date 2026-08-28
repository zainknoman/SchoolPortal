import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SectionSummary {
  id: string;
  name: string;
  className: string;
  campusName: string;
}

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(): Promise<SectionSummary[]> {
    const sections = await this.prisma.section.findMany({
      include: { class: { include: { campus: true } } },
      orderBy: { name: 'asc' },
    });

    return sections.map((s) => ({
      id: s.id,
      name: s.name,
      className: s.class.name,
      campusName: s.class.campus.name,
    }));
  }

  async getStudents(sectionId: string) {
    const rows = await this.prisma.enrollment.findMany({
      where: { sectionId, status: 'ACTIVE' },
      orderBy: { student: { name: 'asc' } },
      select: { student: { select: { id: true, name: true, grNumber: true } } },
    });
    return rows.map((r) => r.student);
  }
}
