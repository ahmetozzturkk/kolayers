import { PrismaClient } from '@prisma/client';
import { badges, modules, tasks, certificates, rewards } from '../src/lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create badges
  console.log('Creating badges...');
  for (const badge of badges) {
    await prisma.badge.create({
      data: {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        imageUrl: badge.imageUrl || '',
        backgroundColor: badge.backgroundColor || '#7c3aed',
        icon: badge.icon || '📝',
        points: badge.points || 0,
        requiredToComplete: badge.requiredToComplete || [],
      }
    });
  }

  // Create modules
  console.log('Creating modules...');
  for (const module of modules) {
    await prisma.module.create({
      data: {
        id: module.id,
        title: module.title,
        description: module.description,
        order: parseInt(module.id.replace('module', '')) || 1,
        badgeId: module.badgeId,
        completed: module.completed,
      }
    });
  }

  // Create tasks
  console.log('Creating tasks...');
  for (const task of tasks) {
    await prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.taskType || 'regular',
        moduleId: task.moduleId,
        content: task.content ? JSON.parse(JSON.stringify(task.content)) : null,
        order: parseInt(task.id.replace('task', '')) || 1,
      }
    });
  }

  // Create certificates
  console.log('Creating certificates...');
  for (const cert of certificates) {
    await prisma.certificate.create({
      data: {
        id: cert.id,
        title: cert.title,
        description: cert.description,
        imageUrl: cert.imageUrl || '',
        badgesRequired: {
          create: cert.badgesRequired.map(badgeId => ({
            badge: { connect: { id: badgeId } }
          }))
        }
      }
    });
  }

  // Create rewards
  console.log('Creating rewards...');
  for (const reward of rewards) {
    await prisma.reward.create({
      data: {
        id: reward.id,
        title: reward.title,
        description: reward.description,
        imageUrl: reward.imageUrl || null,
        type: reward.type || 'badge',
        pointCost: reward.pointCost || null,
        badgeRequiredId: reward.badgeRequired || null,
      }
    });
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 