/*
  Warnings:

  - You are about to drop the column `teacherId` on the `DiaryEntry` table. All the data in that
    column is preserved by being copied into the new `authorId` column below (backfilled from
    `Teacher.userId` for the FK's target — the one existing seeded row's `teacherId` is resolved to
    its owning Teacher's `userId` before the old column is dropped).
  - Added the required column `authorId` to the `DiaryEntry` table.

  This mirrors the Circular model's authorId/author (User) pattern instead of a role-specific
  profile-table FK, so TEACHER, SCHOOL_ADMIN and SUPER_ADMIN accounts can all author diary entries
  (every role has a User row; only TEACHER has a Teacher row).
*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiaryEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiaryEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiaryEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DiaryEntry" ("id", "sectionId", "subjectId", "authorId", "date", "text", "dueDate", "createdAt", "updatedAt")
SELECT "DiaryEntry"."id", "DiaryEntry"."sectionId", "DiaryEntry"."subjectId", "Teacher"."userId", "DiaryEntry"."date", "DiaryEntry"."text", "DiaryEntry"."dueDate", "DiaryEntry"."createdAt", "DiaryEntry"."updatedAt"
FROM "DiaryEntry"
JOIN "Teacher" ON "Teacher"."id" = "DiaryEntry"."teacherId";
DROP TABLE "DiaryEntry";
ALTER TABLE "new_DiaryEntry" RENAME TO "DiaryEntry";
CREATE INDEX "DiaryEntry_sectionId_idx" ON "DiaryEntry"("sectionId");
CREATE UNIQUE INDEX "DiaryEntry_sectionId_subjectId_date_key" ON "DiaryEntry"("sectionId", "subjectId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
