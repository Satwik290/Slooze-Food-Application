import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Regions
  const regionIndia = await prisma.region.upsert({
    where: { name: 'India' },
    update: {},
    create: { name: 'India' },
  });

  const regionAmerica = await prisma.region.upsert({
    where: { name: 'America' },
    update: {},
    create: { name: 'America' },
  });

  const regionGlobal = await prisma.region.upsert({
    where: { name: 'Global' },
    update: {},
    create: { name: 'Global' },
  });

  console.log('Regions seeded.');

  // Password for all seed users
  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Users
  // Admin
  await prisma.user.upsert({
    where: { email: 'nick.fury@slooze.com' },
    update: {},
    create: {
      email: 'nick.fury@slooze.com',
      password: passwordHash,
      name: 'Nick Fury',
      role: 'ADMIN',
      regionId: regionGlobal.id,
    },
  });

  // Managers
  await prisma.user.upsert({
    where: { email: 'captain.marvel@slooze.com' },
    update: {},
    create: {
      email: 'captain.marvel@slooze.com',
      password: passwordHash,
      name: 'Captain Marvel',
      role: 'MANAGER',
      regionId: regionIndia.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'captain.america@slooze.com' },
    update: {},
    create: {
      email: 'captain.america@slooze.com',
      password: passwordHash,
      name: 'Captain America',
      role: 'MANAGER',
      regionId: regionAmerica.id,
    },
  });

  // Members
  await prisma.user.upsert({
    where: { email: 'thanos@slooze.com' },
    update: {},
    create: {
      email: 'thanos@slooze.com',
      password: passwordHash,
      name: 'Thanos',
      role: 'MEMBER',
      regionId: regionIndia.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'thor@slooze.com' },
    update: {},
    create: {
      email: 'thor@slooze.com',
      password: passwordHash,
      name: 'Thor',
      role: 'MEMBER',
      regionId: regionIndia.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'travis@slooze.com' },
    update: {},
    create: {
      email: 'travis@slooze.com',
      password: passwordHash,
      name: 'Travis',
      role: 'MEMBER',
      regionId: regionAmerica.id,
    },
  });

  console.log('Users seeded.');

  // 3. Create Restaurants and Menus
  await prisma.restaurant.upsert({
    where: { id: 'rest-india-1' },
    update: {},
    create: {
      id: 'rest-india-1',
      name: 'Delhi Dhaba',
      regionId: regionIndia.id,
      menuItems: {
        create: [
          { name: 'Butter Chicken', price: 15.0 },
          { name: 'Naan', price: 2.0 },
        ],
      },
    },
  });

  await prisma.restaurant.upsert({
    where: { id: 'rest-america-1' },
    update: {},
    create: {
      id: 'rest-america-1',
      name: 'American Burgers',
      regionId: regionAmerica.id,
      menuItems: {
        create: [
          { name: 'Cheeseburger', price: 10.0 },
          { name: 'Fries', price: 4.0 },
        ],
      },
    },
  });

  // NEW: The Peri Peri Grill (America)
  await prisma.restaurant.upsert({
    where: { id: 'rest-america-2' },
    update: {},
    create: {
      id: 'rest-america-2',
      name: 'The Peri Peri Grill',
      regionId: regionAmerica.id,
      menuItems: {
        create: [
          { name: 'Margherita Pizza', price: 10.0 },
          { name: 'Peri-Peri Fries', price: 5.0 },
          { name: 'BBQ Chicken Wings', price: 12.0 },
        ],
      },
    },
  });

  // NEW: Spice Garden (India)
  await prisma.restaurant.upsert({
    where: { id: 'rest-india-2' },
    update: {},
    create: {
      id: 'rest-india-2',
      name: 'Spice Garden',
      regionId: regionIndia.id,
      menuItems: {
        create: [
          { name: 'Paneer Tikka', price: 12.0 },
          { name: 'Masala Chai', price: 2.5 },
          { name: 'Biryani', price: 18.0 },
        ],
      },
    },
  });

  console.log('Restaurants seeded.');
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
