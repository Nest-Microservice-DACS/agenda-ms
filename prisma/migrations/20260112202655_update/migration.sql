/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Agenda_slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agenda_slot" DROP COLUMN "expiresAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'BOOKED';
