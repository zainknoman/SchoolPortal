import { Test } from '@nestjs/testing';
import { TimetableService } from './timetable.service';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentService } from '../enrollment/enrollment.service';

describe('TimetableService', () => {
  let service: TimetableService;
  let prisma: { timetable: { findMany: jest.Mock; create: jest.Mock } };
  let enrollmentService: { getCurrentEnrollment: jest.Mock };

  beforeEach(async () => {
    prisma = { timetable: { findMany: jest.fn(), create: jest.fn() } };
    enrollmentService = { getCurrentEnrollment: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TimetableService,
        { provide: PrismaService, useValue: prisma },
        { provide: EnrollmentService, useValue: enrollmentService },
      ],
    }).compile();
    service = moduleRef.get(TimetableService);
  });

  it("returns the student's current-enrollment section timetable ordered by day then period", async () => {
    enrollmentService.getCurrentEnrollment.mockResolvedValue({
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

    expect(enrollmentService.getCurrentEnrollment).toHaveBeenCalledWith('s1');
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
