const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('========================================');
    console.log('Creating Test User');
    console.log('========================================\n');

    const username = 'testuser';
    const password = 'password123';
    const name = 'Test User';

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      console.log('❌ User already exists!');
      console.log(`Username: ${username}`);
      console.log('\nTry logging in with:');
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: 'recruiter',
      },
    });

    console.log('✅ Test user created successfully!\n');
    console.log('Login credentials:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${user.role}`);
    console.log('\nGo to http://localhost:3000/login to sign in!');
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
