import Notification from "../models/notificationModel.js";

export const getNotifications =
  async (req, res) => {

    try {

      const notifications =
        await Notification.find()
          .sort({
            createdAt: -1
          });

      res.status(200).json(
        notifications
      );

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  };

export const markAsRead =
  async (req, res) => {

    try {

      const notification =
        await Notification.findByIdAndUpdate(
          req.params.id,
          {
            isRead: true
          },
          {
            new: true
          }
        );

      res.status(200).json(
        notification
      );

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  };

export const deleteNotification =
  async (req, res) => {

    try {

      await Notification.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "Notification deleted"
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  };