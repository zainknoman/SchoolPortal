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
    return this.prisma.student.findMany({
      where: { sectionId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, grNumber: true },
    });
  }
}
