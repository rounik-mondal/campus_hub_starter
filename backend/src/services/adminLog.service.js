import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Only actions taken by college_admins should generally be logged here,
// but we accept any user and check their role
export const logAdminAction = async (userId, actionDescription) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === "college_admin") {
      await prisma.adminLog.create({
        data: {
          action: actionDescription,
          userId: user.id
        }
      });
    }
  } catch (err) {
    console.error("Error logging admin action: ", err);
  }
};

export const getAdminLogsService = async (options) => {
  const { collegeId, startDate, endDate } = options;

  let whereClause = {};

  if (collegeId) {
    whereClause.user = {
      collegeId: collegeId
    };
  }

  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) {
      whereClause.timestamp.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.timestamp.lte = new Date(endDate);
    }
  }

  const logs = await prisma.adminLog.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          college: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  return logs;
};
