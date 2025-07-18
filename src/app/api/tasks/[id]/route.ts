import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET a specific task
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Extract ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const taskId = pathParts[pathParts.length - 1];
    
    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        module: {
          include: {
            badge: true
          }
        }
      }
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Get user's progress for this task
    const userProgress = await prisma.userProgress.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId
        }
      }
    });
    
    // Enhance the task with user progress
    const taskWithProgress = {
      ...task,
      completed: userProgress?.completed || false,
      startedAt: userProgress?.startedAt || null,
      completedAt: userProgress?.completedAt || null,
      score: userProgress?.score || null,
      answers: userProgress?.answers || null
    };
    
    return NextResponse.json(taskWithProgress);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// UPDATE a task (admin only)
export async function PUT(request: NextRequest) {
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
    
    // Extract ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const taskId = pathParts[pathParts.length - 1];
    
    const body = await request.json();
    
    // Validate the task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Validate input data
    if (body.points && typeof body.points !== 'number') {
      return NextResponse.json(
        { error: 'Points must be a number' },
        { status: 400 }
      );
    }
    
    if (body.estimatedTime && typeof body.estimatedTime !== 'number') {
      return NextResponse.json(
        { error: 'Estimated time must be a number' },
        { status: 400 }
      );
    }
    
    if (body.order && typeof body.order !== 'number') {
      return NextResponse.json(
        { error: 'Order must be a number' },
        { status: 400 }
      );
    }
    
    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.type && { type: body.type }),
        ...(body.moduleId && { moduleId: body.moduleId }),
        ...(body.content && { content: body.content }),
        ...(body.points && { points: body.points }),
        ...(body.estimatedTime && { estimatedTime: body.estimatedTime }),
        ...(body.order && { order: body.order })
      }
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE a task (admin only)
export async function DELETE(request: NextRequest) {
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
    
    // Extract ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const taskId = pathParts[pathParts.length - 1];
    
    // Validate the task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Delete the task
    await prisma.task.delete({
      where: { id: taskId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 