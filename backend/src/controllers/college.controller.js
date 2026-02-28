// src/controllers/college.controller.js

import {
  createCollegeService,
  listCollegesService,
  createCollegeAdminService,
} from "../services/college.service.js";

export const createCollege = async (req, res) => {
  try {
    const college = await createCollegeService(req.body, req.user);

    res.status(201).json({
      message: "College created successfully",
      college,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const listColleges = async (req, res) => {
  try {
    const colleges = await listCollegesService();

    res.json({
      count: colleges.length,
      colleges,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createCollegeAdmin = async (req, res) => {
  try {
    const admin = await createCollegeAdminService(req.body, req.user);

    res.status(201).json({
      message: "College admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        collegeId: admin.collegeId,
      },
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};