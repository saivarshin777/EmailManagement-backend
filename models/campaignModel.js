import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    content: {
      type: String,
      required: true
    },

    recipients: [
      {
        email: {
          type: String,
          required: true
        }
      }
    ],

    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "sent"
      ],
      default: "draft"
    },

    scheduledTime: {
      type: Date
    },

    sentCount: {
      type: Number,
      default: 0
    },

    deliveredCount: {
      type: Number,
      default: 0
    },

    openedCount: {
      type: Number,
      default: 0
    },

    clickedCount: {
      type: Number,
      default: 0
    },

    failedCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default
mongoose.models.Campaign ||
mongoose.model(
  "Campaign",
  campaignSchema
);