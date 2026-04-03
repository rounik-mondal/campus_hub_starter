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
    totalRegistrations,
    feedbacks
  ] = await Promise.all([
    prisma.college.count(),
    prisma.user.count({ where: { role: "college_admin" } }),
    prisma.user.count({ where: { role: "student" } }),
    prisma.event.count(),
    prisma.registration.count(),
    prisma.feedback.findMany({ select: { rating: true } })
  ]);

  // Total Revenue Calculation across all approved registrations mapped to paid events
  const approvedPaidRegistrations = await prisma.registration.findMany({
    where: { status: "approved", event: { isPaid: true } },
    include: { event: { select: { ticketPrice: true } } }
  });
  
  const totalRevenue = approvedPaidRegistrations.reduce((acc, reg) => acc + (reg.event.ticketPrice || 0), 0);
  const averageRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : 0;

  return {
    totalColleges,
    totalAdmins,
    totalStudents,
    totalEvents,
    totalRegistrations,
    totalRevenue,
    averageRating,
    totalFeedbacks: feedbacks.length
  };
};

export const getCollegeAnalyticsService = async (user) => {
  if (user.role !== "college_admin" || !user.collegeId) {
    throw new Error("Only college admin mapped to a college can access this");
  }

  const collegeId = user.collegeId;

  // Total events hosted by the college
  const totalEvents = await prisma.event.count({
    where: { collegeId }
  });

  // Fetch all approved registrations for events hosted by this college
  const approvedRegistrations = await prisma.registration.findMany({
    where: {
      status: "approved",
      event: { collegeId }
    },
    include: {
      event: {
         select: { id: true, title: true, ticketPrice: true, isPaid: true }
      }
    }
  });

  const totalParticipants = approvedRegistrations.length;
  let totalRevenue = 0;
  
  // To find top performing event, we count participants per event
  const participantsPerEvent = {};
  
  approvedRegistrations.forEach(reg => {
    if (reg.event.isPaid) {
      totalRevenue += (reg.event.ticketPrice || 0);
    }
    
    participantsPerEvent[reg.event.id] = participantsPerEvent[reg.event.id] || { count: 0, title: reg.event.title };
    participantsPerEvent[reg.event.id].count += 1;
  });

  let topPerformingEvent = null;
  let maxCount = -1;
  for (const [id, data] of Object.entries(participantsPerEvent)) {
    if (data.count > maxCount) {
      maxCount = data.count;
      topPerformingEvent = { title: data.title, participants: data.count };
    }
  }

  // Proper rating and feedback analysis
  const collegeFeedbacks = await prisma.feedback.findMany({
    where: { event: { collegeId } },
    select: { rating: true }
  });

  const averageRating = collegeFeedbacks.length > 0 ? (collegeFeedbacks.reduce((acc, f) => acc + f.rating, 0) / collegeFeedbacks.length).toFixed(1) : 0;

  // Breakdown of ratings
  const ratingDistribution = { 5:0, 4:0, 3:0, 2:0, 1:0 };
  collegeFeedbacks.forEach(f => {
    ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
  });

  return {
    totalEvents,
    totalParticipants,
    totalRevenue,
    topPerformingEvent,
    averageRating,
    totalFeedbacks: collegeFeedbacks.length,
    ratingDistribution
  };
};
