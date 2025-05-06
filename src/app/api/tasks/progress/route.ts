import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// Update task progress
export async function POST(request: Request) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskId, completed, timeSpent, score, answers } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Check if the task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Find existing progress or create new entry
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId
        }
      }
    });

    let progress;

    if (existingProgress) {
      // Update existing progress
      progress = await prisma.userProgress.update({
        where: {
          id: existingProgress.id
        },
        data: {
          completed: completed ?? existingProgress.completed,
          completedAt: completed ? new Date() : existingProgress.completedAt,
          timeSpent: timeSpent !== undefined ? 
            (existingProgress.timeSpent || 0) + timeSpent : 
            existingProgress.timeSpent,
          score: score !== undefined ? score : existingProgress.score,
          answers: answers !== undefined ? answers : existingProgress.answers
        }
      });
    } else {
      // Create new progress entry
      progress = await prisma.userProgress.create({
        data: {
          userId,
          taskId,
          completed: completed ?? false,
          completedAt: completed ? new Date() : null,
          timeSpent: timeSpent || 0,
          score: score || null,
          answers: answers || null
        }
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating task progress:', error);
    return NextResponse.json(
      { error: 'Failed to update task progress' },
      { status: 500 }
    );
  }
} 