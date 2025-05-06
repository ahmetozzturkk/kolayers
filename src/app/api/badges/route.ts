import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET all badges with progress information
export async function GET(request: Request) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all badges
    const badges = await prisma.badge.findMany({
      include: {
        modules: {
          include: {
            tasks: true
          }
        }
      }
    });

    // Get user progress for all tasks
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId
      }
    });

    // Calculate badge progress
    const badgesWithProgress = badges.map(badge => {
      // Flatten all tasks across modules for this badge
      const allTasks = badge.modules.flatMap(module => module.tasks);
      const totalTasks = allTasks.length;
      
      // Count completed tasks
      const completedTasks = allTasks.filter(task => {
        const progress = userProgress.find(p => p.taskId === task.id);
        return progress?.completed;
      }).length;
      
      // Calculate progress percentage
      const progressPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
      
      // Determine if badge is earned (100% completion)
      const earned = progressPercentage === 100;

      return {
        ...badge,
        progress: progressPercentage,
        earned,
        completedTasks,
        totalTasks
      };
    });

    return NextResponse.json(badgesWithProgress);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
} 