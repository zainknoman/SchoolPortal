import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TimetableService', () => {
  let service: TimetableService;
  let prisma: {
    student: { findUnique: jest.Mock };
    timetable: { findMany: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      student: { findUnique: jest.fn() },
      timetable: { findMany: jest.fn(), create: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TimetableService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(TimetableService);
  });

  it("returns the student's section timetable ordered by day then period", async () => {
    prisma.student.findUnique.mockResolvedValue({
      id: 's1',
      sectionId: 'sec-1',
    });
    prisma.timetable.findMany.mockResolvedValue([
      {
        id: 't1',
        dayOfWeek: 1,
        period: 1,
        startTime: '08:00',
        endTime: '08:40',
        room: '3A',
        subject: { name: 'English' },
        teacher: { name: 'Ms. Sample' },
      },
    ]);

    const result = await service.getForStudent('s1');

    expect(prisma.timetable.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sectionId: 'sec-1' },
        orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
      }),
    );
    expect(result[0]).toEqual(
      expect.objectContaining({
        subject: 'English',
        teacher: 'Ms. Sample',
        room: '3A',
      }),
    );
  });

  it('throws NotFoundException for an unknown student', async () => {
    prisma.student.findUnique.mockResolvedValue(null);

    await expect(service.getForStudent('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates a timetable entry', async () => {
    prisma.timetable.create.mockResolvedValue({ id: 't2' });

    const dto = {
      sectionId: 'sec-1',
      subjectId: 'sub-1',
      dayOfWeek: 2,
      period: 1,
      startTime: '08:00',
      endTime: '08:40',
    };
    await service.createEntry(dto);

    expect(prisma.timetable.create).toHaveBeenCalledWith({ data: dto });
  });
});
