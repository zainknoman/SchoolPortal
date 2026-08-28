import { Test } from '@nestjs/testing';
import { MeService } from './me.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MeService', () => {
  let service: MeService;
  let prisma: {
    parentProfile: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      parentProfile: { findUnique: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [MeService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(MeService);
  });

  it('returns every child linked to the authenticated parent, with campus/class/section', async () => {
    prisma.parentProfile.findUnique.mockResolvedValue({
      id: 'pp-1',
      children: [
        {
          student: {
            id: 's-1',
            name: 'Eshaal',
            grNumber: 'GR-1001',
            enrollments: [
              {
                campus: { id: 'c-1', name: 'Gulistan-e-Jauhar' },
                section: {
                  id: 'sec-1',
                  name: '3A',
                  class: { id: 'cl-1', name: 'Grade 3' },
                },
              },
            ],
          },
        },
        {
          student: {
            id: 's-2',
            name: 'Ahmed',
            grNumber: 'GR-2002',
            enrollments: [
              {
                campus: { id: 'c-2', name: 'Gulshan-e-Iqbal' },
                section: {
                  id: 'sec-2',
                  name: '6B',
                  class: { id: 'cl-2', name: 'Grade 6' },
                },
              },
            ],
          },
        },
      ],
    });

    const children = await service.getChildrenForUser('user-1');

    expect(children).toHaveLength(2);
    expect(children[0]).toEqual({
      id: 's-1',
      name: 'Eshaal',
      grNumber: 'GR-1001',
      campus: 'Gulistan-e-Jauhar',
      class: 'Grade 3',
      section: '3A',
    });
    expect(children[1].campus).toBe('Gulshan-e-Iqbal');
  });

  it('returns an empty list for a user with no parent profile (e.g. a teacher/admin account)', async () => {
    prisma.parentProfile.findUnique.mockResolvedValue(null);

    const children = await service.getChildrenForUser('user-teacher');

    expect(children).toEqual([]);
  });

  it('never leaks a child that is not linked to this parent, even if it exists in the school', async () => {
    // The query itself is scoped to `where: { userId }` in the service — this test just pins the
    // contract: the returned list is exactly (and only) parentProfile.children, nothing broader.
    prisma.parentProfile.findUnique.mockResolvedValue({
      id: 'pp-1',
      children: [
        {
          student: {
            id: 's-1',
            name: 'Eshaal',
            grNumber: 'GR-1001',
            enrollments: [
              {
                campus: { id: 'c-1', name: 'Gulistan-e-Jauhar' },
                section: {
                  id: 'sec-1',
                  name: '3A',
                  class: { id: 'cl-1', name: 'Grade 3' },
                },
              },
            ],
          },
        },
      ],
    });

    const children = await service.getChildrenForUser('user-1');

    expect(children.map((c) => c.id)).toEqual(['s-1']);
    expect(prisma.parentProfile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });
});
