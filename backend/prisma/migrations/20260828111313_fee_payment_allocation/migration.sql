/*
  Warnings:

  - You are about to drop the column `feeVoucherId` on the `FeePayment` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "FeePaymentAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feePaymentId" TEXT NOT NULL,
    "feeVoucherId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeePaymentAllocation_feePaymentId_fkey" FOREIGN KEY ("feePaymentId") REFERENCES "FeePayment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeePaymentAllocation_feeVoucherId_fkey" FOREIGN KEY ("feeVoucherId") REFERENCES "FeeVoucher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FeePayment" ("amount", "createdAt", "id", "method", "status") SELECT "amount", "createdAt", "id", "method", "status" FROM "FeePayment";
DROP TABLE "FeePayment";
ALTER TABLE "new_FeePayment" RENAME TO "FeePayment";
CREATE UNIQUE INDEX "FeePayment_reference_key" ON "FeePayment"("reference");
CREATE TABLE "new_FeeVoucher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeeVoucher_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeeVoucher_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FeeVoucher" ("academicSessionId", "createdAt", "dueDate", "id", "issueDate", "month", "studentId", "updatedAt") SELECT "academicSessionId", "createdAt", "dueDate", "id", "issueDate", "month", "studentId", "updatedAt" FROM "FeeVoucher";
DROP TABLE "FeeVoucher";
ALTER TABLE "new_FeeVoucher" RENAME TO "FeeVoucher";
CREATE INDEX "FeeVoucher_studentId_idx" ON "FeeVoucher"("studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FeePaymentAllocation_feeVoucherId_idx" ON "FeePaymentAllocation"("feeVoucherId");

-- CreateIndex
CREATE UNIQUE INDEX "FeePaymentAllocation_feePaymentId_feeVoucherId_key" ON "FeePaymentAllocation"("feePaymentId", "feeVoucherId");
