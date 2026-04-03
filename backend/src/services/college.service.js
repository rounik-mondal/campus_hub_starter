// src/services/college.service.js

import prisma from "../config/prisma.js";

// Create college (super_admin only)
export const createCollegeService = async (data, user) => {
  if (user.role !== "super_admin") {
    throw new Error("Only super admin can create colleges");
  }

  const { name } = data;

  if (!name || !name.trim()) {
    throw new Error("College name is required");
  }

  const existing = await prisma.college.findUnique({
    where: { name: name.trim() },
  });

  if (existing) {
    throw new Error("College already exists");
  }

  const college = await prisma.college.create({
    data: {
      name: name.trim(),
    },
  });

  // audit log
  await prisma.adminLog.create({
    data: {
      action: `Created college: ${college.name}`,
      userId: user.id,
    },
  });

  return college;
};

// List colleges (for dropdown)
export const listCollegesService = async () => {
  const colleges = await prisma.college.findMany({
    where: {
      id: {
        not: "ae117d86-66d0-464c-86b3-c76e53f67fcc",
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return colleges;
};

// List college_admin (for dropdown): TASK
export const listCollegeAdminService = async()=>{
  const admins = await prisma.user.findMany({
    where:{
      role:{
        in: ["college_admin"]
      },
    },
    orderBy: {createdAt: "asc"},
  });
  return admins;
}

// Create college admin (super_admin only)
export const createCollegeAdminService = async (data, user) => {
  if (user.role !== "super_admin") {
    throw new Error("Only super admin can create college admins");
  }

  const { name, email, password, collegeId } = data;

  if (!collegeId) {
    throw new Error("collegeId is required");
  }

  // verify college exists
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
  });

  if (!college) {
    throw new Error("College not found");
  }

  // check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const bcrypt = (await import("bcrypt")).default;
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "college_admin",
      collegeId,
    },
  });

  // audit log
  await prisma.adminLog.create({
    data: {
      action: `Created college_admin: ${admin.email}`,
      userId: user.id,
    },
  });

  return admin;
};

// Get deeper college details (super_admin)
export const getDeepCollegesService = async (user) => {
  if (user.role !== "super_admin") {
    throw new Error("Only super admin can fetch deep college details");
  }

  return prisma.college.findMany({
    include: {
      users: {
        where: { role: "college_admin" },
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: { events: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

// Revoke college admin
export const revokeCollegeAdminService = async (collegeId, userIdToRevoke, requester) => {
  if (requester.role !== "super_admin") {
    throw new Error("Only super admin can revoke admins");
  }

  const targetAdmin = await prisma.user.findFirst({
    where: { 
      id: userIdToRevoke, 
      collegeId: collegeId,
      role: "college_admin" 
    }
  });

  if (!targetAdmin) {
    throw new Error("Specified user is not an admin of this college");
  }

  const updated = await prisma.user.update({
    where: { id: userIdToRevoke },
    data: { 
      role: "student",
      collegeId: null
    }
  });

  await prisma.adminLog.create({
    data: {
      action: `Revoked college_admin role for user: ${targetAdmin.email} from college ${collegeId}`,
      userId: requester.id
    }
  });

  return updated;
};

