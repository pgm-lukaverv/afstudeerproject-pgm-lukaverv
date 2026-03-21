/*
  Warnings:

  - You are about to drop the column `downloadCount` on the `Beat` table. All the data in the column will be lost.
  - You are about to drop the column `playCount` on the `Beat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Beat" DROP COLUMN "downloadCount",
DROP COLUMN "playCount";
