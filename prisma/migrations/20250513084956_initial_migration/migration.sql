/*
  Warnings:

  - You are about to drop the column `badgeId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the `_BadgesToCertificates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "_BadgesToCertificates" DROP CONSTRAINT "_BadgesToCertificates_A_fkey";

-- DropForeignKey
ALTER TABLE "_BadgesToCertificates" DROP CONSTRAINT "_BadgesToCertificates_B_fkey";

-- DropIndex
DROP INDEX "Badge_points_idx";

-- DropIndex
DROP INDEX "Badge_title_idx";

-- DropIndex
DROP INDEX "Certificate_title_idx";

-- DropIndex
DROP INDEX "ClaimedReward_claimedAt_idx";

-- DropIndex
DROP INDEX "ClaimedReward_rewardId_idx";

-- DropIndex
DROP INDEX "ClaimedReward_userId_idx";

-- DropIndex
DROP INDEX "EarnedBadge_badgeId_idx";

-- DropIndex
DROP INDEX "EarnedBadge_earnedAt_idx";

-- DropIndex
DROP INDEX "EarnedBadge_userId_idx";

-- DropIndex
DROP INDEX "EarnedCertificate_certificateId_idx";

-- DropIndex
DROP INDEX "EarnedCertificate_earnedAt_idx";

-- DropIndex
DROP INDEX "EarnedCertificate_userId_idx";

-- DropIndex
DROP INDEX "Module_badgeId_idx";

-- DropIndex
DROP INDEX "Module_order_idx";

-- DropIndex
DROP INDEX "Referral_createdAt_idx";

-- DropIndex
DROP INDEX "Referral_referrerId_idx";

-- DropIndex
DROP INDEX "Referral_status_idx";

-- DropIndex
DROP INDEX "Reward_badgeId_idx";

-- DropIndex
DROP INDEX "Reward_pointCost_idx";

-- DropIndex
DROP INDEX "Reward_type_idx";

-- DropIndex
DROP INDEX "Task_moduleId_idx";

-- DropIndex
DROP INDEX "Task_order_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "UserProgress_completedAt_idx";

-- DropIndex
DROP INDEX "UserProgress_completed_idx";

-- DropIndex
DROP INDEX "UserProgress_startedAt_idx";

-- DropIndex
DROP INDEX "UserProgress_taskId_idx";

-- DropIndex
DROP INDEX "UserProgress_userId_idx";

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "icon" TEXT,
ALTER COLUMN "points" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "badgeId",
ADD COLUMN     "badgeRequiredId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "_BadgesToCertificates";

-- CreateTable
CREATE TABLE "CertificateBadgeRequirement" (
    "certificateId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,

    CONSTRAINT "CertificateBadgeRequirement_pkey" PRIMARY KEY ("certificateId","badgeId")
);

-- AddForeignKey
ALTER TABLE "CertificateBadgeRequirement" ADD CONSTRAINT "CertificateBadgeRequirement_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateBadgeRequirement" ADD CONSTRAINT "CertificateBadgeRequirement_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_badgeRequiredId_fkey" FOREIGN KEY ("badgeRequiredId") REFERENCES "Badge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
