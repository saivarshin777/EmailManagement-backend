import mongoose from "mongoose";

const smsLogSchema = new mongoose.Schema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "mock"],
      default: "sent",
    },
    provider: {
      type: String,
      default: "mock",
    },
    providerMessageId: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const SmsLog = mongoose.model("SmsLog", smsLogSchema);
export default SmsLog;
