import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data to allow seeding multiple times without errors
  await prisma.whatsAppMessage.deleteMany();
  await prisma.task.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.case.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@legalcasepro.com',
      password: await hashPassword('demo123'),
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN',
    },
  });

  // Create attorney users
  const attorney1 = await prisma.user.create({
    data: {
      email: 'jane.smith@legalcasepro.com',
      password: await hashPassword('demo123'),
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'ATTORNEY',
    },
  });

  const attorney2 = await prisma.user.create({
    data: {
      email: 'robert.wilson@legalcasepro.com',
      password: await hashPassword('demo123'),
      firstName: 'Robert',
      lastName: 'Wilson',
      role: 'ATTORNEY',
    },
  });

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@johnsoindustries.com',
      phone: '+1 (555) 123-4567',
      company: 'Johnson Industries',
      address: '123 Business Ave, New York, NY 10001',
      type: 'CORPORATE',
      priority: 'HIGH',
      notes: 'Premium corporate client. Prefers email communication.',
      whatsappNumber: '+15551234567',
      whatsappOptIn: true,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Michael Chen',
      email: 'michael.chen@techinnovations.com',
      phone: '+1 (555) 234-5678',
      company: 'Tech Innovations LLC',
      address: '456 Tech Park, San Francisco, CA 94107',
      type: 'CORPORATE',
      priority: 'MEDIUM',
      notes: 'Startup client, fast-growing company.',
      whatsappNumber: '+15552345678',
      whatsappOptIn: true,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Residential St, Chicago, IL 60601',
      type: 'FAMILY',
      priority: 'HIGH',
      notes: 'Divorce proceedings. Sensitive case.',
      whatsappNumber: '+15553456789',
      whatsappOptIn: true,
    },
  });

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      title: 'Johnson vs. Smith Corp',
      caseNumber: 'LC-2025-001',
      description: 'Corporate merger dispute involving intellectual property rights and contract violations.',
      type: 'CORPORATE',
      status: 'ACTIVE',
      priority: 'HIGH',
      estimatedValue: 450000,
      progress: 65,
      deadline: new Date('2025-07-15'),
      courtDate: new Date('2025-07-01'),
      opposing: 'Smith Corporation',
      nextAction: 'File motion for preliminary injunction',
      clientId: client1.id,
      assignedToId: adminUser.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      title: 'Davis Divorce Settlement',
      caseNumber: 'LC-2025-002',
      description: 'Divorce settlement including custody arrangements and asset division.',
      type: 'FAMILY',
      status: 'REVIEW',
      priority: 'MEDIUM',
      estimatedValue: 125000,
      progress: 80,
      deadline: new Date('2025-06-30'),
      courtDate: new Date('2025-06-28'),
      opposing: 'Rebecca Davis',
      nextAction: 'Review settlement agreement',
      clientId: client3.id,
      assignedToId: attorney1.id,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      title: 'Tech Innovations Patent Case',
      caseNumber: 'LC-2025-003',
      description: 'Patent infringement case for green energy technology.',
      type: 'IP',
      status: 'ACTIVE',
      priority: 'HIGH',
      estimatedValue: 890000,
      progress: 35,
      deadline: new Date('2025-10-30'),
      courtDate: new Date('2025-08-15'),
      opposing: 'Solar Innovations LLC',
      nextAction: 'Patent validity analysis',
      clientId: client2.id,
      assignedToId: attorney2.id,
    },
  });

  // Create sample time entries
  await prisma.timeEntry.create({
    data: {
      description: 'Initial case review and strategy planning',
      hours: 3.5,
      hourlyRate: 450,
      isBillable: true,
      caseId: case1.id,
      userId: adminUser.id,
    },
  });

  await prisma.timeEntry.create({
    data: {
      description: 'Document preparation and filing',
      hours: 2.0,
      hourlyRate: 450,
      isBillable: true,
      caseId: case1.id,
      userId: adminUser.id,
    },
  });

  // Create sample tasks
  await prisma.task.create({
    data: {
      title: 'File motion for preliminary injunction',
      description: 'Prepare and file motion documents with the court',
      priority: 'HIGH',
      dueDate: new Date('2025-06-25'),
      caseId: case1.id,
      assignedToId: adminUser.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Review settlement agreement',
      description: 'Review and analyze proposed settlement terms',
      priority: 'MEDIUM',
      dueDate: new Date('2025-06-28'),
      caseId: case2.id,
      assignedToId: attorney1.id,
    },
  });

  // Create initial WhatsApp conversations
  const systemNumber = '15550000000@c.us';

  await prisma.whatsAppMessage.createMany({
    data: [
      {
        from: '15551234567@c.us',
        to: systemNumber,
        body: 'Hello, I would like to discuss the merger case.',
        direction: 'INBOUND',
        status: 'READ',
        messageType: 'TEXT',
        clientId: client1.id,
        caseId: case1.id,
      },
      {
        from: systemNumber,
        to: '15551234567@c.us',
        body: 'Sure Sarah, let me know a good time.',
        direction: 'OUTBOUND',
        status: 'SENT',
        messageType: 'TEXT',
        clientId: client1.id,
        caseId: case1.id,
      },
      {
        from: '15552345678@c.us',
        to: systemNumber,
        body: 'Any update on the patent filing?',
        direction: 'INBOUND',
        status: 'READ',
        messageType: 'TEXT',
        clientId: client2.id,
        caseId: case3.id,
      },
      {
        from: systemNumber,
        to: '15552345678@c.us',
        body: 'We are preparing the documents this week.',
        direction: 'OUTBOUND',
        status: 'SENT',
        messageType: 'TEXT',
        clientId: client2.id,
        caseId: case3.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@legalcasepro.com / demo123');
  console.log('👤 Attorney 1: jane.smith@legalcasepro.com / demo123');
  console.log('👤 Attorney 2: robert.wilson@legalcasepro.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });