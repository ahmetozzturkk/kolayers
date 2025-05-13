import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all modules with their tasks
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

    // Get all modules with their tasks
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

    // Get user's progress for all tasks
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId
      }
    });

    // Enhance modules with completion status
    const modulesWithProgress = modules.map(module => {
      // Check completion status for each task
      const tasksWithProgress = module.tasks.map(task => {
        const progress = userProgress.find(p => p.taskId === task.id);
        return {
          ...task,
          completed: progress?.completed || false
        };
      });

      // Calculate module completion percentage
      const totalTasks = tasksWithProgress.length;
      const completedTasks = tasksWithProgress.filter(t => t.completed).length;
      const progressPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
      
      // Module is completed if all its tasks are completed
      const completed = totalTasks > 0 && completedTasks === totalTasks;

      return {
        ...module,
        tasks: tasksWithProgress,
        progress: progressPercentage,
        completed
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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Validate order is a number
    if (body.order && typeof body.order !== 'number') {
      return NextResponse.json(
        { error: 'Order must be a number' },
        { status: 400 }
      );
    }
    
    // Create the module
    const moduleData = await prisma.module.create({
      data: {
        title: body.title,
        description: body.description,
        order: body.order || 1,
        badgeId: body.badgeId
      }
    });
    
    return NextResponse.json(moduleData, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
} 