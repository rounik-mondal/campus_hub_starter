// src/controllers/auth.controller.js

import { registerUser, loginUser } from "../services/auth.service.js";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    // include collegeId for RBAC + visibility of events
    const token = signToken({
      id: user.id,
      role: user.role,
      collegeId: user.collegeId ?? null,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    // include collegeId here as well
    const token = signToken({
      id: user.id,
      role: user.role,
      collegeId: user.collegeId ?? null,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};