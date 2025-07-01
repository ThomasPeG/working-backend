-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "spokenLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "contractType" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "paymentDetails" TEXT,
ADD COLUMN     "timeCommitment" TEXT;
