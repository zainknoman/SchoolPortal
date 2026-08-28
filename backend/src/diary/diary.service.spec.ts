import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DiaryService', () => {
  let service: DiaryService;
  let prisma: {
    diaryEntry: { upsert: jest.Mock; findMany: jest.Mock };
    diaryAttachment: { deleteMany: jest.Mock; createMany: jest.Mock };
    student: { findUnique: jest.Mock };
    auditLog: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      diaryEntry: { upsert: jest.fn(), findMany: jest.fn() },
      diaryAttachment: { deleteMany: jest.fn(), createMany: jest.fn() },
      student: { findUnique: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [DiaryService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(DiaryService);
  });

  it('creates a diary entry (upsert on sectionId+subjectId+date), using the caller as authorId, and writes an audit log entry', async () => {
    prisma.diaryEntry.upsert.mockResolvedValue({ id: 'entry-1' });

    await service.createEntry(
      { sectionId: 'sec-1', subjectId: 'sub-1', date: '2026-08-27', text: 'Read chapter 3.' },
      'user-1',
    );

    expect(prisma.diaryEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          sectionId_subjectId_date: {
            sectionId: 'sec-1',
            subjectId: 'sub-1',
            date: new Date('2026-08-27'),
          },
        },
        create: expect.objectContaining({ text: 'Read chapter 3.', authorId: 'user-1' }),
        update: expect.objectContaining({ text: 'Read chapter 3.', authorId: 'user-1' }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'diary.create', entity: 'DiaryEntry' }),
      }),
    );
  });

  it('creates a diary entry authored by a SCHOOL_ADMIN/SUPER_ADMIN caller directly — no Teacher profile lookup', async () => {
    prisma.diaryEntry.upsert.mockResolvedValue({ id: 'entry-2' });

    await service.createEntry(
      { sectionId: 'sec-1', subjectId: 'sub-1', date: '2026-08-27', text: 'Admin-posted note.' },
      'admin-user-1',
    );

    expect(prisma.diaryEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ authorId: 'admin-user-1' }),
      }),
    );
  });

  it('attaches the given files, replacing any previous attachments on the same entry', async () => {
    prisma.diaryEntry.upsert.mockResolvedValue({ id: 'entry-1' });

    await service.createEntry(
      {
        sectionId: 'sec-1',
        subjectId: 'sub-1',
        date: '2026-08-27',
        text: 'Read chapter 3.',
        fileIds: ['file-1', 'file-2'],
      },
      'user-1',
    );

    expect(prisma.diaryAttachment.deleteMany).toHaveBeenCalledWith({
      where: { diaryEntryId: 'entry-1' },
    });
    expect(prisma.diaryAttachment.createMany).toHaveBeenCalledWith({
      data: [
        { diaryEntryId: 'entry-1', fileId: 'file-1' },
        { diaryEntryId: 'entry-1', fileId: 'file-2' },
      ],
    });
  });

  it("resolves a student's own section before listing that section's entries", async () => {
    prisma.student.findUnique.mockResolvedValue({ id: 's1', sectionId: 'sec-1' });
    prisma.diaryEntry.findMany.mockResolvedValue([]);

    await service.getForStudent('s1', '2026-08');

    expect(prisma.diaryEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ sectionId: 'sec-1' }) }),
    );
  });

  it('throws NotFoundException for an unknown student', async () => {
    prisma.student.findUnique.mockResolvedValue(null);
    await expect(service.getForStudent('missing', '2026-08')).rejects.toThrow(NotFoundException);
  });

  it('maps entries to the summary shape the clients expect', async () => {
    prisma.diaryEntry.findMany.mockResolvedValue([
      {
        id: 'entry-1',
        date: new Date('2026-08-27'),
        dueDate: new Date('2026-08-29'),
        text: 'Read chapter 3.',
        subject: { name: 'Urdu' },
        attachments: [
          { file: { id: 'file-1', originalName: 'sheet.pdf', mimeType: 'application/pdf' } },
        ],
      },
    ]);

    const result = await service.getForSection('sec-1', '2026-08');

    expect(result).toEqual([
      {
        id: 'entry-1',
        date: '2026-08-27',
        dueDate: '2026-08-29',
        subject: 'Urdu',
        text: 'Read chapter 3.',
        attachments: [{ id: 'file-1', originalName: 'sheet.pdf', mimeType: 'application/pdf' }],
      },
    ]);
  });
});
