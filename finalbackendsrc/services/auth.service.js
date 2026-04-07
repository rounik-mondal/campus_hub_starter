// src/services/auth.service.js
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

export const registerUser = async (data) => {
    const { name, email, password, collegeId, collegeName } = data;

    // check existing user
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // TASKS TO BE PERFORMED (ALREADY COMPLETED) - SOLUTIONS BELOW
    // Required input validation – ensures at least one of collegeId or collegeName is provided
    // Mutual exclusivity validation – ensures only one of the two fields is provided
    // Database existence validation – verifies the provided collegeId exists in the database

     // validate college selection logic
    if (!collegeId && !collegeName) {
        throw new Error("Please select a college or specify 'Other'");
    }

    if (collegeId && collegeName) {
        throw new Error("Provide either collegeId or collegeName, not both");
    }

    // verify college exists if collegeId provided
    if (collegeId) {
        const collegeExists = await prisma.college.findUnique({
            where: { id: collegeId },
        });

        if (!collegeExists) {
            throw new Error("Selected college does not exist");
        }
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // build user payload
    const userData = {
        name,
        email,
        password: hashedPassword,
        role: "student", // force student
    };

    // mapped student
    if (collegeId) {
        userData.collegeId = collegeId;
    }

    // unmapped student ("Other")
    if (collegeName) {
        userData.collegeName = collegeName.trim();
    }

    // create user
    const user = await prisma.user.create({
        data: userData,
    });

    return user;
};


export const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    return user;
};