import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    recipients: {
      type: [String],
      default: [],
    },
    htmlContent: {
      type: String,
      default: "",
    },
    textContent: {
      type: String,
      default: "",
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
    templateName: {
      type: String,
      default: "",
    },
    contactList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContactList",
      default: null,
    },
    contactListName: {
      type: String,
      default: "",
    },
    sendStatus: {
      type: String,
      enum: ["draft", "pending", "sent", "failed"],
      default: "pending",
    },
    sendError: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Running", "Draft", "Failed"],
      default: "Running",
    },
    emailsSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    delivered: {
      type: Number,
      default: 0,
      min: 0,
    },
    opened: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicked: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

campaignSchema.index({ name: "text", subject: "text", status: "text" });
campaignSchema.index({ createdAt: -1, status: 1 });
campaignSchema.index({ sendStatus: 1, createdAt: -1 });

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
