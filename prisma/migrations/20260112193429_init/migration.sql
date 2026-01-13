/*
  Warnings:

  - Made the column `quirofanoId` on table `Agenda_slot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Agenda_slot" ALTER COLUMN "quirofanoId" SET NOT NULL;
