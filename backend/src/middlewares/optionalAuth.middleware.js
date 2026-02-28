// src/middlewares/optionalAuth.middleware.js

import { verifyToken } from "../utils/jwt.js";

export const optionalProtect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // allow guest
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    // ignore invalid token for public routes
    next();
  }
};