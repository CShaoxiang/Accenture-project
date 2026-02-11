const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@ideahub.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: admin@ideahub.com');
    console.log('Password: admin123');
    console.log('');
    console.log('You can now login at http://localhost:3000');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Admin user already exists!');
      console.log('');
      console.log('Login credentials:');
      console.log('Email: admin@ideahub.com');
      console.log('Password: admin123');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdminUser();
