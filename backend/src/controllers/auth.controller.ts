import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Mock user for preview purposes
const mockUser = {
  _id: '60d0fe4f5311236168a109ca',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'user'
};

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // For preview purposes, skip database operations
    console.log('Mock registration for:', email);
    
    // Simulate user creation
    const user = {
      _id: mockUser._id,
      name,
      email,
      role: 'user'
    };

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString())
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // For preview purposes, skip database operations
    console.log('Mock login for:', email);
    
    // Always succeed with mock user for demo purposes
    if (email === 'demo@example.com' || email === mockUser.email) {
      res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        token: generateToken(mockUser._id)
      });
    } else {
      // For any other email, also succeed but with user details from the request
      res.json({
        _id: mockUser._id,
        name: email.split('@')[0], // Use part of email as name
        email: email,
        role: 'user',
        token: generateToken(mockUser._id)
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // For preview purposes, skip database operations
    console.log('Mock getMe for user ID:', req.user?._id);
    
    // Return mock user data
    res.json({
      _id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};
