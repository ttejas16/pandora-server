/*
  Warnings:

  - The primary key for the `Questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `qId` on the `Questions` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `qId` on the `UserAnswers` table. All the data in the column will be lost.
  - The required column `questionId` was added to the `Questions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `title` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `Test` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `questionId` to the `UserAnswers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserAnswers" DROP CONSTRAINT "qId";

-- AlterTable
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_pkey",
DROP COLUMN "qId",
ADD COLUMN     "questionId" UUID NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Questions_pkey" PRIMARY KEY ("questionId");

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserAnswers" DROP COLUMN "qId",
ADD COLUMN     "questionId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "UserAnswers" ADD CONSTRAINT "qId" FOREIGN KEY ("questionId") REFERENCES "Questions"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;
