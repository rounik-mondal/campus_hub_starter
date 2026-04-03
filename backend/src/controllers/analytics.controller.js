// src/controllers/analytics.controller.js
import { getPlatformAnalyticsService, getCollegeAnalyticsService } from "../services/analytics.service.js";

export const getPlatformAnalytics = async (req, res) => {
  try {
    if (req.user.role === "super_admin") {
      const analytics = await getPlatformAnalyticsService(req.user);
      return res.status(200).json(analytics);
    } else if (req.user.role === "college_admin") {
      const analytics = await getCollegeAnalyticsService(req.user);
      return res.status(200).json(analytics);
    } else {
      return res.status(403).json({ message: "Not authorized to view analytics" });
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
