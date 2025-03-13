/*
  Warnings:

  - You are about to drop the `UserAnswers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAttempts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAnswers" DROP CONSTRAINT "attemptId";

-- DropForeignKey
ALTER TABLE "UserAnswers" DROP CONSTRAINT "qId";

-- DropForeignKey
ALTER TABLE "UserAttempts" DROP CONSTRAINT "testId";

-- DropForeignKey
ALTER TABLE "UserAttempts" DROP CONSTRAINT "userId";

-- DropTable
DROP TABLE "UserAnswers";

-- DropTable
DROP TABLE "UserAttempts";

-- CreateTable
CREATE TABLE "Submissions" (
    "attemptId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "startedAt" TIMESTAMP(6),
    "completedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAnswer" TEXT NOT NULL,

    CONSTRAINT "Submissions_pkey" PRIMARY KEY ("attemptId")
);

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "testId" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
