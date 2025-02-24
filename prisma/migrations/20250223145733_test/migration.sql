-- CreateTable
CREATE TABLE "Enrollements" (
    "enrollId" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(6),

    CONSTRAINT "Enrollements_pkey" PRIMARY KEY ("enrollId")
);

-- CreateTable
CREATE TABLE "Questions" (
    "qId" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSON NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("qId")
);

-- CreateTable
CREATE TABLE "Test" (
    "testId" UUID NOT NULL,
    "topicId" UUID,
    "userId" UUID,
    "name" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(6),
    "endTime" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6),

    CONSTRAINT "Test_pkey" PRIMARY KEY ("testId")
);

-- CreateTable
CREATE TABLE "Topics" (
    "topicId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "topicName" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "topicCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Topics_pkey" PRIMARY KEY ("topicId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserAnswers" (
    "attemptId" UUID NOT NULL,
    "qId" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "userAnsId" UUID NOT NULL,

    CONSTRAINT "UserAnswers_pkey" PRIMARY KEY ("userAnsId")
);

-- CreateTable
CREATE TABLE "UserAttempts" (
    "attemptId" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "startedAt" TIMESTAMP(6) NOT NULL,
    "completedAt" TIMESTAMP(6) NOT NULL,
    "score" BIGINT NOT NULL,

    CONSTRAINT "UserAttempts_pkey" PRIMARY KEY ("attemptId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Enrollements" ADD CONSTRAINT "topicId" FOREIGN KEY ("topicId") REFERENCES "Topics"("topicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollements" ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "testId" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "topicId" FOREIGN KEY ("topicId") REFERENCES "Topics"("topicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topics" ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswers" ADD CONSTRAINT "attemptId" FOREIGN KEY ("attemptId") REFERENCES "UserAttempts"("attemptId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswers" ADD CONSTRAINT "qId" FOREIGN KEY ("qId") REFERENCES "Questions"("qId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempts" ADD CONSTRAINT "testId" FOREIGN KEY ("testId") REFERENCES "Test"("testId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempts" ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
