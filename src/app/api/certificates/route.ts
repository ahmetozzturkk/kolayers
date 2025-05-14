import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/src/types';

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

    // Get all certificates
    const certificates = await prisma.certificate.findMany({
      include: {
        badgesRequired: {
          include: {
            badge: true
          }
        }
      }
    });

    // Get user's earned badges
    const earnedBadges = await prisma.earnedBadge.findMany({
      where: {
        userId
      },
      select: {
        badgeId: true
      }
    });
    
    const earnedBadgeIds = earnedBadges.map(eb => eb.badgeId);

    // Check which certificates the user has earned
    const certificatesWithEligibility = certificates.map(certificate => {
      // Get all required badge IDs for this certificate
      const requiredBadgeIds = certificate.badgesRequired.map(br => br.badgeId);
      
      // Certificate is eligible if user has earned all required badges
      const eligible = requiredBadgeIds.every(badgeId => 
        earnedBadgeIds.includes(badgeId)
      );
      
      // Calculate progress
      const progress = requiredBadgeIds.length > 0
        ? Math.round((requiredBadgeIds.filter(id => earnedBadgeIds.includes(id)).length / requiredBadgeIds.length) * 100)
        : 0;

      return {
        ...certificate,
        eligible,
        progress
      };
    });

    return NextResponse.json(certificatesWithEligibility);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
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
      where: { id: userId }
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.badgesRequired) {
      return NextResponse.json(
        { error: 'Title, description, and badgesRequired are required' },
        { status: 400 }
      );
    }
    
    if (!body.imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }
    
    // Create certificate with badge requirements
    const certificate = await prisma.certificate.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        badgesRequired: {
          create: body.badgesRequired.map(badgeId => ({
            badge: { connect: { id: badgeId } }
          }))
        }
      },
      include: {
        badgesRequired: {
          include: {
            badge: true
          }
        }
      }
    });
    
    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    );
  }
} 