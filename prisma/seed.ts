import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('password', 12);
  await prisma.user.upsert({
    where: { email: 'admin@wyzly.com' },
    update: {},
    create: {
      email: 'admin@wyzly.com',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      phoneNumber: '+1-555-0001'
    }
  });

  // Create restaurant owners
  const restaurantOwners = await Promise.all([
    prisma.user.upsert({
      where: { email: 'pasta@example.com' },
      update: {},
      create: {
        email: 'pasta@example.com',
        username: 'pasta_palace_owner',
        password: await bcrypt.hash('password', 12),
        role: 'restaurant',
        phoneNumber: '+1-555-0101'
      }
    }),
    prisma.user.upsert({
      where: { email: 'sushi@example.com' },
      update: {},
      create: {
        email: 'sushi@example.com',
        username: 'sushi_zen_owner',
        password: await bcrypt.hash('password', 12),
        role: 'restaurant',
        phoneNumber: '+1-555-0102'
      }
    }),
    prisma.user.upsert({
      where: { email: 'burger@example.com' },
      update: {},
      create: {
        email: 'burger@example.com',
        username: 'burger_barn_owner',
        password: await bcrypt.hash('password', 12),
        role: 'restaurant',
        phoneNumber: '+1-555-0103'
      }
    })
  ]);

  // Create restaurants
  const restaurants = await Promise.all([
    prisma.restaurant.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Pasta Palace',
        phoneNumber: '+1-555-1001',
        description: 'Authentic Italian cuisine with handmade pasta',
        ownerId: restaurantOwners[0].id
      }
    }),
    prisma.restaurant.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Sushi Zen',
        phoneNumber: '+1-555-1002',
        description: 'Fresh sushi and Japanese delicacies',
        ownerId: restaurantOwners[1].id
      }
    }),
    prisma.restaurant.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Burger Barn',
        phoneNumber: '+1-555-1003',
        description: 'Gourmet burgers with locally sourced ingredients',
        ownerId: restaurantOwners[2].id
      }
    })
  ]);

  // Create boxes
  const boxes = [
    // Pasta Palace boxes
    {
      title: 'Classic Spaghetti Carbonara Box',
      price: 15.99,
      quantity: 25,
      image: '/images/carbonara-box.jpg',
      restaurantId: restaurants[0].id,
      isAvailable: true
    },
    {
      title: 'Chicken Parmigiana Box',
      price: 18.50,
      quantity: 20,
      image: '/images/chicken-parm-box.jpg',
      restaurantId: restaurants[0].id,
      isAvailable: true
    },
    {
      title: 'Vegetarian Lasagna Box',
      price: 16.75,
      quantity: 15,
      image: '/images/veggie-lasagna-box.jpg',
      restaurantId: restaurants[0].id,
      isAvailable: true
    },
    // Sushi Zen boxes
    {
      title: 'California Roll Combo Box',
      price: 22.00,
      quantity: 30,
      image: '/images/california-combo-box.jpg',
      restaurantId: restaurants[1].id,
      isAvailable: true
    },
    {
      title: 'Salmon Teriyaki Bento Box',
      price: 24.50,
      quantity: 18,
      image: '/images/salmon-bento-box.jpg',
      restaurantId: restaurants[1].id,
      isAvailable: true
    },
    {
      title: 'Vegetarian Sushi Box',
      price: 19.99,
      quantity: 0,
      image: '/images/veggie-sushi-box.jpg',
      restaurantId: restaurants[1].id,
      isAvailable: false
    },
    // Burger Barn boxes
    {
      title: 'Classic Cheeseburger Box',
      price: 12.99,
      quantity: 35,
      image: '/images/cheeseburger-box.jpg',
      restaurantId: restaurants[2].id,
      isAvailable: true
    },
    {
      title: 'BBQ Bacon Burger Box',
      price: 15.50,
      quantity: 28,
      image: '/images/bbq-burger-box.jpg',
      restaurantId: restaurants[2].id,
      isAvailable: true
    }
  ];

  for (const box of boxes) {
    await prisma.box.upsert({
      where: { id: boxes.indexOf(box) + 1 },
      update: {},
      create: box
    });
  }

  // Create some customers
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      username: 'john_doe',
      password: await bcrypt.hash('password', 12),
      role: 'customer',
      phoneNumber: '+1-555-2001'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@wyzly.com / password');
  console.log('🍝 Restaurant: pasta@example.com / password');
  console.log('🍣 Restaurant: sushi@example.com / password');
  console.log('🍔 Restaurant: burger@example.com / password');
  console.log('👥 Customer: customer@example.com / password');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });