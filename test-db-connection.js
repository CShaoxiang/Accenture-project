const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/ideahub?schema=public'
    }
  }
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.log('❌ Failed to connect to PostgreSQL');
    console.log('Error:', error.message);
    process.exit(1);
  }
}

testConnection();
