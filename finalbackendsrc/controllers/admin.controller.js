// src/controllers/admin.controller.js

import { getPlatformOverviewService } from "../services/admin.service.js";


export const getPlatformOverview = async (req, res) => {
  try {

    const overview = await getPlatformOverviewService(req.user);

    return res.status(200).json({
      success: true,
      message: "Platform overview fetched successfully",
      data: overview
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};