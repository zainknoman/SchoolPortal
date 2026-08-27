// Local dev seed — creates one school, two campuses, one class/section, one teacher, one student
// with two linked parent accounts. Run with: npx tsx prisma/seed.ts (or wire into package.json).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as argon2 from 'argon2';

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
  const prisma = new PrismaClient({ adapter });

  const school = await prisma.school.create({ data: { name: 'The Seeds School' } });

  const [gulistan, gulshan] = await Promise.all([
    prisma.campus.create({ data: { schoolId: school.id, name: 'Gulistan-e-Jauhar' } }),
    prisma.campus.create({ data: { schoolId: school.id, name: 'Gulshan-e-Iqbal' } }),
  ]);

  const session = await prisma.academicSession.create({
    data: { label: '2026-2027', startDate: new Date('2026-08-01'), endDate: new Date('2027-06-30'), isActive: true },
  });

  const grade3 = await prisma.class.create({
    data: { campusId: gulistan.id, academicSessionId: session.id, name: 'Grade 3' },
  });
  const section3A = await prisma.section.create({ data: { classId: grade3.id, name: '3A' } });

  const teacherUser = await prisma.user.create({
    data: {
      identifier: 'teacher@seeds.edu.pk',
      passwordHash: await argon2.hash('ChangeMe123!'),
      role: 'TEACHER',
    },
  });
  const teacher = await prisma.teacher.create({ data: { userId: teacherUser.id, name: 'Ms. Sample Teacher' } });

  const student = await prisma.student.create({
    data: { campusId: gulistan.id, sectionId: section3A.id, grNumber: 'GR-1001', name: 'Eshaal Sample' },
  });

  // A second, unused campus row (Gulshan) demonstrates the schema handles multi-campus without a
  // second student attached — proves campus is data, not an assumption baked into one row.
  void gulshan;

  const parentPassword = await argon2.hash('ChangeMe123!');
  const [parentAUser, parentBUser] = await Promise.all([
    prisma.user.create({ data: { identifier: 'parent-a@seeds.edu.pk', passwordHash: parentPassword, role: 'PARENT' } }),
    prisma.user.create({ data: { identifier: 'parent-b@seeds.edu.pk', passwordHash: parentPassword, role: 'PARENT' } }),
  ]);

  const [parentAProfile, parentBProfile] = await Promise.all([
    prisma.parentProfile.create({ data: { userId: parentAUser.id, name: 'Parent A' } }),
    prisma.parentProfile.create({ data: { userId: parentBUser.id, name: 'Parent B' } }),
  ]);

  await Promise.all([
    prisma.studentParent.create({ data: { studentId: student.id, parentProfileId: parentAProfile.id, relationship: 'mother' } }),
    prisma.studentParent.create({ data: { studentId: student.id, parentProfileId: parentBProfile.id, relationship: 'father' } }),
  ]);

  console.log('Seeded: 1 school, 2 campuses, 1 class/section, 1 teacher, 1 student, 2 linked parents.');
  console.log('Login as parent-a@seeds.edu.pk / ChangeMe123! (or parent-b@... / teacher@...) — dev only.');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
