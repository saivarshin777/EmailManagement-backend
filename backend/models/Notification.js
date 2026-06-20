import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["campaign", "system", "warning", "growth"],
      default: "system",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      default: "Just now",
    },
    read: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ title: "text", desc: "text", type: "text" });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
