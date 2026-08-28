import { Test } from '@nestjs/testing';
import { SectionsService } from './sections.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SectionsService', () => {
  let service: SectionsService;
  let prisma: {
    enrollment: { findMany: jest.Mock };
    section: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      enrollment: { findMany: jest.fn() },
      section: { findMany: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(SectionsService);
  });

  it('lists all sections with their class/campus names', async () => {
    prisma.section.findMany.mockResolvedValue([
      {
        id: 'sec-1',
        name: '3A',
        class: { name: 'Grade 3', campus: { name: 'Gulistan-e-Jauhar' } },
      },
    ]);

    const result = await service.listAll();

    expect(result).toEqual([
      {
        id: 'sec-1',
        name: '3A',
        className: 'Grade 3',
        campusName: 'Gulistan-e-Jauhar',
      },
    ]);
  });

  it('lists students with an active enrollment in a section, ordered by name', async () => {
    prisma.enrollment.findMany.mockResolvedValue([
      { student: { id: 's1', name: 'Eshaal', grNumber: 'GR-1001' } },
    ]);

    const result = await service.getStudents('sec-1');

    expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
      where: { sectionId: 'sec-1', status: 'ACTIVE' },
      orderBy: { student: { name: 'asc' } },
      select: { student: { select: { id: true, name: true, grNumber: true } } },
    });
    expect(result).toEqual([{ id: 's1', name: 'Eshaal', grNumber: 'GR-1001' }]);
  });
});
