import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

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
    // Verify authentication (with admin check)
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In a real app, check if user is admin
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (!user.isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Create the module
    const module = await prisma.module.create({
      data: {
        title: body.title,
        description: body.description,
        order: body.order || 1,
        badgeId: body.badgeId,
        completed: false
      }
    });
    
    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
} 