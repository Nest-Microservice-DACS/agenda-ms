-- CreateEnum
CREATE TYPE "AgendaStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED');

-- CreateTable
CREATE TABLE "Agenda_slot" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AgendaStatus" NOT NULL DEFAULT 'AVAILABLE',
    "quirofanoId" INTEGER,
    "cirugiaId" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Agenda_slot_pkey" PRIMARY KEY ("id")
);
