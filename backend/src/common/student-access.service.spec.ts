import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { StudentAccessService } from './student-access.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StudentAccessService', () => {
  let service: StudentAccessService;
  let prisma: { studentParent: { findFirst: jest.Mock } };

  beforeEach(async () => {
    prisma = { studentParent: { findFirst: jest.fn() } };
    const moduleRef = await Test.createTestingModule({
      providers: [
        StudentAccessService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(StudentAccessService);
  });

  it('allows a TEACHER to access any student without a DB lookup', async () => {
    await expect(
      service.assertCanAccessStudent(
        { id: 'u1', role: 'TEACHER' },
        'student-1',
      ),
    ).resolves.toBeUndefined();
    expect(prisma.studentParent.findFirst).not.toHaveBeenCalled();
  });

  it('allows SCHOOL_ADMIN and SUPER_ADMIN to access any student', async () => {
    await expect(
      service.assertCanAccessStudent(
        { id: 'u1', role: 'SCHOOL_ADMIN' },
        'student-1',
      ),
    ).resolves.toBeUndefined();
    await expect(
      service.assertCanAccessStudent(
        { id: 'u1', role: 'SUPER_ADMIN' },
        'student-1',
      ),
    ).resolves.toBeUndefined();
  });

  it('allows a PARENT linked to the student', async () => {
    prisma.studentParent.findFirst.mockResolvedValue({ id: 'link-1' });

    await expect(
      service.assertCanAccessStudent(
        { id: 'parent-user-1', role: 'PARENT' },
        'student-1',
      ),
    ).resolves.toBeUndefined();

    expect(prisma.studentParent.findFirst).toHaveBeenCalledWith({
      where: {
        studentId: 'student-1',
        parentProfile: { userId: 'parent-user-1' },
      },
    });
  });

  it('rejects a PARENT NOT linked to the student — the core isolation guarantee', async () => {
    prisma.studentParent.findFirst.mockResolvedValue(null);

    await expect(
      service.assertCanAccessStudent(
        { id: 'parent-user-1', role: 'PARENT' },
        'someone-elses-child',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
