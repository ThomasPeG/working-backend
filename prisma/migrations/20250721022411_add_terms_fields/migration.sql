/*
  Warnings:

  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "termsAccepted" BOOLEAN DEFAULT false,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Job";
