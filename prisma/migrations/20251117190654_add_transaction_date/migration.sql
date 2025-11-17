/*
  Warnings:

  - Made the column `category` on table `Expense` required. This step will fail if there are existing NULL values in that column.
  - Made the column `note` on table `Expense` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramUserId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "transactionDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Expense" ("amount", "category", "createdAt", "id", "note", "telegramUserId") SELECT "amount", "category", "createdAt", "id", "note", "telegramUserId" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
