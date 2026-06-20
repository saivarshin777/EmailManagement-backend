import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    recipients: {
      type: [String],
      default: [],
    },
    subject: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
    },
    providerMessageId: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
