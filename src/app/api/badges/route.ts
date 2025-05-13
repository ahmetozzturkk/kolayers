import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET all badges with progress information
export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    const badge = await prisma.badge.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl || '',
        backgroundColor: body.backgroundColor || '#7c3aed',
        icon: body.icon || '📝',
        points: body.points || 0,
        requiredToComplete: body.requiredToComplete || [],
      }
    });
    
    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
} 