import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.userProgress.deleteMany();
  await prisma.task.deleteMany();
  await prisma.module.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.user.deleteMany();

  console.log('Existing data cleared');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Created demo user: ${demoUser.email}`);

  // Create badges
  const noviceBadge = await prisma.badge.create({
    data: {
      title: 'Novice Learner',
      description: 'Complete your first learning module',
      imageUrl: '/badges/novice.svg',
    },
  });

  const expertBadge = await prisma.badge.create({
    data: {
      title: 'Expert Learner',
      description: 'Complete advanced learning modules',
      imageUrl: '/badges/expert.svg',
    },
  });

  const referralBadge = await prisma.badge.create({
    data: {
      title: 'Community Builder',
      description: 'Successfully refer 3 friends',
      imageUrl: '/badges/community.svg',
    },
  });

  console.log('Created badges');

  // Create modules
  const introModule = await prisma.module.create({
    data: {
      title: 'Introduction to Kolay',
      description: 'Learn the basics of the Kolay platform',
      order: 1,
      badgeId: noviceBadge.id,
    },
  });

  const advancedModule = await prisma.module.create({
    data: {
      title: 'Advanced Features',
      description: 'Master the advanced features of Kolay',
      order: 2,
      badgeId: expertBadge.id,
    },
  });

  const communityModule = await prisma.module.create({
    data: {
      title: 'Building Community',
      description: 'Learn how to grow your network with Kolay',
      order: 3,
      badgeId: referralBadge.id,
    },
  });

  console.log('Created modules');

  // Create tasks for Intro Module
  await prisma.task.createMany({
    data: [
      {
        title: 'Watch Welcome Video',
        description: 'Introduction to the Kolay platform',
        type: 'video',
        moduleId: introModule.id,
        content: JSON.stringify({
          videoId: 'dQw4w9WgXcQ', // Sample YouTube video ID
          duration: 180,
        }),
        points: 10,
        estimatedTime: 3,
        order: 1,
      },
      {
        title: 'Complete Profile',
        description: 'Set up your profile information',
        type: 'action',
        moduleId: introModule.id,
        content: JSON.stringify({
          steps: [
            'Upload a profile picture',
            'Add your bio',
            'Set your preferences',
          ],
        }),
        points: 15,
        estimatedTime: 5,
        order: 2,
      },
      {
        title: 'Platform Overview Quiz',
        description: 'Test your knowledge of the platform',
        type: 'quiz',
        moduleId: introModule.id,
        content: JSON.stringify({
          questions: [
            {
              question: 'What is Kolay mainly used for?',
              options: [
                'Social media',
                'Learning and task management',
                'Gaming',
                'File storage',
              ],
              correctAnswer: 1,
            },
            {
              question: 'How do you earn badges?',
              options: [
                'By purchasing them',
                'By completing specific modules',
                'By inviting friends',
                'Both B and C',
              ],
              correctAnswer: 3,
            },
          ],
        }),
        points: 20,
        estimatedTime: 5,
        order: 3,
      },
    ],
  });

  // Create tasks for Advanced Module
  await prisma.task.createMany({
    data: [
      {
        title: 'Advanced Features Tutorial',
        description: 'Learn about the advanced features of Kolay',
        type: 'video',
        moduleId: advancedModule.id,
        content: JSON.stringify({
          videoId: 'dQw4w9WgXcQ', // Sample YouTube video ID
          duration: 300,
        }),
        points: 25,
        estimatedTime: 5,
        order: 1,
      },
      {
        title: 'Productivity Tips',
        description: 'Read about how to maximize productivity',
        type: 'article',
        moduleId: advancedModule.id,
        content: JSON.stringify({
          text: `
            # Maximizing Productivity with Kolay
            
            Kolay offers several features to boost your productivity:
            
            1. Task prioritization
            2. Time tracking
            3. Progress visualization
            4. Rewards and recognition
            
            Use these features wisely to achieve your goals!
          `,
          timeToRead: 3,
        }),
        points: 15,
        estimatedTime: 3,
        order: 2,
      },
      {
        title: 'Advanced Features Assessment',
        description: 'Demonstrate your knowledge of advanced features',
        type: 'quiz',
        moduleId: advancedModule.id,
        content: JSON.stringify({
          questions: [
            {
              question: 'Which feature helps track time spent on tasks?',
              options: [
                'Badge system',
                'Timer function',
                'Social sharing',
                'Profile customization',
              ],
              correctAnswer: 1,
            },
            {
              question: 'What is the benefit of progress visualization?',
              options: [
                'It makes the app colorful',
                'It helps motivate by showing accomplishments',
                'It has no real benefit',
                "It's only available to premium users",
              ],
              correctAnswer: 1,
            },
          ],
        }),
        points: 30,
        estimatedTime: 5,
        order: 3,
      },
    ],
  });

  // Create tasks for Community Module
  await prisma.task.createMany({
    data: [
      {
        title: 'Community Guidelines',
        description: 'Learn about community standards and guidelines',
        type: 'article',
        moduleId: communityModule.id,
        content: JSON.stringify({
          text: `
            # Community Guidelines
            
            At Kolay, we believe in building a supportive and inclusive community.
            
            Please follow these guidelines:
            - Be respectful to others
            - Share constructive feedback
            - Celebrate others' achievements
            - Help newcomers get started
          `,
          timeToRead: 2,
        }),
        points: 10,
        estimatedTime: 2,
        order: 1,
      },
      {
        title: 'Refer a Friend',
        description: 'Invite your friends to join Kolay',
        type: 'referral',
        moduleId: communityModule.id,
        content: JSON.stringify({
          requiredReferrals: 1,
          message: 'Invite a friend to earn points and help them get started with Kolay!',
        }),
        points: 50,
        estimatedTime: 2,
        order: 2,
      },
      {
        title: 'Community Quiz',
        description: 'Test your knowledge about Kolay\'s community features',
        type: 'quiz',
        moduleId: communityModule.id,
        content: JSON.stringify({
          questions: [
            {
              question: 'How many referrals do you need for the Community Builder badge?',
              options: ['1', '2', '3', '5'],
              correctAnswer: 2,
            },
            {
              question: 'What happens when you refer a friend?',
              options: [
                'They get immediate access to all premium features',
                'You both earn points and badges',
                'Your account gets upgraded automatically',
                'Nothing special happens',
              ],
              correctAnswer: 1,
            },
          ],
        }),
        points: 20,
        estimatedTime: 3,
        order: 3,
      },
    ],
  });

  console.log('Created tasks');
  console.log('Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 