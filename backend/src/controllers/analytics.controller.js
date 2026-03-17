// src/controllers/analytics.controller.js
import { getPlatformAnalyticsService } from "../services/analytics.service.js";

export const getPlatformAnalytics = async (req, res) => {
  try {
    const analytics = await getPlatformAnalyticsService(req.user);
    res.status(200).json(analytics);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
