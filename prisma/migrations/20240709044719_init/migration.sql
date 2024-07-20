/*
  Warnings:

  - You are about to drop the column `scheduldedAt` on the `Question` table. All the data in the column will be lost.
  - Added the required column `scheduledAt` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "scheduldedAt",
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL;
