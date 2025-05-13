import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET admin statistics
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { isAdmin: true }
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      );
    }
    
    // Get basic statistics
    const [
      totalUsers,
      totalBadges,
      totalModules,
      totalTasks,
      totalCertificates,
      totalRewards,
      totalEarnedBadges,
      totalEarnedCertificates,
      totalClaimedRewards,
      totalCompletedTasks,
      recentUsers,
      recentCompletedTasks
    ] = await Promise.all([
      prisma.user.count(),
      prisma.badge.count(),
      prisma.module.count(),
      prisma.task.count(),
      prisma.certificate.count(),
      prisma.reward.count(),
      prisma.earnedBadge.count(),
      prisma.earnedCertificate.count(),
      prisma.claimedReward.count(),
      prisma.userProgress.count({
        where: { completed: true }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.userProgress.findMany({
        take: 5,
        where: { completed: true },
        orderBy: { completedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              moduleId: true,
              module: {
                select: {
                  title: true
                }
              }
            }
          }
        }
      })
    ]);
    
    // Calculate completion rates
    const badgeCompletionRate = totalBadges > 0 
      ? (totalEarnedBadges / (totalBadges * totalUsers) * 100).toFixed(2)
      : 0;
    
    const taskCompletionRate = totalTasks > 0
      ? (totalCompletedTasks / (totalTasks * totalUsers) * 100).toFixed(2)
      : 0;
    
    const certificateCompletionRate = totalCertificates > 0
      ? (totalEarnedCertificates / (totalCertificates * totalUsers) * 100).toFixed(2)
      : 0;
    
    const rewardClaimRate = totalRewards > 0
      ? (totalClaimedRewards / (totalRewards * totalUsers) * 100).toFixed(2)
      : 0;
    
    // Format the statistics
    const stats = {
      totalUsers,
      totalBadges,
      totalModules,
      totalTasks,
      totalCertificates,
      totalRewards,
      totalEarnedBadges,
      totalEarnedCertificates,
      totalClaimedRewards,
      totalCompletedTasks,
      badgeCompletionRate,
      taskCompletionRate,
      certificateCompletionRate,
      rewardClaimRate,
      recentUsers,
      recentCompletedTasks
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 