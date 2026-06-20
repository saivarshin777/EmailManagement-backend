import Campaign from "../models/Campaign.js";
import Contact from "../models/Contact.js";
import Notification from "../models/Notification.js";
import { buildAnalytics, buildDashboard } from "../services/dashboardService.js";

export const getDashboard = async (_req, res, next) => {
  try {
    const [campaigns, notifications] = await Promise.all([
      Campaign.find().sort({ createdAt: -1 }).lean(),
      Notification.find().sort({ createdAt: -1 }).lean(),
    ]);

    res.json(buildDashboard(campaigns, notifications));
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (_req, res, next) => {
  try {
    const [campaigns, contacts, notifications] = await Promise.all([
      Campaign.find().sort({ createdAt: -1 }).lean(),
      Contact.find().sort({ createdAt: -1 }).lean(),
      Notification.find().sort({ createdAt: -1 }).lean(),
    ]);

    res.json(buildAnalytics(campaigns, contacts, notifications));
  } catch (error) {
    next(error);
  }
};
