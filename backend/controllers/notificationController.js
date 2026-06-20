import Notification from "../models/Notification.js";
import { toClientNotification } from "../services/dashboardService.js";

export const getNotifications = async (_req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json(notifications.map(toClientNotification));
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true, isRead: true });
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json(notifications.map(toClientNotification));
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (_req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { read: false },
          { read: { $exists: false } },
          { isRead: false },
          { isRead: { $exists: false } },
        ],
      },
      { read: true, isRead: true }
    );
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json(notifications.map(toClientNotification));
  } catch (error) {
    next(error);
  }
};
