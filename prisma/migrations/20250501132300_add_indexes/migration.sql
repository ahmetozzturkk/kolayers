-- CreateIndex
CREATE INDEX "Badge_title_idx" ON "Badge"("title");

-- CreateIndex
CREATE INDEX "Badge_points_idx" ON "Badge"("points");

-- CreateIndex
CREATE INDEX "Certificate_title_idx" ON "Certificate"("title");

-- CreateIndex
CREATE INDEX "ClaimedReward_userId_idx" ON "ClaimedReward"("userId");

-- CreateIndex
CREATE INDEX "ClaimedReward_rewardId_idx" ON "ClaimedReward"("rewardId");

-- CreateIndex
CREATE INDEX "ClaimedReward_claimedAt_idx" ON "ClaimedReward"("claimedAt");

-- CreateIndex
CREATE INDEX "EarnedBadge_userId_idx" ON "EarnedBadge"("userId");

-- CreateIndex
CREATE INDEX "EarnedBadge_badgeId_idx" ON "EarnedBadge"("badgeId");

-- CreateIndex
CREATE INDEX "EarnedBadge_earnedAt_idx" ON "EarnedBadge"("earnedAt");

-- CreateIndex
CREATE INDEX "EarnedCertificate_userId_idx" ON "EarnedCertificate"("userId");

-- CreateIndex
CREATE INDEX "EarnedCertificate_certificateId_idx" ON "EarnedCertificate"("certificateId");

-- CreateIndex
CREATE INDEX "EarnedCertificate_earnedAt_idx" ON "EarnedCertificate"("earnedAt");

-- CreateIndex
CREATE INDEX "Module_badgeId_idx" ON "Module"("badgeId");

-- CreateIndex
CREATE INDEX "Module_order_idx" ON "Module"("order");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");

-- CreateIndex
CREATE INDEX "Reward_badgeId_idx" ON "Reward"("badgeId");

-- CreateIndex
CREATE INDEX "Reward_type_idx" ON "Reward"("type");

-- CreateIndex
CREATE INDEX "Reward_pointCost_idx" ON "Reward"("pointCost");

-- CreateIndex
CREATE INDEX "Task_moduleId_idx" ON "Task"("moduleId");

-- CreateIndex
CREATE INDEX "Task_order_idx" ON "Task"("order");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserProgress_userId_idx" ON "UserProgress"("userId");

-- CreateIndex
CREATE INDEX "UserProgress_taskId_idx" ON "UserProgress"("taskId");

-- CreateIndex
CREATE INDEX "UserProgress_completed_idx" ON "UserProgress"("completed");

-- CreateIndex
CREATE INDEX "UserProgress_startedAt_idx" ON "UserProgress"("startedAt");

-- CreateIndex
CREATE INDEX "UserProgress_completedAt_idx" ON "UserProgress"("completedAt");
