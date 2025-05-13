import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET a specific module
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const moduleId = params.id;
    
    // Get the module with its tasks and badge
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        },
        badge: true
      }
    });
    
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Get user's progress for tasks in this module
    const taskIds = module.tasks.map(task => task.id);
    
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        taskId: { in: taskIds }
      }
    });
    
    // Enhance tasks with user progress
    const tasksWithProgress = module.tasks.map(task => {
      const progress = userProgress.find(p => p.taskId === task.id);
      
      return {
        ...task,
        completed: progress?.completed || false,
        startedAt: progress?.startedAt || null,
        completedAt: progress?.completedAt || null,
        score: progress?.score || null
      };
    });
    
    // Calculate module progress
    const totalTasks = tasksWithProgress.length;
    const completedTasks = tasksWithProgress.filter(t => t.completed).length;
    const progressPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Module is completed if all tasks are completed
    const completed = totalTasks > 0 && completedTasks === totalTasks;
    
    // Enhance the module with progress information
    const moduleWithProgress = {
      ...module,
      tasks: tasksWithProgress,
      progress: progressPercentage,
      completed,
      completedTasks,
      totalTasks
    };
    
    return NextResponse.json(moduleWithProgress);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module' },
      { status: 500 }
    );
  }
}

// UPDATE a module (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    
    const moduleId = params.id;
    const body = await request.json();
    
    // Validate the module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId }
    });
    
    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Update the module
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.order && { order: body.order }),
        ...(body.badgeId && { badgeId: body.badgeId })
      }
    });
    
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE a module (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    
    const moduleId = params.id;
    
    // Validate the module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId }
    });
    
    if (!existingModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Delete the module
    await prisma.module.delete({
      where: { id: moduleId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
} 