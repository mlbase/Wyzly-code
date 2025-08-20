import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role?: 'customer' | 'restaurant_owner';
  phoneNumber?: string;
  age?: number;
  gender?: string;
  address?: string;
}

interface RegisterResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      username: string;
      role: string;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const {
      email,
      username,
      password,
      confirmPassword,
      role = 'customer',
      phoneNumber,
      age,
      gender,
      address
    }: RegisterRequest = req.body;

    // Input validation
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, username, password, and confirm password are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters long'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    // Role validation
    if (role && !['customer', 'restaurant_owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be customer or restaurant_owner'
      });
    }

    // Age validation
    if (age && (age < 13 || age > 120)) {
      return res.status(400).json({
        success: false,
        error: 'Age must be between 13 and 120'
      });
    }

    // Phone number validation
    if (phoneNumber && phoneNumber.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Phone number cannot exceed 20 characters'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      } else {
        return res.status(409).json({
          success: false,
          error: 'Username already taken'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        role,
        phoneNumber: phoneNumber?.trim() || null,
        age: age || null,
        gender: gender?.trim() || null,
        address: address?.trim() || null
      }
    });

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', [
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    ]);

    // Return success response (exclude sensitive data)
    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
}