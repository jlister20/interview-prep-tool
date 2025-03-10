import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Mock user for preview purposes
const mockUser = {
  _id: '60d0fe4f5311236168a109ca',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'user'
};

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // For preview purposes, skip database operations
      console.log('Mock authentication for token with ID:', decoded.id);
      
      // Set mock user
      req.user = {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Middleware to restrict access to specific roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    
    next();
  };
};
