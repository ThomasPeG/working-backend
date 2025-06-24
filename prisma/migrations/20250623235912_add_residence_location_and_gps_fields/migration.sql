-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthplace" JSONB,
ADD COLUMN     "residenceLocation" JSONB,
ADD COLUMN     "useGPS" BOOLEAN DEFAULT false;
