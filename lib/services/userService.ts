import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  role?: 'customer' | 'restaurant' | 'admin';
  phoneNumber?: string;
  age?: number;
  gender?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
  role: 'customer' | 'restaurant' | 'admin';
}

export const userService = {
  async create(userData: CreateUserData) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role || 'customer'
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        phoneNumber: true,
        age: true,
        gender: true,
        address: true,
        createdAt: true
      }
    });

    return user;
  },

  async login(loginData: LoginData) {
    // Find user by email and role
    const user = await prisma.user.findFirst({
      where: {
        email: loginData.email,
        role: loginData.role
      }
    });

    if (!user) {
      throw new Error('Invalid credentials or role');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(loginData.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        phoneNumber: user.phoneNumber,
        age: user.age,
        gender: user.gender,
        address: user.address
      },
      token
    };
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        phoneNumber: true,
        age: true,
        gender: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  async findAll(filters?: { 
    role?: 'customer' | 'restaurant' | 'admin'; 
    page?: number; 
    limit?: number; 
  }) {
    const where = filters?.role ? { role: filters.role } : {};
    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters?.limit || 10;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          phoneNumber: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page: filters?.page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }
};