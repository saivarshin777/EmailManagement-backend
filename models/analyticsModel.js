import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true
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
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Analytics",
  analyticsSchema
);