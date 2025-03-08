/*
  Warnings:

  - Made the column `topicId` on table `Test` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Test` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Test` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Test` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Test" ALTER COLUMN "topicId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
