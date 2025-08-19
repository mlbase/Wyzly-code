import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface LoginRequest {
  email: string;
  password: string;
  role: 'customer' | 'restaurant' | 'admin';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password, role }: LoginRequest = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and role are required'
      });
    }

    // Find user by email and role
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: role
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials or role'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
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

    // Determine redirect URL based on role
    let redirectUrl = '/feed'; // Default for customers
    if (user.role === 'admin') {
      redirectUrl = '/admin';
    } else if (user.role === 'restaurant') {
      redirectUrl = '/restaurants';
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          phoneNumber: user.phoneNumber
        },
        token,
        redirectUrl
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : 'Unknown error'
        : 'Something went wrong'
    });
  }
}