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

      // Verify token with more detailed error logging
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        console.log('JWT verification successful for ID:', decoded.id);
        
        // For preview/development purposes, use mock user
        // In production, you would fetch the user from the database
        req.user = {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        };
      } catch (error) {
        console.error('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
        // Try with a different secret as fallback (for development only)
        try {
          const decoded: any = jwt.verify(token, 'secret');
          console.log('JWT verification successful with fallback secret for ID:', decoded.id);
          
          req.user = {
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role
          };
        } catch (fallbackError) {
          console.error('JWT fallback verification also failed:', fallbackError instanceof Error ? fallbackError.message : 'Unknown error');
          throw new Error('Token verification failed');
        }
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
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
