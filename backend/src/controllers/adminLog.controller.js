import { getAdminLogsService } from "../services/adminLog.service.js";

export const getAdminLogs = async (req, res) => {
  try {
    const { collegeId, startDate, endDate } = req.query;

    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access Restricted to Super Admins" });
    }

    const logs = await getAdminLogsService({ collegeId, startDate, endDate });

    res.status(200).json({ logs });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
