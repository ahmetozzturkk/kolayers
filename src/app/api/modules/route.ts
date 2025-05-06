import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET all modules with their tasks
export async function GET(request: Request) {
  try {
    // Optional: Verify authentication
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all modules with their related tasks and badges
    const modules = await prisma.module.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        },
        badge: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Get user progress for tasks
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId
      }
    });

    // Combine modules with user progress information
    const modulesWithProgress = modules.map(module => {
      const tasksWithProgress = module.tasks.map(task => {
        const progress = userProgress.find(p => p.taskId === task.id);
        return {
          ...task,
          completed: progress?.completed || false,
          startedAt: progress?.startedAt || null,
          completedAt: progress?.completedAt || null,
          timeSpent: progress?.timeSpent || 0,
          score: progress?.score || null
        };
      });

      return {
        ...module,
        tasks: tasksWithProgress,
      };
    });

    return NextResponse.json(modulesWithProgress);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
} 