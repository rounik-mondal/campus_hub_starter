// src/middlewares/auth.middleware.js

import { verifyToken } from '../utils/jwt.js';

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// role-based access
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};