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

## Sprint 3-4 — Timetable + Attendance 🔜 NEXT

- [ ] **FEAT-006** — Timetable: backend API + staff-console screen + parent-app calendar tab
      (period/time/subject/teacher-optional/room-optional)
- [ ] **FEAT-007** — Attendance: teacher marks present/absent/late/leave/holiday; immutable from
      the parent side; every change audit-logged; parent sees today's status + monthly calendar +
      attendance %

## Sprint 5-6 — Diary + Circulars ⏳ PENDING

- [ ] **FEAT-008** — Diary/homework: per-subject entries, attachments, due dates, correct Urdu RTL
      rendering (no auto-translation)
- [ ] **FEAT-009** — Circulars: school/section scope, attachments, read/unread tracking (delivered
      vs read counts visible to admin)

## Sprint 7-8 — Messages + Notifications ⏳ PENDING

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

**Next step:** Sprint 3-4 — FEAT-006 (Timetable) + FEAT-007 (Attendance), backend API through both
clients, same TDD rigor as Sprints 1-2.
