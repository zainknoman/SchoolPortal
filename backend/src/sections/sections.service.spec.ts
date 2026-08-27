import { Test } from '@nestjs/testing';
import { SectionsService } from './sections.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SectionsService', () => {
  let service: SectionsService;
  let prisma: {
    student: { findMany: jest.Mock };
    section: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      student: { findMany: jest.fn() },
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

  it('lists students in a section ordered by name', async () => {
    prisma.student.findMany.mockResolvedValue([
      { id: 's1', name: 'Eshaal', grNumber: 'GR-1001' },
    ]);

    const result = await service.getStudents('sec-1');

    expect(prisma.student.findMany).toHaveBeenCalledWith({
      where: { sectionId: 'sec-1' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, grNumber: true },
    });
    expect(result).toEqual([{ id: 's1', name: 'Eshaal', grNumber: 'GR-1001' }]);
  });
});
