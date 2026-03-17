// src/services/analytics.service.js
import prisma from "../config/prisma.js";

export const getPlatformAnalyticsService = async (user) => {
  if (user.role !== "super_admin") {
    throw new Error("Only super admin can access platform analytics");
  }

  const [
    totalColleges,
    totalAdmins,
    totalStudents,
    totalEvents,
    totalRegistrations
  ] = await Promise.all([
    prisma.college.count(),
    prisma.user.count({ where: { role: "college_admin" } }),
    prisma.user.count({ where: { role: "student" } }),
    prisma.event.count(),
    prisma.registration.count()
  ]);

  const rawEventsPerCollege = await prisma.event.groupBy({
    by: ['collegeId'],
    _count: {
      id: true
    }
  });

  const rawRegistrationsPerEvent = await prisma.registration.groupBy({
    by: ['eventId'],
    _count: {
      id: true
    }
  });

  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  
  const roleDistribution = roles.map(r => ({ role: r.role, count: r._count.id }));

  return {
    totalColleges,
    totalAdmins,
    totalStudents,
    totalEvents,
    totalRegistrations,
    eventsPerCollege: rawEventsPerCollege.map(r => ({ collegeId: r.collegeId, count: r._count.id })),
    roleDistribution,
    registrationsPerEvent: rawRegistrationsPerEvent.map(r => ({ eventId: r.eventId, count: r._count.id }))
  };
};
