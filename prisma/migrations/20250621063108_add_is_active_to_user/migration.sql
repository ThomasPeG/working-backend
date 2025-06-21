/*
  Warnings:

  - You are about to drop the column `interests` on the `Employee` table. All the data in the column will be lost.
  - The `skills` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "interests",
ADD COLUMN     "jobInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "isActive" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN DEFAULT true;
