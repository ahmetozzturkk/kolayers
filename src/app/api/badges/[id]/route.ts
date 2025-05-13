import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET a specific badge
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
    
    const badgeId = params.id;
    
    // Get the badge with its modules and tasks
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        modules: {
          include: {
            tasks: true
          }
        }
      }
    });
    
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }
    
    // Get user's progress for tasks in this badge
    const allTaskIds = badge.modules.flatMap(module => 
      module.tasks.map(task => task.id)
    );
    
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        taskId: { in: allTaskIds }
      }
    });
    
    // Calculate badge progress
    const totalTasks = allTaskIds.length;
    const completedTasks = userProgress.filter(p => p.completed).length;
    const progressPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Check if user has earned this badge
    const earnedBadge = await prisma.earnedBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    });
    
    // Enhance the badge with progress information
    const badgeWithProgress = {
      ...badge,
      progress: progressPercentage,
      earned: !!earnedBadge,
      completedTasks,
      totalTasks
    };
    
    return NextResponse.json(badgeWithProgress);
  } catch (error) {
    console.error('Error fetching badge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge' },
      { status: 500 }
    );
  }
}

// UPDATE a badge (admin only)
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
    
    const badgeId = params.id;
    const body = await request.json();
    
    // Validate the badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });
    
    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Badge not found' },
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
    
    // Update the badge
    const updatedBadge = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.imageUrl && { imageUrl: body.imageUrl }),
        ...(body.backgroundColor && { backgroundColor: body.backgroundColor }),
        ...(body.icon && { icon: body.icon }),
        ...(body.points && { points: body.points }),
        ...(body.requiredToComplete && { requiredToComplete: body.requiredToComplete })
      }
    });
    
    return NextResponse.json(updatedBadge);
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json(
      { error: 'Failed to update badge' },
      { status: 500 }
    );
  }
}

// DELETE a badge (admin only)
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
    
    const badgeId = params.id;
    
    // Validate the badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });
    
    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }
    
    // Delete the badge
    await prisma.badge.delete({
      where: { id: badgeId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'Failed to delete badge' },
      { status: 500 }
    );
  }
} 