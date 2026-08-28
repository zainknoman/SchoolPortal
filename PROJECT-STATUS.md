# SEEDS Digital Platform — Project Status

Living checklist. Update this file (don't just report progress in chat) whenever a feature lands
or scope changes. Spec source: `Seeds/apk/MVP-Plan-V3.md` (validated MVP plan) → `plan/docs/FEATURES.txt`
(FEAT-001..014, full detail).

**Architecture:** one NestJS+Prisma backend, two clients — a Vue staff console (Teacher + Admin/
Accounts, role-gated, one app) and a Flutter parent app. Public website refresh and a parent web
portal are separate, lower-priority tracks (see Deferred below), not part of this build.

Repo: https://github.com/zainknoman/SchoolPortal

---

## Sprint 1 — Foundation ✅ DONE

- [x] **FEAT-001** — Prisma schema (all Tier-1+2 entities), migrations, seed script
      (school, 2 campuses, class/section, teacher, admin, student, 2 linked parents)
- [x] **FEAT-002** — Auth + RBAC: login (email/GR-number + password), JWT access+refresh, argon2
      hashing, account lockout after 5 failed attempts, server-enforced `@Roles()`/`@Public()` guards
- [x] **FEAT-003** — Multi-campus + multi-child data model, `/api/v1/me/children` (parent-isolation
      verified by e2e test — a parent can never see another parent's child)
- [x] Backend hardening: CORS enabled, global `ValidationPipe` (DTOs actually enforced)

## Sprint 2 — Staff console + parent app shells ✅ DONE

- [x] **FEAT-004** — Staff console (Vue): login screen, role-gated shell (Teacher vs Admin/
      Accounts — nav items absent from the DOM per role, not CSS-hidden), router guards, session
      persistence, logout
- [x] **FEAT-005** — Parent app (Flutter): login screen, secure session (`flutter_secure_storage`),
      multi-child switcher wired to the real `/me/children` endpoint, router guards, bottom nav
      shell (Home/Calendar/Notifications/Messages/Fees/More placeholders)
- [x] Design system (ui-ux-pro-max, curated) applied to both clients — Plus Jakarta Sans,
      navy/blue-accent palette, one consistent brand (`staff-console/design-system/seeds-staff-console/MASTER.md`)

## Sprint 3-4 — Timetable + Attendance ✅ DONE

- [x] **FEAT-006** — Timetable: `GET /students/:id/timetable` (ownership-checked) + `POST
      /timetable` (Admin/Super Admin only); parent-app Calendar tab lists day/period/time/subject/
      teacher/room
- [x] **FEAT-007** — Attendance: `POST /attendance` (TEACHER/Admin/Super Admin only — a PARENT
      token is rejected outright, e2e-verified) writes an AuditLog row every time; `GET
      /students/:id/attendance?month=` returns today's status + a monthly day list + a summary
      (holiday-excluded attendance %); staff-console Teacher gets a real attendance-marking screen
      (section → roster → per-student status → save); parent-app Calendar tab shows it all
- [x] New shared `StudentAccessService` (parent-isolation check) + `GET /sections` /
      `GET /sections/:id/students` (staff-only, needed so the staff console can pick who to mark)
- Verified: 31 backend unit + 13 e2e, 14 staff-console, 12 parent-app tests — all passing, all
  three lint/type-check/build clean

## Dev environment note (2026-08-27)

- [x] Fixed: local dev seed (`backend/prisma/seed.ts`) created school/campus/class/section/teacher/
      admin/student/parents but never a Timetable or Attendance row (gap left over from FEAT-001;
      Sprint 3-4 added those features but never touched the seed script) — parent-app Calendar tab
      and any timetable/attendance query against a freshly seeded `dev.db` was correctly empty, not
      broken. Seed now also creates a Mon-Fri/6-period timetable for section 3A and 10 weekdays of
      attendance for the seeded student. Re-seed with `npx prisma migrate deploy` +
      `npm run prisma:seed` after deleting `dev.db` to pick this up in an existing local checkout.
- Reminder: none of backend (`npm run start:dev`, :3000), staff-console (`npm run dev`, :5173), or
  parent-app (`flutter run -d chrome`, needs `D:\dev\flutter\bin` on PATH) auto-start — a "blank app"
  is almost always one of these three not running, check that before assuming a code bug.
- Reminder (2026-08-28): `backend/dev.db` is git-ignored, so each git worktree (and the main
  checkout) has its own separate SQLite file — merging a branch that added Prisma migrations does
  NOT apply them to the main checkout's `dev.db`, and the Prisma Client there stays stale until
  `npx prisma generate` runs against the merged schema. After merging any branch with schema
  changes, run `npx prisma generate` then `npx prisma migrate deploy` (or delete `dev.db` and
  redo migrate+seed from scratch, per the Sprint 3-4 note above) in the checkout you'll actually
  run the app from.

## Sprint 5-6 — Diary + Circulars ✅ DONE

- [x] **FEAT-008** — Diary/homework: per-subject entries, attachments, due dates, correct Urdu RTL
      rendering (no auto-translation) — teacher/admin-authored (`POST /diary` accepts
      TEACHER/SCHOOL_ADMIN/SUPER_ADMIN), section-scoped, staff-console compose screen + parent-app
      Diary sub-tab (3rd tab of the Calendar screen)
- [x] **FEAT-009** — Circulars: school/section scope, attachments, read/unread tracking (delivered
      vs read counts visible to admin) — staff-console publish screen (Admin/Super Admin) + parent-app
      Circulars tab (fills the Notifications bottom-nav slot, unread badge)
- [x] New shared Files module (`POST/GET /files/:id`, local-disk storage behind a swappable
      `STORAGE_ADAPTER` token — S3 swap later is a one-file change) and Urdu RTL/font-detection
      helpers (`detectDirection`/`DirectionalText`, one implementation per client, pure Unicode
      script detection, no translation)
- Verified: 15 backend unit suites/53 tests + 5 e2e suites/21 tests, 7 staff-console files/24
  tests, parent-app 20/20 tests — all passing on both the feature branch and after merge to main;
  lint/type-check clean on both clients
- Follow-up (tracked, not blocking, deferred from the final review): no upload size limit/type
  filter on `POST /files`; no orphaned-file cleanup when an entry is re-posted or a create fails
  post-upload; the `?access_token=` JWT-in-query fallback is global rather than scoped to the
  files route; `Circular` school-wide fan-out and staff file access have no school/campus
  boundary (fine today — single-school system — but will need one before a second school is
  onboarded). Bundle into a short "file-storage hardening" pass before any non-local deployment.

## Sprint 7-8 — Messages + Notifications 🔜 NEXT

- [ ] **FEAT-010** — Messages: scoped inbox (Parent → Class Teacher / Admin / Accounts / Principal
      only, server-enforced), search/filter/reply
- [ ] **FEAT-011** — Notifications: Firebase Cloud Messaging wiring, deep links to the right screen

## Sprint 9-10 — Fees + Leave ⏳ PENDING

- [ ] **FEAT-012** — Fees: server-computed voucher, PDF generation, in-app JazzCash/EasyPaisa
      payment, payment history/receipts
- [ ] **FEAT-013** — Leave applications: submit/approve/reject, reflects on the attendance calendar

## Sprint 11-12 — Hardening + Pilot ⏳ PENDING

- [ ] **FEAT-014** — Offline caching ("Last updated" timestamps for timetable/attendance/diary/
      circulars), security review pass, Play Store submission (own developer account, not sideloaded)
- [ ] Switch Prisma datasource from SQLite (local dev) to PostgreSQL before any staging/production
      deploy
- [ ] Real secrets: rotate the dev-only JWT secrets in `backend/.env` before deploy
- [ ] Wire real S3-compatible storage (currently unwired — needed once FEAT-008/009/012 attachments
      land)
- [ ] Real Firebase project for FCM (currently unwired)
- [ ] Pilot rollout: one campus/class, 20-50 parents, before full cutover

## Deferred (explicitly out of this build's scope)

- [ ] Parent **web** portal (Phase 2 — same backend, zero rework, just not built alongside mobile)
- [ ] Public website refresh (separate, lower-priority track)
- [ ] WhatsApp integration
- [ ] Results/report cards, exam timetable, PTM booking, homework tracker, event RSVP (Release 2+
      per `MVP-Plan-V3.md`)
- [ ] Payroll, full accounting ERP, library, transport GPS, RFID/biometric, canteen/wallet, AI
      tutor, complex LMS, online exams, inventory/HR — never in scope for this MVP

## Environment / one-time setup

- [x] PostgreSQL/Docker — not available on this machine; using SQLite for local dev (tracked above,
      not forgotten)
- [x] Flutter SDK installed (3.47.1), Android SDK cmdline-tools installed, `flutter doctor` green
      except Visual Studio (unrelated — only needed for native Windows desktop builds)
- [x] Windows Developer Mode enabled (needed for Flutter plugin builds)
- [ ] Android emulator/AVD — cmdline-tools/SDK are installed but no emulator has been created yet;
      needed for a real on-device preview (web preview works today via `flutter run -d chrome`)
- [ ] Visual Studio + "Desktop development with C++" — only if a native Windows desktop build is
      ever wanted; not required for Android/web

---

**Next step:** Sprint 7-8 — FEAT-010 (Messages, scoped inbox) + FEAT-011 (Notifications, FCM wiring
+ deep links), backend API through both clients, same TDD rigor as Sprints 1-6.
