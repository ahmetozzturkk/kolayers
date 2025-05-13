import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// Update task progress
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
    
    // Parse request body
    const body = await request.json();
    const { taskId, completed, score, answers } = body;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Find existing progress or create new one
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId
        }
      }
    });
    
    let updatedProgress;
    
    if (existingProgress) {
      // Update existing progress
      updatedProgress = await prisma.userProgress.update({
        where: {
          id: existingProgress.id
        },
        data: {
          completed: completed !== undefined ? completed : existingProgress.completed,
          completedAt: completed ? new Date() : existingProgress.completedAt,
          score: score !== undefined ? score : existingProgress.score,
          answers: answers ? JSON.stringify(answers) : existingProgress.answers
        }
      });
    } else {
      // Create new progress
      updatedProgress = await prisma.userProgress.create({
        data: {
          userId,
          taskId,
          completed: completed || false,
          completedAt: completed ? new Date() : null,
          score,
          answers: answers ? JSON.stringify(answers) : null
        }
      });
    }
    
    // Check if this completes a module
    await checkAndUpdateModuleCompletion(userId, taskId);
    
    // Check if this completes a badge
    await checkAndUpdateBadgeCompletion(userId, taskId);
    
    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Error updating task progress:', error);
    return NextResponse.json(
      { error: 'Failed to update task progress' },
      { status: 500 }
    );
  }
}

// Helper function to check and update module completion
async function checkAndUpdateModuleCompletion(userId: string, taskId: string) {
  try {
    // Get the task to find its module
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { moduleId: true }
    });
    
    if (!task) return;
    
    // Get all tasks for this module
    const moduleTasks = await prisma.task.findMany({
      where: { moduleId: task.moduleId },
      select: { id: true }
    });
    
    // Get user progress for all tasks in this module
    const taskIds = moduleTasks.map(t => t.id);
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        taskId: { in: taskIds }
      }
    });
    
    // Check if all tasks are completed
    const allTasksCompleted = taskIds.every(id => 
      progress.some(p => p.taskId === id && p.completed)
    );
    
    // Update module completion status if needed
    if (allTasksCompleted) {
      const module = await prisma.module.findUnique({
        where: { id: task.moduleId }
      });
      
      if (module && !module.completed) {
        await prisma.module.update({
          where: { id: task.moduleId },
          data: { completed: true }
        });
      }
    }
  } catch (error) {
    console.error('Error updating module completion:', error);
  }
}

// Helper function to check and update badge completion
async function checkAndUpdateBadgeCompletion(userId: string, taskId: string) {
  try {
    // Find the module for this task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { moduleId: true }
    });
    
    if (!task) return;
    
    // Find the badge for this module
    const module = await prisma.module.findUnique({
      where: { id: task.moduleId },
      select: { badgeId: true }
    });
    
    if (!module?.badgeId) return;
    
    // Get the badge with its required modules
    const badge = await prisma.badge.findUnique({
      where: { id: module.badgeId },
      include: { modules: true }
    });
    
    if (!badge) return;
    
    // Get required module IDs
    let requiredModuleIds = badge.requiredToComplete;
    
    // If no specific requirements, all modules for this badge are required
    if (!requiredModuleIds.length) {
      requiredModuleIds = badge.modules.map(m => m.id);
    }
    
    // Check if all required modules are completed
    const requiredModules = await prisma.module.findMany({
      where: { 
        id: { in: requiredModuleIds },
      }
    });
    
    const allModulesCompleted = requiredModules.every(m => m.completed);
    
    // If all required modules are completed, award the badge
    if (allModulesCompleted) {
      // Check if badge is already earned
      const existingBadge = await prisma.earnedBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id
          }
        }
      });
      
      if (!existingBadge) {
        // Award the badge
        await prisma.earnedBadge.create({
          data: {
            userId,
            badgeId: badge.id
          }
        });
        
        // Award points to the user
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: {
              increment: badge.points
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error updating badge completion:', error);
  }
} 