import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "heading",
        "text",
        "button",
        "image",
        "divider",
        "header",
        "paragraph",
        "list",
        "image_placeholder",
        "spacer",
        "quote",
      ],
      default: "text",
    },
    content: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    imageData: {
      type: String,
      default: "",
    },
    height: {
      type: String,
      default: "",
    },
    align: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    templateType: {
      type: String,
      default: "newsletter",
      trim: true,
    },
    background: {
      type: String,
      default: "#f8fafc",
    },
    accentColor: {
      type: String,
      default: "#2563eb",
    },
    customLogo: {
      type: String,
      default: "",
    },
    blocks: {
      type: [blockSchema],
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
  },
  { timestamps: true }
);

templateSchema.index({ name: "text", subject: "text", templateType: "text" });

const Template = mongoose.model("Template", templateSchema);

export default Template;
