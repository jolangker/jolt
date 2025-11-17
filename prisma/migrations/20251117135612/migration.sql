/*
  Warnings:

  - You are about to drop the column `description` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `rawInputType` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `rawInputUrl` on the `Expense` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramUserId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Expense" ("amount", "category", "createdAt", "id", "telegramUserId") SELECT "amount", "category", "createdAt", "id", "telegramUserId" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
