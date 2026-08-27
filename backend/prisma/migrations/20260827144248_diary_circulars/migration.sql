/*
  Warnings:

  - You are about to drop the `_DiaryEntryStudents` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sectionId` to the `DiaryEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_DiaryEntryStudents_B_index";

-- DropIndex
DROP INDEX "_DiaryEntryStudents_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_DiaryEntryStudents";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CircularRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circularId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CircularRecipient_circularId_fkey" FOREIGN KEY ("circularId") REFERENCES "Circular" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CircularRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Circular" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "sectionId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "authorId" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Circular_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Circular_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Circular" ("authorId", "createdAt", "description", "expiresAt", "id", "priority", "publishedAt", "scope", "title", "updatedAt") SELECT "authorId", "createdAt", "description", "expiresAt", "id", "priority", "publishedAt", "scope", "title", "updatedAt" FROM "Circular";
DROP TABLE "Circular";
ALTER TABLE "new_Circular" RENAME TO "Circular";
CREATE INDEX "Circular_sectionId_idx" ON "Circular"("sectionId");
CREATE TABLE "new_DiaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiaryEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiaryEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiaryEntry_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DiaryEntry" ("createdAt", "date", "dueDate", "id", "subjectId", "teacherId", "text", "updatedAt") SELECT "createdAt", "date", "dueDate", "id", "subjectId", "teacherId", "text", "updatedAt" FROM "DiaryEntry";
DROP TABLE "DiaryEntry";
ALTER TABLE "new_DiaryEntry" RENAME TO "DiaryEntry";
CREATE INDEX "DiaryEntry_sectionId_idx" ON "DiaryEntry"("sectionId");
CREATE UNIQUE INDEX "DiaryEntry_sectionId_subjectId_date_key" ON "DiaryEntry"("sectionId", "subjectId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CircularRecipient_userId_idx" ON "CircularRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CircularRecipient_circularId_userId_key" ON "CircularRecipient"("circularId", "userId");
