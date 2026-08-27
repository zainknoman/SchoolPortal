import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as argon2 from 'argon2';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Me / children (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const password = 'CorrectHorseBattery9!';

  const ids: {
    school?: string;
    campus?: string;
    session?: string;
    class?: string;
    section?: string;
  } = {};

  async function loginAs(identifier: string) {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier, password })
      .expect(201);
    return res.body.accessToken as string;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();

    const school = await prisma.school.create({
      data: { name: 'ME2E School' },
    });
    const campus = await prisma.campus.create({
      data: { schoolId: school.id, name: 'Main' },
    });
    const session = await prisma.academicSession.create({
      data: {
        label: 'ME2E',
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
      },
    });
    const klass = await prisma.class.create({
      data: {
        campusId: campus.id,
        academicSessionId: session.id,
        name: 'ME2E Grade',
      },
    });
    const section = await prisma.section.create({
      data: { classId: klass.id, name: 'ME2E-A' },
    });
    Object.assign(ids, {
      school: school.id,
      campus: campus.id,
      session: session.id,
      class: klass.id,
      section: section.id,
    });

    const passwordHash = await argon2.hash(password);

    const [parentAUser, parentBUser] = await Promise.all([
      prisma.user.create({
        data: {
          identifier: 'me2e-parent-a@seeds.edu.pk',
          passwordHash,
          role: 'PARENT',
        },
      }),
      prisma.user.create({
        data: {
          identifier: 'me2e-parent-b@seeds.edu.pk',
          passwordHash,
          role: 'PARENT',
        },
      }),
    ]);
    const [parentAProfile, parentBProfile] = await Promise.all([
      prisma.parentProfile.create({
        data: { userId: parentAUser.id, name: 'ME2E Parent A' },
      }),
      prisma.parentProfile.create({
        data: { userId: parentBUser.id, name: 'ME2E Parent B' },
      }),
    ]);

    const [childA, childB] = await Promise.all([
      prisma.student.create({
        data: {
          campusId: campus.id,
          sectionId: section.id,
          grNumber: 'ME2E-A1',
          name: 'Child A',
        },
      }),
      prisma.student.create({
        data: {
          campusId: campus.id,
          sectionId: section.id,
          grNumber: 'ME2E-B1',
          name: 'Child B',
        },
      }),
    ]);

    await Promise.all([
      prisma.studentParent.create({
        data: { studentId: childA.id, parentProfileId: parentAProfile.id },
      }),
      prisma.studentParent.create({
        data: { studentId: childB.id, parentProfileId: parentBProfile.id },
      }),
    ]);
  });

  afterAll(async () => {
    // Cascade deletes handle children/students/sections/classes/sessions/campuses via onDelete: Cascade.
    await prisma.school
      .delete({ where: { id: ids.school } })
      .catch(() => undefined);
    await prisma.user
      .deleteMany({
        where: {
          identifier: {
            in: ['me2e-parent-a@seeds.edu.pk', 'me2e-parent-b@seeds.edu.pk'],
          },
        },
      })
      .catch(() => undefined);
    await app.close();
  });

  it("returns only the authenticated parent's own child, never the other parent's", async () => {
    const tokenA = await loginAs('me2e-parent-a@seeds.edu.pk');

    const res = await request(app.getHttpServer())
      .get('/api/v1/me/children')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Child A');
    expect(res.body[0].campus).toBe('Main');
  });

  it('rejects the request entirely with no token', async () => {
    await request(app.getHttpServer()).get('/api/v1/me/children').expect(401);
  });
});
