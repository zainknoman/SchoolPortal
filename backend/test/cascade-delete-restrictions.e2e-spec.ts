import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Historical-record delete restrictions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();

    const school = await prisma.school.create({ data: { name: 'CDR E2E School' } });
    const campus = await prisma.campus.create({ data: { schoolId: school.id, name: 'Main' } });
    const session = await prisma.academicSession.create({
      data: { label: 'CDR', startDate: new Date(), endDate: new Date(), isActive: true },
    });
    const klass = await prisma.class.create({
      data: { campusId: campus.id, academicSessionId: session.id, name: 'CDR Grade' },
    });
    const section = await prisma.section.create({ data: { classId: klass.id, name: 'CDR-A' } });
    const teacherUser = await prisma.user.create({
      data: { identifier: 'cdr-teacher@seeds.edu.pk', passwordHash: 'x', role: 'TEACHER' },
    });
    const teacher = await prisma.teacher.create({
      data: { userId: teacherUser.id, name: 'CDR Teacher' },
    });
    const student = await prisma.student.create({ data: { grNumber: 'CDR-1', name: 'CDR Student' } });
    studentId = student.id;
    await prisma.enrollment.create({
      data: {
        studentId,
        campusId: campus.id,
        sectionId: section.id,
        academicSessionId: session.id,
        startDate: session.startDate,
        status: 'ACTIVE',
      },
    });
    await prisma.attendance.create({
      data: { studentId, date: new Date(), status: 'PRESENT', markedById: teacher.id },
    });
  });

  afterAll(async () => {
    await prisma.attendance.deleteMany({ where: { studentId } }).catch(() => undefined);
    await prisma.student.deleteMany({ where: { id: studentId } }).catch(() => undefined);
    await prisma.school.deleteMany({ where: { name: 'CDR E2E School' } }).catch(() => undefined);
    await prisma.user.deleteMany({ where: { identifier: 'cdr-teacher@seeds.edu.pk' } }).catch(() => undefined);
    await app.close();
  });

  it('refuses to delete a student with attendance history instead of silently wiping it', async () => {
    await expect(prisma.student.delete({ where: { id: studentId } })).rejects.toThrow();

    const stillThere = await prisma.attendance.findFirst({ where: { studentId } });
    expect(stillThere).not.toBeNull();
  });
});
