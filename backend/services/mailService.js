import nodemailer from "nodemailer";

const requiredEmailConfig = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS"];

const getMissingEmailConfig = () =>
  requiredEmailConfig.filter((key) => !process.env[key]);

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const getDefaultRecipients = () =>
  (process.env.CAMPAIGN_DEFAULT_RECIPIENTS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

export const normalizeRecipients = (recipients) => {
  if (Array.isArray(recipients)) {
    return recipients.map((email) => String(email).trim()).filter(Boolean);
  }

  return String(recipients || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

export const sendCampaignEmail = async ({ recipients, subject, htmlContent, textContent }) => {
  const missing = getMissingEmailConfig();

  if (missing.length) {
    throw new Error(`Missing email configuration: ${missing.join(", ")}`);
  }

  if (!recipients.length) {
    throw new Error("No email recipients were provided.");
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipients,
    subject,
    html: htmlContent,
    text: textContent,
  });
};
